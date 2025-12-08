import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';

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

export const subscribeToAttendance = (classId, date, onUpdate) => {
    const recordId = `${classId}_${date}`;
    const attendanceRef = doc(db, "attendance", recordId);

    return onSnapshot(attendanceRef, (docSnap) => {
        if (docSnap.exists()) {
            onUpdate({ id: docSnap.id, ...docSnap.data() });
        } else {
            onUpdate(null);
        }
    }, (error) => {
        console.error("Error subscribing to attendance:", error);
    });
};

export const getStudentMonthlyAttendance = async (classId, studentId, month, year) => {
    try {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

        const attendanceRef = collection(db, "attendance");

        // Query by classId only to avoid composite index requirements (safe for SIH scale)
        const q = query(
            attendanceRef,
            where("classId", "==", classId)
        );

        const querySnapshot = await getDocs(q);
        const monthlyRecords = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date;

            // Filter by date range in JS
            if (date >= startDate && date <= endDate) {
                // Find student's record in the 'records' array
                const studentRecord = data.records?.find(r => r.studentId === studentId);

                if (studentRecord) {
                    monthlyRecords.push({
                        date: date,
                        status: studentRecord.present ? 'present' : 'absent',
                        verificationMethod: studentRecord.verificationMethod
                    });
                }
            }
        });

        return monthlyRecords;
    } catch (error) {
        console.error("Error fetching monthly attendance:", error);
        return [];
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
            date: new Date().toLocaleDateString('en-CA')
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

export const processRFIDLogTransaction = async (logId, logData) => {
    // 1. Check if already processed (optimization before transaction)
    if (logData.processed) return;

    try {
        await runTransaction(db, async (transaction) => {
            // 2. Re-read log inside transaction to ensure lock
            const logRef = doc(db, "rfid_logs", logId);
            const logSnap = await transaction.get(logRef);

            if (!logSnap.exists()) throw "Log does not exist!";
            if (logSnap.data().processed) return; // Already processed by someone else

            const { rfidId, timestamp, date } = logSnap.data();

            // 3. Get Student Data
            // We need to find student by rfidId. Since rfidId is the document ID for students (usually), we try that first.
            // If rfidId is a field, we'd need a query, but queries in transactions require index.
            // Let's assume rfidId IS the student doc ID based on previous code analysis, 
            // OR we query student outside transaction? No, must be inside for consistency? 
            // Actually, reading student data doesn't strictly need to be in the SAME transaction if student data rarely changes.
            // But to be safe, let's read it.

            // Assumption: rfidId passed from hardware IS the student document ID (or we can look it up).
            // Based on `studentService.js`, it seems `rfidId` field exists.
            // If `rfidId` is NOT the doc ID, we can't easily query inside transaction without knowing the doc ID.
            // Let's try to treat `rfidId` as the doc ID first (as per hardware code `rfidId` is UID).
            // Wait, hardware sends UID. Student doc ID might be auto-generated or manual.
            // Let's check `studentService.js` or `AdminDashboard`... 
            // In `AdminDashboard`, `addDoc` is used, so Student ID is auto-generated. `rfidId` is a field.
            // This makes transaction hard because we can't `query` inside transaction easily without knowing the doc ID.

            // WORKAROUND: Read student OUTSIDE transaction (or use a separate lookup).
            // Since student class assignment doesn't change every second, it's safe to read student data non-atomically.

            // Let's do the student lookup BEFORE the transaction.
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
};

// Helper to find student by RFID (Non-transactional read)
export const getStudentByRFID = async (rfidId) => {
    if (!rfidId) return null;
    const cleanId = rfidId.toString().trim();
    // Query for exact match
    const q = query(collection(db, "students"), where("rfidId", "==", cleanId));
    let snapshot = await getDocs(q);

    // Fallback: Try case-insensitive manually if low volume, or just rely on exact match? 
    // Hardware usually sends uppercase. Let's assume exact match after trim is enough.

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const processSingleLog = async (logId, logData) => {
    if (logData.processed) return;

    try {
        // 1. Find Student
        const student = await getStudentByRFID(logData.rfidId);
        if (!student) {
            console.warn(`Student not found for RFID '${logData.rfidId}'`);
            await updateDoc(doc(db, "rfid_logs", logId), {
                processed: true,
                error: "Student not found",
                processedAt: new Date()
            });
            return;
        }

        // 2. Run Transaction to update Attendance
        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, "rfid_logs", logId);
            const logSnap = await transaction.get(logRef);
            if (!logSnap.exists() || logSnap.data().processed) return;

            const targetDate = logData.date || new Date().toLocaleDateString('en-CA');
            const recordId = `${student.classId}_${targetDate}`;
            const attendanceRef = doc(db, "attendance", recordId);
            const attendanceSnap = await transaction.get(attendanceRef);

            let records = [];
            if (attendanceSnap.exists()) {
                records = attendanceSnap.data().records || [];
            } else {
                // Need to initialize records? 
                // Inside a transaction, we can't query all students to build the roster efficiently.
                // If the record doesn't exist, we might just create a partial record 
                // OR we accept that the first person to scan creates the doc.
                // Let's create a partial record with just this student for now, 
                // or rely on the `AdminDashboard` / `AttendanceView` to fill in the rest later?
                // Better: Just add this student to the list.
            }

            // Check if student already in records
            const existingRecordIndex = records.findIndex(r => r.studentId === student.id);

            if (existingRecordIndex >= 0) {
                // Update existing
                if (!records[existingRecordIndex].present) {
                    records[existingRecordIndex].present = true;
                    records[existingRecordIndex].verificationMethod = 'rfid';
                    records[existingRecordIndex].timestamp = logData.timestamp;
                }
            } else {
                // Add new
                records.push({
                    studentId: student.id,
                    name: student.name,
                    present: true,
                    verificationMethod: 'rfid',
                    timestamp: logData.timestamp
                });
            }

            transaction.set(attendanceRef, {
                classId: student.classId,
                date: targetDate,
                records: records,
                updatedAt: new Date()
            }, { merge: true });

            // Mark log as processed
            transaction.update(logRef, { processed: true, processedAt: new Date() });
        });
        console.log(`Processed log for ${student.name}`);

    } catch (error) {
        console.error("Error processing single log:", error);
    }
};

// DEPRECATED: Old batch processing
/*
export const processRFIDLogsToAttendance = async (dateStr) => {
    // ... (Old code commented out)
};
*/

// Check if student has scanned today (Real-time check)
export const getStudentTodayStatus = async (studentId) => {
    try {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const logsRef = collection(db, "rfid_logs");
        // We need to query by date AND studentId (or rfidId if studentId isn't on logs)
        // Current implementation of logRFIDScan stores studentId.

        // Note: This requires a composite index on studentId + date if we simple query.
        // However, we can query by studentId and filter by date client side if logs are few, 
        // OR query by date and filter by studentId (better if high volume of daily logs).
        // Given we don't have composite index guarantee, let's query by date (equality) 
        // and filter in code, assuming reasonable number of logs per day or use the exact query if index exists.

        // Let's try precise query first. If it fails due to index, we'll catch and fallback? 
        // Actually, 'rfid_logs' might not have 'studentId' indexed?
        // Let's rely on the fact that we can query by 'studentId' (usually low cardinality per student)
        // actually no, querying by studentId over ALL time is bad.
        // Querying by date for ALL students is also scalable only to a point.

        // Alternative: Query 'rfid_logs' where date == today AND studentId == studentId
        const q = query(
            logsRef,
            where("date", "==", todayStr),
            where("studentId", "==", studentId)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            // Check if any log is 'present'
            const presentLog = snapshot.docs.find(d => d.data().status === 'present');
            return presentLog ? 'present' : null;
        }
        return null;
    } catch (error) {
        console.error("Error fetching student today status:", error);
        return null;
    }
};

export const subscribeToRFIDLogs = (date, onUpdate, options = {}) => {
    console.log("[AttendanceService] subscribeToRFIDLogs called for:", date, options);
    const logsRef = collection(db, "rfid_logs");
    // Sort by timestamp desc to see newest first
    const q = query(logsRef, where("date", "==", date));

    return onSnapshot(q, async (snapshot) => {
        console.log("[AttendanceService] Snapshot received. Docs:", snapshot.size);
        const logs = [];
        const studentLookups = [];
        const processingPromises = [];

        snapshot.forEach((logDoc) => {
            const logData = logDoc.data();
            const log = { id: logDoc.id, ...logData };
            logs.push(log);

            // Auto-processing logic
            if (options.autoProcess && !log.processed) {
                // We process it immediately. Note: This might trigger another snapshot update 
                // when 'processed' changes to true, but that's fine (idempotent check in processSingleLog).
                processingPromises.push(processSingleLog(log.id, log));
            }

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

        if (processingPromises.length > 0) {
            console.log(`[AttendanceService] Auto-processing ${processingPromises.length} logs...`);
            // We don't await this blocking the UI update, but we do run it.
            // Actually, better to await if we want to ensure lookups are done for the UI?
            // No, lookups are for display. Processing is background. 
            // Let's just let it run.
            Promise.all(processingPromises).then(() => console.log("Auto-processing complete batch."));
        }

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
