import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { getStudentById, getStudentByParentEmail } from '../services/studentService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Clock, FileText, Send, AlertCircle, CheckCircle, XCircle, History } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const LeaveApplication = () => {
    const { language } = useLanguage();
    const t = translations[language].leaveApplication;

    const { currentUser } = useAuth();
    const [leaveType, setLeaveType] = useState('sick');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Student & Leave History
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                // 1. Resolve Student
                let student = null;
                if (currentUser.studentId) {
                    student = await getStudentById(currentUser.studentId);
                }

                if (!student && currentUser.email) {
                    student = await getStudentByParentEmail(currentUser.email);
                }

                if (!student) {
                    console.error("No student linked to this parent.");
                    setLoading(false);
                    return;
                }

                setStudentData(student);

                // 2. Fetch Leave History using resolved student ID
                const q = query(
                    collection(db, 'leave_requests'),
                    where('studentId', '==', student.id),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLeaveHistory(history);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentData) {
            alert("Student profile not linked. Cannot apply.");
            return;
        }

        setIsSubmitting(true);

        try {
            const days = calculateDays(startDate, endDate);
            const newLeave = {
                studentId: studentData.id,
                studentName: studentData.name,
                classId: studentData.className || studentData.classId || '', // Ensure class info
                type: leaveType === 'sick' ? 'Sick Leave' : leaveType === 'casual' ? 'Casual Leave' : leaveType === 'family' ? 'Family Function' : 'Emergency',
                from: startDate,
                to: endDate,
                reason: reason,
                status: 'Pending',
                days: days,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'leave_requests'), newLeave);

            // Optimistic update or refetch
            setLeaveHistory([{ id: docRef.id, ...newLeave, createdAt: new Date() }, ...leaveHistory]);

            setIsSubmitting(false);
            setShowSuccess(true);
            setReason('');
            setStartDate('');
            setEndDate('');

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error submitting leave:", error);
            alert("Failed to submit leave application.");
            setIsSubmitting(false);
        }
    };

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const diffTime = Math.abs(new Date(end) - new Date(start));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
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
            case 'Approved': return <CheckCircle size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Application Form */}
                    <div className="flex-grow">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 bg-blue-50">
                                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                                <p className="text-gray-600 mt-1">{t.subtitle}</p>
                            </div>

                            <div className="p-6">
                                {showSuccess && (
                                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Leave application submitted successfully!</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Leave Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.leaveType}</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['sick', 'casual', 'family', 'emergency'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setLeaveType(type)}
                                                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${leaveType === type
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {t[type]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.fromDate}</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="date"
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.toDate}</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="date"
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    min={startDate}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration Display */}
                                    {startDate && endDate && (
                                        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                            <Clock size={16} />
                                            {t.duration}: {calculateDays(startDate, endDate)} {t.days}
                                        </div>
                                    )}

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.reason}</label>
                                        <div className="relative">
                                            <textarea
                                                required
                                                rows="4"
                                                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                placeholder={t.reasonPlaceholder}
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={18} />
                                                    {t.submit}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="w-full md:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                                <History className="text-gray-500" size={20} />
                                <h2 className="text-lg font-bold text-gray-900">{t.history}</h2>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {leaveHistory.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        {t.noHistory}
                                    </div>
                                ) : (
                                    leaveHistory.map((leave) => (
                                        <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-800 text-sm">{leave.type}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium ${getStatusColor(leave.status)}`}>
                                                    {getStatusIcon(leave.status)}
                                                    {leave.status === 'Approved' ? t.approved : leave.status === 'Rejected' ? t.rejected : t.pending}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-1">
                                                {leave.from} - {leave.to}
                                            </div>
                                            <div className="text-xs font-medium text-gray-600">
                                                {leave.days} {t.days}
                                            </div>
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
