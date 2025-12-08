import React, { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, CheckCircle, ShieldAlert } from 'lucide-react';

const PWAStatus = () => {
    const [status, setStatus] = useState('checking');
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // 1. security check
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setStatus('insecure');
            return;
        }

        // 2. SW check
        if (!('serviceWorker' in navigator)) {
            setStatus('unsupported');
            return;
        }

        setStatus('ok');
    }, []);

    if (isDismissed || status === 'ok' || status === 'checking') return null;

    if (status === 'insecure') {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-orange-100 border-t-4 border-orange-500 p-4 shadow-xl z-[100] animate-slide-up">
                <div className="flex items-start gap-3 max-w-7xl mx-auto">
                    <ShieldAlert className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                    <div className="flex-1">
                        <h3 className="font-bold text-orange-900">App Not Installable (Insecure Connection)</h3>
                        <p className="text-sm text-orange-800 mt-1">
                            You are accessing this via <code>{window.location.hostname}</code> (HTTP).
                            Offline mode and Installation are <strong>disabled</strong> by your browser for security.
                        </p>
                        <p className="text-sm font-semibold text-orange-900 mt-2">
                            Solution: Use <code>ngrok</code> or deploy to Vercel/Firebase (HTTPS).
                        </p>
                    </div>
                    <button onClick={() => setIsDismissed(true)} className="text-orange-500 font-bold p-2">✕</button>
                </div>
            </div>
        );
    }

    return null;
};

export default PWAStatus;
