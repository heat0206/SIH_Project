import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Utensils, Calendar, Clock, ChevronDown, CalendarDays, FileText, CheckCircle2, XCircle, Flame, Trophy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { useAuth } from '../context/AuthContext';
import { getStudentById, getStudentByParentEmail } from '../services/studentService';

import { getStudentMonthlyAttendance, getStudentTodayStatus } from '../services/attendanceService';

import { updateUserProfile } from '../services/userService';
import { getLastCorrectionRequest } from '../services/correctionRequestService';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.parentDashboard || {};

    const { currentUser, refreshProfile } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [lastRequest, setLastRequest] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLastRequest = async () => {
            if (currentUser?.uid) {
                const request = await getLastCorrectionRequest(currentUser.uid);
                setLastRequest(request);
            }
        };
        fetchLastRequest();
    }, [currentUser]);

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

                // Helper to ensure consistent YYYY-MM-DD format using local time
                const formatDate = (d) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                // Check for real-time status (RFID logs) for today if not already marked in attendance records
                const todayDateStr = formatDate(today);
                const hasTodayRecord = records.some(r => r.date === todayDateStr);

                if (!hasTodayRecord) {
                    const realtimeStatus = await getStudentTodayStatus(student.id);
                    if (realtimeStatus === 'present') {
                        console.log("Found real-time present status, updating dashboard.");
                        records.push({
                            date: todayDateStr,
                            status: 'present',
                            verificationMethod: 'rfid-realtime'
                        });
                    }
                }

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

    // Helper for consistency in render
    const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate Calendar Days for Current Month
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(today.getFullYear(), today.getMonth(), day);
        const dateStr = formatDate(dateObj);

        // Find record with exact date match
        const record = attendanceData.find(r => r.date === dateStr);

        let status = 'holiday';
        if (record) {
            status = record.status;
        } else if (day <= today.getDate()) {
            if (dateObj.getDay() === 0) {
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
    const todayDateStr = formatDate(today);
    const todayRecord = attendanceData.find(r => r.date === todayDateStr);
    const isPresentToday = todayRecord?.status === 'present';

    // Calculate Streak
    const calculateStreak = () => {
        if (!attendanceData.length) return 0;

        // Sort records by date descending
        const sortedRecords = [...attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Filter out future dates just in case
        const pastRecords = sortedRecords.filter(r => new Date(r.date) <= now);

        for (const record of pastRecords) {
            if (record.status === 'present') {
                streak++;
            } else if (record.status === 'holiday' || record.date === todayDateStr) {
                // Determine if we should break streak on today if it's not present
                if (record.date === todayDateStr && record.status !== 'present') {
                    if (record.status === 'absent') break;
                    continue;
                }
                continue;
            } else {
                break;
            }
        }
        return streak;
    };

    const currentStreak = calculateStreak();

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

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 mb-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 duration-500">
                                <ShieldCheck size={140} />
                            </div>

                            {/* Streak Badge - Floating at top right */}
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-sm flex items-center gap-2 animate-fade-in-up">
                                {currentStreak > 0 ? (
                                    <>
                                        <Flame className="text-yellow-300 fill-yellow-300 animate-pulse" size={18} />
                                        <span className="font-bold text-sm tracking-wide">
                                            {currentStreak} Day Streak!
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="text-yellow-200" size={18} />
                                        <span className="font-bold text-sm tracking-wide">Start your streak!</span>
                                    </>
                                )}
                            </div>

                            <div className="relative z-10 pt-2">
                                <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-sm border border-white/10">
                                    <ShieldCheck size={32} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2 leading-tight">
                                    {studentData.name} {isPresentToday ? (t.isSafe || 'is Safe at School') : 'is Absent Today'}
                                </h2>
                                <p className="text-green-50 font-medium flex items-center gap-2 opacity-90">
                                    <Clock size={18} />
                                    {isPresentToday ? (t.clockedIn || 'Clocked in via Face ID') : 'No entry recorded today'}
                                </p>
                            </div>

                            {/* Decorative bottom gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                        </div>

                        {/* Nutrition Tracker */}
                        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">{t.poshanStatus || 'Poshan Status'}</h3>
                                <div className="bg-orange-50 p-2 rounded-full">
                                    <Utensils size={20} className="text-orange-500" />
                                </div>
                            </div>
                            {isPresentToday ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">✅ {t.mealServed || 'Mid-Day Meal Served Today'}</span>
                                    </div>
                                    <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                                        <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{t.todayMenu || "Today's Menu"}</div>
                                        <div className="font-medium text-gray-800 text-sm mb-2">{t.menuRiceDal || "Rice, Dal & Green Vegetables"}</div>
                                        <div className="flex gap-3 text-xs text-gray-600">
                                            <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> 450 {t.calories || 'Kcal'}</span>
                                            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-400" /> 12g {t.protein || 'Protein'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-red-500 font-medium text-sm flex items-center gap-2">
                                    <XCircle size={16} /> {t.noMeal || 'No Meal Record'}
                                </p>
                            )}
                        </div>

                        {/* Last Request Widget */}
                        {lastRequest && (
                            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-600">
                                                {t.correctionRequest || 'Correction Request'}: <span className="font-bold text-gray-900">{lastRequest.fieldName}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span className="font-medium text-gray-700">{lastRequest.requestedValue}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {lastRequest.createdAt?.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-xs text-gray-500">{t.status || 'Status'}:</div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${lastRequest.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            lastRequest.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {lastRequest.status === 'approved' && <CheckCircle2 size={12} />}
                                            {lastRequest.status === 'rejected' && <XCircle size={12} />}
                                            {lastRequest.status === 'pending' && <Clock size={12} />}
                                            {lastRequest.status === 'approved' ? (t.approved || 'Approved') : lastRequest.status === 'rejected' ? (t.rejected || 'Rejected') : (t.pending || 'Pending')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Calendar Widget */}
                        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 mb-24">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CalendarDays size={20} className="text-blue-600" />
                                    {t.attendance || 'Attendance'}
                                </h3>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                    {attendancePercentage}% {t.thisMonth || 'This Month'}
                                </span>
                            </div>

                            {/* Attendance Comparison Chart */}
                            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.performance || 'Performance'}</p>
                                        <p className="text-sm font-bold text-gray-800">{t.attendanceVsAvg || 'Attendance vs Class Avg'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${attendancePercentage >= 85 ? 'text-green-600' : 'text-orange-500'}`}>
                                            {attendancePercentage >= 85 ? (t.greatJob || 'Great Job!') : (t.needsImp || 'Needs Imp.')}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative pt-4">
                                    {/* Student Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-gray-700">{t.yourChild || 'Your Child'}</span>
                                            <span className="font-bold text-gray-900">{attendancePercentage}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${attendancePercentage >= 85 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                style={{ width: `${attendancePercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Class Average Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-gray-500">{t.classAverage || 'Class Average'}</span>
                                            <span className="font-bold text-gray-600">85%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-blue-400 opacity-70"
                                                style={{ width: '85%' }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
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

                                        {/* Status Indicators */}
                                        {day.status === 'present' && (
                                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" title="Present"></div>
                                        )}
                                        {day.status === 'absent' && (
                                            <div className="w-3 h-3 rounded-sm bg-red-500 shadow-sm" title="Absent"></div>
                                        )}
                                        {day.status === 'late' && (
                                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-yellow-400" title="Late"></div>
                                        )}
                                        {(day.status === 'holiday' || day.status === 'weekend') && (
                                            <div className="w-3 h-3 bg-gray-300 rounded-[2px]" title="Holiday/Weekend"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center flex-wrap gap-4 mt-6 text-xs text-gray-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>{t.present || 'Present'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                                    <span>{t.absent || 'Absent'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-yellow-400"></div>
                                    <span>Late</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-300 rounded-[2px]"></div>
                                    <span>{t.holiday || 'Holiday'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar (Quick Actions) */}
                    <div className="hidden lg:block w-80 space-y-6 sticky top-6 self-start">
                        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
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

                        {/* Additional Desktop Widget */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
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

            {/* Footer - visible on desktop, hidden on mobile due to bottom nav */}
            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
};

export default ParentDashboard;
