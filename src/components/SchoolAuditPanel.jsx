import React from 'react';
import { X, Wifi, Radio, UserCheck, AlertCircle, Camera } from 'lucide-react';

const SchoolAuditPanel = ({ isOpen, onClose, school }) => {
    if (!isOpen || !school) return null;

    // Mock Data for the panel
    const recentScans = [
        { id: 1, name: "Rahul Kumar", time: "10:42 AM", status: "Verified", regImg: "https://randomuser.me/api/portraits/boys/1.jpg", capImg: "https://randomuser.me/api/portraits/boys/1.jpg" },
        { id: 2, name: "Priya Singh", time: "10:41 AM", status: "Verified", regImg: "https://randomuser.me/api/portraits/girls/2.jpg", capImg: "https://randomuser.me/api/portraits/girls/2.jpg" },
        { id: 3, name: "Amit Patel", time: "10:39 AM", status: "Mismatch", regImg: "https://randomuser.me/api/portraits/boys/3.jpg", capImg: "https://randomuser.me/api/portraits/men/3.jpg" },
    ];

    const classAnalytics = [
        { class: "Class 5", present: 42, total: 45, percentage: 93 },
        { class: "Class 6", present: 38, total: 40, percentage: 95 },
        { class: "Class 7", present: 35, total: 42, percentage: 83 },
        { class: "Class 8", present: 40, total: 40, percentage: 100 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{school.name}</h2>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                LIVE
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">ID: {school.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Hardware Health Widget */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center text-center">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full mb-2">
                                <Camera size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ESP32-CAM</span>
                            <span className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
                                <Wifi size={12} /> Online
                            </span>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center text-center">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full mb-2">
                                <Radio size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">RFID Reader</span>
                            <span className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
                                <Wifi size={12} /> Active
                            </span>
                        </div>
                    </div>

                    {/* Recent RFID Scans Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Radio size={16} className="text-blue-600" />
                            Recent RFID Scans
                        </h3>
                        <div className="space-y-3">
                            {recentScans.map(scan => (
                                <div key={scan.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${scan.status === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {scan.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{scan.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">RFID: {scan.id ? `TAG-${1000 + scan.id}` : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-900">{scan.time}</p>
                                        <span className={`text-[10px] font-bold ${scan.status === 'Verified' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {scan.status === 'Verified' ? 'Present' : 'Mismatch'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Class Analytics Table */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertCircle size={16} className="text-orange-600" />
                            Class Analytics
                        </h3>
                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2">Class</th>
                                        <th className="px-4 py-2 text-center">Attd. %</th>
                                        <th className="px-4 py-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {classAnalytics.map((cls, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 font-medium text-gray-800">{cls.class}</td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-bold">{cls.percentage}%</span>
                                                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${cls.percentage >= 90 ? 'bg-green-500' :
                                                                cls.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${cls.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <span className={`text-xs font-bold ${cls.percentage >= 90 ? 'text-green-600' :
                                                    cls.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {cls.percentage >= 90 ? 'Good' : cls.percentage >= 75 ? 'Avg' : 'Low'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        Generate Full Audit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SchoolAuditPanel;
