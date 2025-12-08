
import CryptoJS from 'crypto-js';

const KEY_PREFIX = 'sih_offline_auth_';
const SALT = 'sih_salt_secure_'; // In prod, unique salt per user is better, simpler here.

export const saveOfflineCredentials = (email, password, uid) => {
    try {
        const hash = CryptoJS.SHA256(password + SALT + email).toString();
        const data = {
            email,
            hash,
            uid,
            lastLogin: Date.now()
        };
        localStorage.setItem(KEY_PREFIX + email, JSON.stringify(data));
        localStorage.setItem(KEY_PREFIX + 'last_user', JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save offline credentials", e);
    }
};

export const verifyOfflineCredentials = (email, password) => {
    try {
        const stored = localStorage.getItem(KEY_PREFIX + email);
        if (!stored) return null;

        const data = JSON.parse(stored);
        const inputHash = CryptoJS.SHA256(password + SALT + email).toString();

        if (inputHash === data.hash) {
            return {
                email: data.email,
                uid: data.uid,
                isOfflineLogin: true
            };
        }
        return null;
    } catch (e) {
        console.error("Failed to verify credentials", e);
        return null;
    }
};

export const getLastOfflineUser = () => {
    try {
        const stored = localStorage.getItem(KEY_PREFIX + 'last_user');
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
};
