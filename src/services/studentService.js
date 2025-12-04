import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore';

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

export const getStudentById = async (studentId) => {
    try {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
            return { id: studentSnap.id, ...studentSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching student:", error);
        throw error;
    }
};

export const getStudentByParentEmail = async (parentEmail) => {
    try {
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("parentEmail", "==", parentEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching student by parent email:", error);
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

export const updateStudent = async (studentId, updateData) => {
    try {
        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, updateData);
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
};

export const getAllStudents = async () => {
    try {
        const q = query(collection(db, "students"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
};

export const deleteStudent = async (studentId) => {
    try {
        await deleteDoc(doc(db, "students", studentId));
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
};
