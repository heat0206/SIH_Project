import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';

export const addStudent = async (studentData, rfidId) => {
    try {
        // Use the RFID ID as the document ID
        const studentRef = doc(db, "students", rfidId);

        await setDoc(studentRef, {
            ...studentData,
            id: rfidId, // Store ID inside the document as well for easier access
            rfidId: rfidId,
            createdAt: new Date()
        });

        return rfidId;
    } catch (error) {
        console.error("Error adding student:", error);
        throw error;
    }
};

export const getStudentsByClass = async (classId) => {
    try {
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("classId", "==", classId));

        const querySnapshot = await getDocs(q);
        const students = [];

        querySnapshot.forEach((doc) => {
            students.push({ id: doc.id, ...doc.data() });
        });

        return students;
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
};

export const updateStudentClass = async (studentId, classId, className) => {
    try {
        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, {
            classId: classId,
            className: className
        });
    } catch (error) {
        console.error("Error updating student class:", error);
        throw error;
    }
};
