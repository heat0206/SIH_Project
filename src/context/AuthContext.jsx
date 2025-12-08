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
import { saveOfflineCredentials, verifyOfflineCredentials } from '../services/offlineAuthService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);


    async function login(email, password, rememberMe = true) {
        try {
            // Always use local persistence for better offline support
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithEmailAndPassword(auth, email, password);
            
            // Save valid credentials for future offline login
            if (result.user) {
                try {
                    saveOfflineCredentials(email, password, result.user.uid);
                } catch (e) {
                    console.warn("Failed to save offline credentials", e);
                }
            }
            return result;
        } catch (error) {
            // If network error, try offline authentication
            if (error.code === 'auth/network-request-failed' || !navigator.onLine) {
                 try {
                    const offlineUser = verifyOfflineCredentials(email, password);
                    
                    if (offlineUser) {
                        let userProfile = {};
                        try {
                            const cachedProfile = localStorage.getItem(`user_profile_${offlineUser.uid}`);
                            if (cachedProfile) {
                                userProfile = JSON.parse(cachedProfile);
                            }
                        } catch (e) {
                            console.warn("Failed to load cached profile", e);
                        }

                        // Manually set user state for offline session
                        setCurrentUser({
                            uid: offlineUser.uid,
                            email: offlineUser.email,
                            isAnonymous: false,
                            emailVerified: true,
                            isOffline: true,
                            ...userProfile // Restore role and name
                        });
                        return { user: { ...offlineUser, ...userProfile } }; // Mock response
                    }
                 } catch (e) {
                     console.error("Offline login failed", e);
                 }
            }
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
                    // Cache the fresh profile
                    localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(profile));
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
