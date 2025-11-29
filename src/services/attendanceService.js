import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

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
