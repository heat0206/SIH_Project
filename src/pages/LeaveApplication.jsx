import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Clock, FileText, Send, History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LeaveApplication = () => {
    const [leaveType, setLeaveType] = useState('sick');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    // Mock History Data
    const [history, setHistory] = useState([
        { id: 1, type: 'Medical', from: '2025-09-10', to: '2025-09-12', status: 'Approved', reason: 'Viral Fever' },
        { id: 2, type: 'Family', from: '2025-08-05', to: '2025-08-06', status: 'Rejected', reason: 'Cousin Wedding' },
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newRequest = {
            id: history.length + 1,
            type: leaveType.charAt(0).toUpperCase() + leaveType.slice(1),
            from: startDate,
            to: endDate,
            status: 'Pending',
            reason: reason
        };
        setHistory([newRequest, ...history]);
        // Reset form
        setStartDate('');
        setEndDate('');
        setReason('');
        alert('Leave application submitted successfully!');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" role="student" />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Application Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-blue-50">
                                <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Apply for Leave
                                </h1>
                                <p className="text-blue-700 text-sm mt-1">Submit your leave request for approval.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Leave Type</label>
                                        <select
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="sick">Sick Leave</option>
                                            <option value="casual">Casual Leave</option>
                                            <option value="family">Family Function</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Duration</label>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                            <Clock className="w-4 h-4" />
                                            {startDate && endDate ? (
                                                <span>
                                                    {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                                                </span>
                                            ) : 'Select dates'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">From Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">To Date</label>
                                        <input
                                            type="date"
                                            required
                                            min={startDate}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Reason for Leave</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Please provide a detailed reason for your leave request..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-500" />
                                    Application History
                                </h2>
                            </div>

                            <div className="p-4 space-y-4">
                                {history.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No leave history found.
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div key={item.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-800">{item.type} Leave</span>
                                                <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 font-medium ${getStatusColor(item.status)}`}>
                                                    {getStatusIcon(item.status)}
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                                <Calendar className="w-3 h-3" />
                                                {item.from} - {item.to}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {item.reason}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LeaveApplication;
