import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export const markAttendance = async (attendanceData) => {
    try {
        // Create a unique ID for the attendance record based on class and date
        // Format: classId_date (YYYY-MM-DD)
        const recordId = `${attendanceData.classId}_${attendanceData.date}`;
        const attendanceRef = doc(db, "attendance", recordId);

        await setDoc(attendanceRef, {
            ...attendanceData,
            updatedAt: new Date()
        }, { merge: true });

        return recordId;
    } catch (error) {
        console.error("Error marking attendance:", error);
        throw error;
    }
};

export const getAttendanceByDate = async (classId, date) => {
    try {
        const recordId = `${classId}_${date}`;
        const attendanceRef = doc(db, "attendance", recordId);
        const docSnap = await getDoc(attendanceRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        throw error;
    }
};

export const logRFIDScan = async (student, classId, status) => {
    try {
        const logRef = doc(collection(db, "rfid_logs"));
        await setDoc(logRef, {
            studentId: student.id,
            studentName: student.name,
            rfidId: student.rfidId,
            classId: classId,
            status: status, // 'present' or 'absent' (toggle)
            timestamp: new Date(),
            date: new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        console.error("Error logging RFID scan:", error);
        // Don't throw, just log error so it doesn't block attendance marking
    }
};

export const getRFIDLogsByDate = async (date) => {
    try {
        const logsRef = collection(db, "rfid_logs");
        // Fetch recent logs (limit 50) instead of strict date filtering to avoid timezone issues
        // We get all docs then sort/filter client side for simplicity without composite indexes
        const q = query(logsRef);

        const querySnapshot = await getDocs(q);
        const logs = [];
        const studentLookups = [];

        querySnapshot.forEach((logDoc) => {
            const logData = logDoc.data();
            const log = { id: logDoc.id, ...logData };
            logs.push(log);

            // If studentName is missing but we have rfidId, we need to fetch student details
            if (!log.studentName && log.rfidId) {
                const studentRef = doc(db, "students", log.rfidId);
                studentLookups.push(
                    getDoc(studentRef).then(studentSnap => {
                        if (studentSnap.exists()) {
                            const studentData = studentSnap.data();
                            log.studentName = studentData.name;
                            log.classId = studentData.classId;
                        } else {
                            log.studentName = "Unknown ID";
                            log.classId = "N/A";
                        }
                    }).catch(err => {
                        console.warn(`Failed to lookup student for log ${log.id}:`, err);
                        log.studentName = "Lookup Error";
                        log.classId = "Error";
                    })
                );
            }
        });

        if (studentLookups.length > 0) {
            await Promise.all(studentLookups);
        }

        // Sort by timestamp descending
        const sortedLogs = logs.sort((a, b) => {
            const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp).getTime();
            const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp).getTime();
            return timeB - timeA;
        });

        return sortedLogs.slice(0, 50); // Return top 50 recent
    } catch (error) {
        console.error("Error fetching RFID logs:", error);
        return [];
    }
};

export const processRFIDLogsToAttendance = async (dateStr) => {
    try {
        const targetDate = dateStr || new Date().toISOString().split('T')[0];

        // 1. Fetch all RFID logs for today
        // We need to query by date this time to ensure we only process today's logs
        // If the date field in logs is reliable (which we fixed in hardware), this works.
        const logsRef = collection(db, "rfid_logs");
        const q = query(logsRef, where("date", "==", targetDate));
        const logsSnap = await getDocs(q);

        if (logsSnap.empty) {
            return { success: true, message: "No logs found for today." };
        }

        // 2. Group present students by class
        const classAttendanceMap = {}; // { classId: Set(studentId) }

        logsSnap.forEach(doc => {
            const data = doc.data();
            // Only process if we have a valid classId (enriched logs or looked up)
            // Note: The logs in DB might not have classId if hardware sent only ID.
            // We need to look up classId for each unique RFID if missing.
            // However, for efficiency, let's assume we need to look up student details for all unique RFIDs found.
        });

        // Let's gather all unique RFID IDs first
        const uniqueRfids = new Set();
        logsSnap.forEach(doc => uniqueRfids.add(doc.data().rfidId));

        // 3. Fetch student details for these RFIDs to know their Class ID
        const studentMap = {}; // { rfidId: { id, classId, name } }

        // We can't do a "where in" query for > 10 items easily without batching.
        // So we'll fetch them individually or fetch all students (if dataset small).
        // Let's fetch individually for now as it's safer for large datasets than fetching ALL students.
        await Promise.all(Array.from(uniqueRfids).map(async (rfidId) => {
            if (!rfidId) return;
            const studentRef = doc(db, "students", rfidId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
                studentMap[rfidId] = studentSnap.data();
            }
        }));

        // 4. Organize into Class Buckets
        const updatesByClass = {}; // { classId: [studentId1, studentId2] }

        logsSnap.forEach(doc => {
            const rfidId = doc.data().rfidId;
            const student = studentMap[rfidId];
            if (student && student.classId) {
                if (!updatesByClass[student.classId]) {
                    updatesByClass[student.classId] = new Set();
                }
                updatesByClass[student.classId].add(student.id); // Use student document ID (which is rfidId usually)
            }
        });

        // 5. Update Attendance Records for each Class
        let updatedClassesCount = 0;

        for (const [classId, presentStudentIds] of Object.entries(updatesByClass)) {
            // Fetch existing attendance record
            const recordId = `${classId}_${targetDate}`;
            const attendanceRef = doc(db, "attendance", recordId);
            const attendanceSnap = await getDoc(attendanceRef);

            let records = [];

            if (attendanceSnap.exists()) {
                records = attendanceSnap.data().records || [];
            } else {
                // If no record exists, we need to fetch ALL students for this class to create the roster
                // This avoids creating a record with ONLY present students (marking everyone else implicitly absent? or missing?)
                // Usually better to have the full roster.
                const studentsRef = collection(db, "students");
                const qStudents = query(studentsRef, where("classId", "==", classId));
                const studentsSnap = await getDocs(qStudents);

                studentsSnap.forEach(sDoc => {
                    const sData = sDoc.data();
                    records.push({
                        studentId: sDoc.id,
                        name: sData.name,
                        present: false,
                        verificationMethod: null
                    });
                });
            }

            // Update the records
            let hasChanges = false;
            const updatedRecords = records.map(record => {
                if (presentStudentIds.has(record.studentId)) {
                    if (!record.present || record.verificationMethod !== 'rfid') {
                        hasChanges = true;
                        return { ...record, present: true, verificationMethod: 'rfid' };
                    }
                }
                return record;
            });

            // If we created a new record, we might have missed students who are in the logs but not in the 'records' list 
            // (e.g. if student changed class but log is old? Unlikely case).
            // But if we just fetched the roster, we are good.

            if (hasChanges || !attendanceSnap.exists()) {
                await setDoc(attendanceRef, {
                    classId,
                    date: targetDate,
                    records: updatedRecords,
                    updatedAt: new Date()
                }, { merge: true });
                updatedClassesCount++;
            }
        }

        return { success: true, message: `Synced attendance for ${updatedClassesCount} classes.` };

    } catch (error) {
        console.error("Error processing RFID logs:", error);
        throw error;
    }
};

export const subscribeToRFIDLogs = (date, onUpdate) => {
    const logsRef = collection(db, "rfid_logs");
    const q = query(logsRef, where("date", "==", date));

    return onSnapshot(q, async (snapshot) => {
        const logs = [];
        const studentLookups = [];

        snapshot.forEach((logDoc) => {
            const logData = logDoc.data();
            const log = { id: logDoc.id, ...logData };
            logs.push(log);

            if (!log.studentName && log.rfidId) {
                const studentRef = doc(db, "students", log.rfidId);
                studentLookups.push(
                    getDoc(studentRef).then(studentSnap => {
                        if (studentSnap.exists()) {
                            const studentData = studentSnap.data();
                            log.studentName = studentData.name;
                            log.classId = studentData.classId;
                        } else {
                            log.studentName = "Unknown ID";
                            log.classId = "N/A";
                        }
                    }).catch(err => {
                        log.studentName = "Lookup Error";
                        log.classId = "Error";
                    })
                );
            }
        });

        if (studentLookups.length > 0) {
            await Promise.all(studentLookups);
        }

        const sortedLogs = logs.sort((a, b) => {
            const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp).getTime();
            const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp).getTime();
            return timeB - timeA;
        });

        onUpdate(sortedLogs.slice(0, 50));
    });
};
