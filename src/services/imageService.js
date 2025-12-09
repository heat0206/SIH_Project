import { db } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot } from 'firebase/firestore';

export const getCapturedImageByRFID = async (rfid) => {
    try {
        if (!rfid) return null;
        
        const q = query(
            collection(db, 'captured_images'),
            where('uid', '==', rfid),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0].data();
        return {
            image_base64: doc.image_base64,
            status: doc.status,
            timestamp: doc.timestamp
        };
    } catch (error) {
        // Fallback for missing index or other error: try without orderBy
        try {
            const q2 = query(collection(db, 'captured_images'), where('uid', '==', rfid), limit(1));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) return snap2.docs[0].data();
        } catch (e) { console.error(e); }
        console.error("Error fetching captured image:", error);
        return null;
    }
};

export const subscribeToImagesByRFIDs = (rfids, onUpdate) => {
    if (!rfids || rfids.length === 0) return () => {};

    // Note: 'in' query supports max 10 values.
    // Also requires composite index for uid + timestamp usually.
    // robust fallback: order by timestamp might fail if index missing.
    // We try to listen to the LATEST changes.
    // Simplest: WHERE uid IN [...]
    // We let the client sort/filter latest.
    
    const q = query(
        collection(db, 'captured_images'),
        where('uid', 'in', rfids)
    );

    return onSnapshot(q, (snapshot) => {
        const updates = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            // We only care if it's "newer" or if we don't have one.
            // Actually, we collect ALL in this snapshot and let the UI decide/merge.
            // But snapshot returns ALL matching docs (potentially many).
            // We should group by UID and pick latest.
            if (updates[data.uid]) {
                // If we already have one from this batch, compare timestamps
                const existing = updates[data.uid];
                // Assuming string ISO or firestore timestamp
                 if (data.timestamp > existing.timestamp) {
                     updates[data.uid] = data;
                 }
            } else {
                updates[data.uid] = data;
            }
        });
        onUpdate(updates);
    });
};

export const getProxyAlerts = async () => {
    try {
        const q = query(
            collection(db, 'captured_images'),
            where('status', '==', 'MISMATCH'),
            orderBy('timestamp', 'desc'),
            limit(50) // reasonable limit
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching proxy alerts:", error);
        // Fallback without sort if index missing
        try {
             const q2 = query(collection(db, 'captured_images'), where('status', '==', 'MISMATCH'), limit(50));
             const sn2 = await getDocs(q2);
             return sn2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch(e) { return []; }
    }
};
