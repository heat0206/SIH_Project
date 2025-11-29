import { db, auth } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * WARNING: This script is for development purposes only.
 * It creates test users in Authentication and data in Firestore.
 */

export const seedDatabase = async () => {
    console.log("Starting database seed...");

    try {
        // 1. Create Classes
        const classRef = doc(collection(db, "classes"));
        const classId = classRef.id;
        await setDoc(classRef, {
            name: "Class 10-A",
            teacherId: "placeholder_teacher_uid" // Will update after creating teacher
        });
        console.log("Created Class 10-A");

        // 2. Create Users (We can't programmatically create Auth users easily without being logged in or using Admin SDK, 
        // so we will just create Firestore documents assuming these UIDs exist or will be created)

        // In a real app, you'd use the Admin SDK for this. 
        // For this client-side helper, we'll just log what needs to be done or create Firestore docs.

        const students = [
            { name: "Rahul Sharma", email: "rahul@test.com", role: "student", classId: classId },
            { name: "Priya Patel", email: "priya@test.com", role: "student", classId: classId },
        ];

        for (const student of students) {
            // Note: In reality, the UID comes from Authentication. 
            // For seeding Firestore ONLY, we generate a random ID.
            // You must manually create these users in Auth with matching emails if you want to log in as them.
            const newStudentRef = doc(collection(db, "users"));
            await setDoc(newStudentRef, {
                ...student,
                uid: newStudentRef.id,
                createdAt: new Date()
            });
            console.log(`Created student profile for ${student.name}`);
        }

        // 3. Create Sample Attendance
        const today = new Date().toISOString().split('T')[0];
        await addDoc(collection(db, "attendance"), {
            date: today,
            classId: classId,
            records: {
                "student_uid_1": "present",
                "student_uid_2": "absent"
            }
        });
        console.log("Created sample attendance record");

        alert("Database seeded with initial structure! (Note: Auth users were not created, only Firestore data)");

    } catch (error) {
        console.error("Error seeding database:", error);
        alert("Error seeding database. Check console.");
    }
};
