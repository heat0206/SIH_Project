import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Utensils, Calendar, Clock, ChevronDown, CalendarDays } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { useAuth } from '../context/AuthContext';
import { getStudentById, getStudentByParentEmail } from '../services/studentService';

import { getStudentMonthlyAttendance } from '../services/attendanceService';

import { updateUserProfile } from '../services/userService';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.parentDashboard || {};

    const { currentUser, refreshProfile } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser || !currentUser.studentId) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Student Details
                let student = null;

                if (currentUser.studentId) {
                    student = await getStudentById(currentUser.studentId);
                }

                // Fallback: If no studentId in profile, try looking up by parent email
                if (!student && currentUser.email) {
                    console.log("No studentId in profile, attempting lookup by email:", currentUser.email);
                    student = await getStudentByParentEmail(currentUser.email);
                }

                if (!student) {
                    console.error("No student found for this parent account.");
                    setLoading(false);
                    return;
                }

                setStudentData(student);

                // 2. Fetch Monthly Attendance
                const today = new Date();
                const records = await getStudentMonthlyAttendance(
                    student.classId,
                    student.id,
                    today.getMonth(),
                    today.getFullYear()
                );
                setAttendanceData(records);

                // 3. Sync Parent Name, Phone, and Student Roll No to Profile if missing
                if (currentUser && (!currentUser.name || !currentUser.phone || !currentUser.studentRollNo) && student) {
                    console.log("Syncing parent details to profile");
                    const updateData = {};
                    if (!currentUser.name && student.parentName) updateData.name = student.parentName;
                    if (!currentUser.phone && student.parentPhone) updateData.phone = student.parentPhone;
                    if (!currentUser.studentRollNo && student.rollNo) updateData.studentRollNo = student.rollNo;

                    if (Object.keys(updateData).length > 0) {
                        await updateUserProfile(currentUser.uid, updateData);
                        await refreshProfile(); // Refresh context to update Header immediately
                    }
                }



            } catch (error) {
                console.error("Error fetching parent dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);



    // Generate Calendar Days for Current Month
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        // Check if we have a record for this day
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = attendanceData.find(r => r.date === dateStr);

        let status = 'holiday';
        if (record) {
            status = record.status;
        } else if (day <= today.getDate()) {
            // If past/today and no record:
            // Check if it's a Sunday (0)
            const currentDayDate = new Date(today.getFullYear(), today.getMonth(), day);
            if (currentDayDate.getDay() === 0) {
                status = 'holiday';
            } else {
                status = 'absent';
            }
        }

        return { day, status };
    });

    // Calculate Stats
    const presentCount = attendanceData.filter(r => r.status === 'present').length;
    const totalDays = Math.max(1, today.getDate()); // Approximate working days so far
    const attendancePercentage = Math.round((presentCount / totalDays) * 100);

    // Determine Today's Status
    const todayDateStr = today.toISOString().split('T')[0];
    const todayRecord = attendanceData.find(r => r.date === todayDateStr);
    const isPresentToday = todayRecord?.status === 'present';

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!studentData) return <div className="min-h-screen flex items-center justify-center">No student linked to this account.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-6 lg:max-w-7xl">
                <div className="flex flex-col lg:flex-row lg:gap-8">
                    {/* Main Content Column */}
                    <div className="flex-1">
                        {/* Parent Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {t.greeting ? t.greeting.replace('Rajesh Ji', studentData.parentName || 'Parent') : `Namaste, ${studentData.parentName || 'Parent'}`}
                                </h1>
                                <p className="text-sm text-gray-500">{t.welcomeMessage || 'Welcome to Parent Portal'}</p>
                            </div>

                            {/* Child Switcher */}
                            <div className="relative">
                                <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
                                    {studentData.name} ({studentData.className || studentData.classId})
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Hero Status Card */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <ShieldCheck size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="bg-white/20 w-fit p-2 rounded-xl mb-4 backdrop-blur-sm">
                                    <ShieldCheck size={32} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">
                                    {studentData.name} {isPresentToday ? (t.isSafe || 'is Safe at School') : 'is Absent Today'}
                                </h2>
                                <p className="text-green-50 font-medium flex items-center gap-2">
                                    <Clock size={16} />
                                    {isPresentToday ? (t.clockedIn || 'Clocked in via Face ID') : 'No entry recorded today'}
                                </p>
                            </div>
                        </div>

                        {/* Nutrition Tracker */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{t.poshanStatus || 'Poshan Status'}</h3>
                                <p className="text-green-600 font-medium text-sm flex items-center gap-1">
                                    {isPresentToday ? `✅ ${t.mealServed || 'Mid-Day Meal Served Today'}` : '❌ No Meal Record'}
                                </p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-full">
                                <Utensils size={24} className="text-orange-500" />
                            </div>
                        </div>



                        {/* Attendance Calendar Widget */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-24">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CalendarDays size={20} className="text-blue-600" />
                                    {t.attendance || 'Attendance'}
                                </h3>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                    {attendancePercentage}% {t.thisMonth || 'This Month'}
                                </span>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={i} className="text-xs font-bold text-gray-400">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {calendarDays.map((day) => (
                                    <div key={day.day} className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-medium text-gray-700">{day.day}</span>
                                        <div className={`w-2 h-2 rounded-full ${day.status === 'present' ? 'bg-green-500' :
                                            day.status === 'absent' ? 'bg-red-500' : 'bg-yellow-400'
                                            }`}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> {t.present || 'Present'}</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> {t.absent || 'Absent'}</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> {t.holiday || 'Holiday'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar (Quick Actions) */}
                    <div className="hidden lg:block w-80 space-y-6 sticky top-6 self-start">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/student/leave')}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
                                >
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Calendar size={20} />
                                    </div>
                                    <span className="font-medium">{t.applyLeave || 'Apply Leave'}</span>
                                </button>
                                <button
                                    onClick={() => navigate('/student/timetable')}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
                                >
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Clock size={20} />
                                    </div>
                                    <span className="font-medium">{t.timetable || 'Timetable'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Additional Desktop Widget (e.g., Notifications or Upcoming) */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Upcoming Events</h3>
                            <div className="space-y-3">
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <div className="text-xs opacity-80 mb-1">Dec 15, 2025</div>
                                    <div className="font-medium text-sm">Annual Sports Day</div>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <div className="text-xs opacity-80 mb-1">Dec 22, 2025</div>
                                    <div className="font-medium text-sm">Parent-Teacher Meeting</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Bottom Quick Actions (Mobile Only) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 z-40">
                <div className="container mx-auto max-w-lg grid grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/student/leave')}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
                    >
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-medium">{t.applyLeave || 'Apply Leave'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/student/timetable')}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
                    >
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-medium">{t.timetable || 'Timetable'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
