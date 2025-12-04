import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function login(email, password, rememberMe = false) {
        try {
            const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);
            return signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    function logout() {
        return signOut(auth);
    }

    async function refreshProfile() {
        if (currentUser && currentUser.uid) {
            try {
                const profile = await getUserProfile(currentUser.uid);
                setCurrentUser(prev => ({ ...prev, ...profile }));
            } catch (error) {
                console.error("Error refreshing user profile:", error);
            }
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const profile = await getUserProfile(user.uid);
                    setCurrentUser({ ...user, ...profile }); // Merge auth user and firestore profile
                } catch (error) {
                    console.error("Error fetching user profile in AuthContext:", error);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
