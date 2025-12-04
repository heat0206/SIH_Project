import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

export const getUserProfile = async (uid) => {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.warn("No user profile found for UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (uid, data) => {
    try {
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const getAllTeachers = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "teacher"));
        const querySnapshot = await getDocs(q);

        const teachers = [];
        querySnapshot.forEach((doc) => {
            teachers.push({ id: doc.id, ...doc.data() });
        });
        return teachers;
    } catch (error) {
        console.error("Error fetching teachers:", error);
        throw error;
    }
};

// Import necessary Firebase functions for secondary app initialization
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../firebase';
import { setDoc } from 'firebase/firestore';

// Helper to generate professional Employee ID
const generateEmployeeId = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "teacher"));
        const snapshot = await getDocs(q);
        const count = snapshot.size;

        // Format: EMP-YYYY-XXXX (e.g., EMP-2025-001)
        const year = new Date().getFullYear();
        const sequence = (count + 1).toString().padStart(3, '0');
        return `EMP-${year}-${sequence}`;
    } catch (error) {
        console.error("Error generating employee ID:", error);
        // Fallback to a random string if generation fails, but keep format if possible
        return `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
};

export const createTeacherProfile = async (teacherData) => {
    let secondaryApp = null;
    try {
        // 1. Initialize a secondary Firebase app to create the user without logging out the admin
        secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        // 2. Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, teacherData.email, teacherData.password);
        const uid = userCredential.user.uid;

        // Generate Professional Employee ID
        const employeeId = await generateEmployeeId();

        // 3. Create the user profile in Firestore using the SAME UID
        // We remove the password from the data stored in Firestore for security
        const { password, ...profileData } = teacherData;

        await setDoc(doc(db, "users", uid), {
            ...profileData,
            uid: uid, // Store UID explicitly as well
            employeeId: employeeId, // Store the professional ID
            role: 'teacher',
            createdAt: new Date()
        });

        // 4. Sign out the secondary auth immediately to be safe (though deleteApp handles cleanup)
        await signOut(secondaryAuth);

        return uid;
    } catch (error) {
        console.error("Error creating teacher profile:", error);
        throw error;
    } finally {
        // 5. Clean up the secondary app instance
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
};

export const createParentProfile = async (parentData) => {
    let secondaryApp = null;
    try {
        // 1. Initialize a secondary Firebase app
        secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        // 2. Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, parentData.email, parentData.password);
        const uid = userCredential.user.uid;

        // 3. Create the user profile in Firestore
        await setDoc(doc(db, "users", uid), {
            uid: uid,
            email: parentData.email,
            role: 'parent',
            studentId: parentData.studentId,
            studentName: parentData.studentName,
            createdAt: new Date()
        });

        // 4. Sign out the secondary auth
        await signOut(secondaryAuth);

        return uid;
    } catch (error) {
        console.error("Error creating parent profile:", error);
        throw error;
    } finally {
        // 5. Clean up
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
};

export const deleteTeacherProfile = async (teacherId) => {
    try {
        await deleteDoc(doc(db, "users", teacherId));
    } catch (error) {
        console.error("Error deleting teacher profile:", error);
        throw error;
    }
};

export const migrateExistingTeacherIds = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "teacher"));
        const snapshot = await getDocs(q);

        const teachers = [];
        snapshot.forEach((doc) => {
            teachers.push({ id: doc.id, ...doc.data() });
        });

        // Sort by creation time if available, otherwise by name
        teachers.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return a.createdAt.seconds - b.createdAt.seconds;
            }
            return a.name.localeCompare(b.name);
        });

        let updatedCount = 0;
        const year = new Date().getFullYear();

        for (let i = 0; i < teachers.length; i++) {
            const teacher = teachers[i];
            // Only update if no employeeId or if it doesn't match the new format
            if (!teacher.employeeId || !teacher.employeeId.startsWith('EMP-')) {
                const sequence = (i + 1).toString().padStart(3, '0');
                const newId = `EMP-${year}-${sequence}`;

                await setDoc(doc(db, "users", teacher.id), {
                    ...teacher,
                    employeeId: newId
                }, { merge: true });

                updatedCount++;
            }
        }

        return { success: true, count: updatedCount };
    } catch (error) {
        console.error("Error migrating teacher IDs:", error);
        return { success: false, error };
    }
};
