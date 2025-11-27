import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const StudentDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].studentDashboard;
    const [student, setStudent] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        // In a real app, we might fetch this data. For now, using mock data as requested.
        // If location.state.student exists, use it, otherwise mock or redirect.
        // For this task, we'll ensure we have data to display even if direct access.

        const mockStudent = location.state?.student || {
            name: "Sunil Sharma",
            id: "ST12345",
            classId: "8th Grade",
            roll: "12"
        };
        setStudent(mockStudent);

        const mockActivity = [
            { id: 1, date: '24 Sept 2025', time: '08:00 AM', status: 'Present' },
            { id: 2, date: '23 Sept 2025', time: '08:05 AM', status: 'Present' },
            { id: 3, date: '22 Sept 2025', time: '-', status: 'Absent' },
            { id: 4, date: '21 Sept 2025', time: '08:02 AM', status: 'Present' },
            { id: 5, date: '20 Sept 2025', time: '08:00 AM', status: 'Present' },
        ];
        setRecentActivity(mockActivity);

    }, [location, navigate]);

    if (!student) return <div className="p-4 text-center">{t.loading}</div>;

    // Mock stats
    const attendanceRate = 85;
    const totalWorkingDays = 24;
    const daysAbsent = 4;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" role="student" />

            <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
                {/* Summary Cards Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Attendance Rate Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center border-t-4 border-blue-600">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{t.attendanceRate}</h3>
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-200"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-blue-600"
                                    strokeDasharray={`${attendanceRate}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <span className="absolute text-2xl font-bold text-blue-900">{attendanceRate}%</span>
                        </div>
                        <p className="text-blue-600 font-medium mt-2">{t.present}</p>
                    </div>

                    {/* Total Working Days Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center border-t-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{t.totalWorkingDays}</h3>
                        <div className="text-4xl font-bold text-gray-800 my-2">{totalWorkingDays}</div>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{t.days}</span>
                        </div>
                    </div>

                    {/* Days Absent Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center border-t-4 border-red-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{t.daysAbsent}</h3>
                        <div className="text-4xl font-bold text-red-600 my-2">{daysAbsent}</div>
                        <div className="flex items-center text-red-500 text-sm font-medium mb-3">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span>{t.alert}</span>
                        </div>
                        <button
                            onClick={() => navigate('/student/leave')}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-semibold hover:bg-red-100 transition-colors border border-red-100"
                        >
                            Apply for Leave
                        </button>
                    </div>
                </section>

                {/* Recent Activity Section */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-blue-50">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            {t.recentActivity}
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium text-lg">{activity.date}</span>
                                    <span className="text-gray-500 text-sm flex items-center mt-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {activity.time}
                                    </span>
                                </div>
                                <div>
                                    {activity.status === 'Present' ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="w-4 h-4 mr-1.5" />
                                            {t.present}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            <XCircle className="w-4 h-4 mr-1.5" />
                                            {t.absent}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-gray-50 text-center">
                        <button className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors">
                            {t.viewHistory}
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default StudentDashboard;
