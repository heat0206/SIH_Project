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

export const createTeacherProfile = async (teacherData) => {
    let secondaryApp = null;
    try {
        // 1. Initialize a secondary Firebase app to create the user without logging out the admin
        secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        // 2. Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, teacherData.email, teacherData.password);
        const uid = userCredential.user.uid;

        // 3. Create the user profile in Firestore using the SAME UID
        // We remove the password from the data stored in Firestore for security
        const { password, ...profileData } = teacherData;

        await setDoc(doc(db, "users", uid), {
            ...profileData,
            uid: uid, // Store UID explicitly as well
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

export const deleteTeacherProfile = async (teacherId) => {
    try {
        await deleteDoc(doc(db, "users", teacherId));
    } catch (error) {
        console.error("Error deleting teacher profile:", error);
        throw error;
    }
};
