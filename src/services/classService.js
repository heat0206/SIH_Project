import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';


export const getTeacherClasses = async (teacherId) => {
    try {
        const classesRef = collection(db, "classes");

        // 1. Get classes where user is the Class Teacher
        const q1 = query(classesRef, where("teacherId", "==", teacherId));
        const snapshot1 = await getDocs(q1);

        // 2. Get classes where user is a Subject Teacher
        const q2 = query(classesRef, where("subjectTeacherIds", "array-contains", teacherId));
        const snapshot2 = await getDocs(q2);

        const classesMap = new Map();

        snapshot1.forEach((doc) => {
            classesMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        snapshot2.forEach((doc) => {
            if (!classesMap.has(doc.id)) {
                classesMap.set(doc.id, { id: doc.id, ...doc.data() });
            }
        });

        return Array.from(classesMap.values());
    } catch (error) {
        console.error("Error fetching teacher classes:", error);
        throw error;
    }
};

export const getAllClasses = async () => {
    try {
        const classesRef = collection(db, "classes");
        const querySnapshot = await getDocs(classesRef);
        const classes = [];
        querySnapshot.forEach((doc) => {
            classes.push({ id: doc.id, ...doc.data() });
        });
        return classes;
    } catch (error) {
        console.error("Error fetching all classes:", error);
        throw error;
    }
};

export const createClass = async (classData) => {
    try {
        const classesRef = collection(db, "classes");
        const docRef = await addDoc(classesRef, {
            ...classData,
            createdAt: new Date(),
            subjectTeachers: [],
            subjectTeacherIds: []
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating class:", error);
        throw error;
    }
};

export const assignClassTeacher = async (classId, teacherId, teacherName) => {
    try {
        const classRef = doc(db, "classes", classId);
        await updateDoc(classRef, {
            teacherId: teacherId,
            teacherName: teacherName
        });
    } catch (error) {
        console.error("Error assigning class teacher:", error);
        throw error;
    }
};

// Alias for backward compatibility if needed, or just use assignClassTeacher
export const assignTeacherToClass = assignClassTeacher;

export const addSubjectTeacher = async (classId, teacherId, teacherName, subject) => {
    try {
        const classRef = doc(db, "classes", classId);
        // We need to get the current class data to append to the array
        // Firestore arrayUnion could work but we have objects, which need exact match to remove.
        // Let's read-modify-write for safety with objects or use arrayUnion if we are sure of uniqueness.
        // Better: arrayUnion works for adding.

        await updateDoc(classRef, {
            subjectTeachers: arrayUnion({
                id: teacherId,
                name: teacherName,
                subject: subject
            }),
            subjectTeacherIds: arrayUnion(teacherId) // Add ID to separate array for querying
        });
    } catch (error) {
        console.error("Error adding subject teacher:", error);
        throw error;
    }
};

export const removeSubjectTeacher = async (classId, teacherObject) => {
    try {
        const classRef = doc(db, "classes", classId);
        await updateDoc(classRef, {
            subjectTeachers: arrayRemove(teacherObject),
            subjectTeacherIds: arrayRemove(teacherObject.id)
        });
    } catch (error) {
        console.error("Error removing subject teacher:", error);
        throw error;
    }
};
