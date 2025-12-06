import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'dataCorrectionRequests';

/**
 * Submit a data correction request
 * @param {string} userId - The user's UID
 * @param {string} userRole - 'teacher' or 'parent'
 * @param {string} fieldName - The field that needs correction (e.g., 'Address', 'Phone')
 * @param {string} currentValue - The current value
 * @param {string} requestedValue - The requested new value
 * @param {string} reason - Optional reason for the correction
 * @returns {Promise<string>} - The document ID of the created request
 */
export const submitCorrectionRequest = async (userId, userRole, fieldName, currentValue, requestedValue, reason = '') => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            userId,
            userRole,
            fieldName,
            currentValue,
            requestedValue,
            reason,
            status: 'pending', // pending, approved, rejected
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            reviewedBy: null,
            reviewedAt: null,
            adminNotes: ''
        });
        return docRef.id;
    } catch (error) {
        console.error('Error submitting correction request:', error);
        throw error;
    }
};

/**
 * Get the last correction request for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Object|null>} - The last request or null
 */
export const getLastCorrectionRequest = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        };
    } catch (error) {
        console.error('Error fetching last correction request:', error);
        return null;
    }
};

/**
 * Get all correction requests for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - List of requests
 */
export const getAllCorrectionRequests = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching correction requests:', error);
        return [];
    }
};

/**
 * Update a correction request status (Admin only)
 * @param {string} requestId - The request document ID
 * @param {string} status - 'approved' or 'rejected'
 * @param {string} adminId - The admin's UID
 * @param {string} adminNotes - Optional notes from admin
 */
export const updateCorrectionRequestStatus = async (requestId, status, adminId, adminNotes = '') => {
    try {
        const requestRef = doc(db, COLLECTION_NAME, requestId);
        await updateDoc(requestRef, {
            status,
            reviewedBy: adminId,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            adminNotes
        });
    } catch (error) {
        console.error('Error updating correction request:', error);
        throw error;
    }
};

/**
 * Get all pending correction requests (Admin only)
 * @returns {Promise<Array>} - List of pending requests
 */
export const getPendingCorrectionRequests = async () => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'asc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        return [];
    }
};

/**
 * Get correction requests by user role (for Admin to see teacher/parent requests)
 * @param {Array<string>} roles - Array of roles to filter by ['teacher', 'parent']
 * @param {string} status - Optional status filter ('pending', 'approved', 'rejected', or null for all)
 * @returns {Promise<Array>} - List of requests
 */
export const getRequestsByUserRole = async (roles, status = null) => {
    try {
        let q;
        if (status) {
            q = query(
                collection(db, COLLECTION_NAME),
                where('userRole', 'in', roles),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, COLLECTION_NAME),
                where('userRole', 'in', roles),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching requests by role:', error);
        return [];
    }
};

/**
 * Get all correction requests (for Government Dashboard)
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} - List of all requests
 */
export const getAllCorrectionRequestsAdmin = async (status = null) => {
    try {
        let q;
        if (status) {
            q = query(
                collection(db, COLLECTION_NAME),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, COLLECTION_NAME),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error fetching all requests:', error);
        return [];
    }
};
