import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { processSingleLog } from '../services/attendanceService';

const AttendanceProcessor = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        // Security Check: Only Teachers and Admins should process logs
        // This prevents students from having write access to attendance via this component
        if (!currentUser) return;

        // Better role check:
        const isAuthorized = currentUser.role === 'admin' || currentUser.role === 'teacher' || currentUser.email?.includes('admin');

        if (!isAuthorized) {
            console.log("[AttendanceProcessor] User not authorized to process logs. Skipping.");
            return;
        }

        console.log("[AttendanceProcessor] Starting RFID Log Listener...");

        // Listen for UNPROCESSED logs from today
        const today = new Date().toISOString().split('T')[0];
        const logsRef = collection(db, "rfid_logs");

        // Query: Date == Today
        // We removed 'processed' filter to avoid needing a composite index.
        // We will filter client-side.
        const q = query(
            logsRef,
            where("date", "==", today),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    const logData = change.doc.data();
                    if (!logData.processed) {
                        console.log(`[AttendanceProcessor] New unprocessed log detected: ${change.doc.id}`);
                        processSingleLog(change.doc.id, logData);
                    }
                }
            });
        }, (error) => {
            console.error("[AttendanceProcessor] Listener Error:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return null; // This component renders nothing
};

export default AttendanceProcessor;
