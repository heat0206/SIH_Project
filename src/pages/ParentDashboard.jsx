import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Utensils, Calendar, Clock, ChevronDown, CalendarDays, FileText, CheckCircle2, XCircle, Flame, Trophy, X, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { useAuth } from '../context/AuthContext';
import { getStudentById, getStudentByParentEmail } from '../services/studentService';
import { getStudentMonthlyAttendance, getStudentTodayStatus } from '../services/attendanceService';
import { updateUserProfile } from '../services/userService';
import { getLastCorrectionRequest } from '../services/correctionRequestService';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.parentDashboard || {};

    const { currentUser, refreshProfile } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [lastRequest, setLastRequest] = useState(null);
    const [leaveCount, setLeaveCount] = useState(0);
    const [showTimetable, setShowTimetable] = useState(false);

    const [loading, setLoading] = useState(true);

    // Mock Timetable Data
    const timetableData = {
        schedule: {
            mon: [
                { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '10:00 - 11:00', subject: 'Science', teacher: 'Mr. Verma', room: 'Lab 2', color: 'bg-green-100 text-green-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'English', teacher: 'Ms. Rita', room: '101', color: 'bg-yellow-100 text-yellow-700' },
                { time: '12:30 - 01:30', subject: 'History', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
            ],
            tue: [
                { time: '09:00 - 10:00', subject: 'Science', teacher: 'Mr. Verma', room: '101', color: 'bg-green-100 text-green-700' },
                { time: '10:00 - 11:00', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Hindi', teacher: 'Mrs. Gupta', room: '101', color: 'bg-orange-100 text-orange-700' },
                { time: '12:30 - 01:30', subject: 'Geography', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
            ],
            wed: [
                { time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Rita', room: '101', color: 'bg-yellow-100 text-yellow-700' },
                { time: '10:00 - 11:00', subject: 'Hindi', teacher: 'Mrs. Gupta', room: '101', color: 'bg-orange-100 text-orange-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '12:30 - 01:30', subject: 'Sports', teacher: 'Coach Singh', room: 'Ground', color: 'bg-purple-100 text-purple-700' },
            ],
            thu: [
                { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '10:00 - 11:00', subject: 'Computer', teacher: 'Ms. Das', room: 'Comp Lab', color: 'bg-indigo-100 text-indigo-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Science', teacher: 'Mr. Verma', room: 'Lab 2', color: 'bg-green-100 text-green-700' },
                { time: '12:30 - 01:30', subject: 'English', teacher: 'Ms. Rita', room: '101', color: 'bg-yellow-100 text-yellow-700' },
            ],
            fri: [
                { time: '09:00 - 10:00', subject: 'History', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
                { time: '10:00 - 11:00', subject: 'Geography', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '12:30 - 01:30', subject: 'Art', teacher: 'Ms. Roy', room: 'Art Room', color: 'bg-pink-100 text-pink-700' },
            ],
            sat: [
                { time: '09:00 - 10:00', subject: 'Activity', teacher: 'All Teachers', room: 'Hall', color: 'bg-teal-100 text-teal-700' },
                { time: '10:00 - 11:00', subject: 'Library', teacher: 'Mrs. Rao', room: 'Library', color: 'bg-amber-100 text-amber-700' },
                { time: '11:00 - 11:30', subject: 'Early Dismissal', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
            ]
        }
    };

    const getTodaySchedule = () => {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const todayKey = days[new Date().getDay()];
        const locale = language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        return {
            key: todayKey,
            name: new Date().toLocaleDateString(locale, { weekday: 'long' }),
            classes: timetableData.schedule[todayKey] || []
        };
    };

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
            // 1. Fetch Student Details
            let student = null;

            if (currentUser?.studentId) {
                student = await getStudentById(currentUser.studentId);
            } else if (currentUser?.email) {
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
                const updateData = {};
                if (!currentUser.name && student.parentName) updateData.name = student.parentName;
                if (!currentUser.phone && student.parentPhone) updateData.phone = student.parentPhone;
                if (!currentUser.studentRollNo && student.rollNo) updateData.studentRollNo = student.rollNo;

                if (Object.keys(updateData).length > 0) {
                    await updateUserProfile(currentUser.uid, updateData);
                    await refreshProfile();
                }
            }

            // 4. Fetch Leave Count
            const leavesQ = query(collection(db, 'leave_requests'), where('studentId', '==', student.id));
            const leavesSnap = await getDocs(leavesQ);
            setLeaveCount(leavesSnap.size);

            setLoading(false);
        };

        if (currentUser) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
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
    const absCount = attendanceData.filter(r => r.status === 'absent').length || 0;
    const lateCount = attendanceData.filter(r => r.status === 'late').length || 0;
    const totalAbsent = calendarDays.filter(d => d.day <= today.getDate() && d.status === 'absent').length;

    const totalDays = Math.max(1, today.getDate());
    const attendancePercentage = Math.round((presentCount / totalDays) * 100);

    // Determine Today's Status
    const todayDateStr = formatDate(today);
    const todayRecord = attendanceData.find(r => r.date === todayDateStr);
    const isPresentToday = todayRecord?.status === 'present';

    // Calculate Streak
    const calculateStreak = () => {
        if (!attendanceData.length) return 0;
        const sortedRecords = [...attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const pastRecords = sortedRecords.filter(r => new Date(r.date) <= now);

        for (const record of pastRecords) {
            if (record.status === 'present') {
                streak++;
            } else if (record.status === 'holiday' || record.date === todayDateStr) {
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

    const todaySchedule = getTodaySchedule();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-6 lg:max-w-7xl relative">
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
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-sm flex items-center gap-2 animate-fade-in-up">
                                {currentStreak > 0 ? (
                                    <>
                                        <Flame className="text-yellow-300 fill-yellow-300 animate-pulse" size={18} />
                                        <span className="font-bold text-sm tracking-wide">{currentStreak} {t.dayStreak || 'Day Streak!'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="text-yellow-200" size={18} />
                                        <span className="font-bold text-sm tracking-wide">{t.startStreak || 'Start your streak!'}</span>
                                    </>
                                )}
                            </div>

                            <div className="relative z-10 pt-2">
                                <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-sm border border-white/10">
                                    <ShieldCheck size={32} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2 leading-tight">
                                    {studentData.name} {isPresentToday ? (t.isSafe || 'is Safe at School') : (t.isAbsent || 'is Absent Today')}
                                </h2>
                                <p className="text-green-50 font-medium flex items-center gap-2 opacity-90">
                                    <Clock size={18} />
                                    {isPresentToday ? (t.clockedIn || 'Clocked in via Face ID') : (t.noEntryRecorded || 'No entry recorded today')}
                                </p>
                            </div>
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
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
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
                                        {day.status === 'present' && <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" title={t.present || "Present"}></div>}
                                        {day.status === 'absent' && <div className="w-3 h-3 rounded-sm bg-red-500 shadow-sm" title={t.absent || "Absent"}></div>}
                                        {day.status === 'late' && <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-yellow-400" title={t.late || "Late"}></div>}
                                        {(day.status === 'holiday' || day.status === 'weekend') && <div className="w-3 h-3 bg-gray-300 rounded-[2px]" title={t.holiday || "Holiday"}></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar (Quick Actions) */}
                    <div className="hidden lg:block w-80 space-y-6 sticky top-6 self-start">
                        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.quickActions || 'Quick Actions'}</h3>
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
                                    onClick={() => setShowTimetable(true)}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
                                >
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Clock size={20} />
                                    </div>
                                    <span className="font-medium">{t.timetable || 'Timetable'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                            <h3 className="font-bold text-lg mb-2">{t.upcomingEvents || "Upcoming Events"}</h3>
                            <div className="space-y-3">
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <div className="text-xs opacity-80 mb-1">Dec 15, 2025</div>
                                    <div className="font-medium text-sm">{t.annualSportsDay || "Annual Sports Day"}</div>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <div className="text-xs opacity-80 mb-1">Dec 22, 2025</div>
                                    <div className="font-medium text-sm">{t.parentTeacherMeeting || "Parent-Teacher Meeting"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Breakdown Widget */}
                        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 text-gray-900">{t.attendanceBreakdown || "Attendance Breakdown"} <span className="text-xs font-normal text-gray-500">({t.thisMonth || "This Month"})</span></h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg text-red-500 shadow-sm"><XCircle size={18} /></div>
                                        <span className="text-sm font-medium text-gray-700">{t.daysAbsent || "Days Absent"}</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600">{totalAbsent}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg text-yellow-600 shadow-sm"><Clock size={18} /></div>
                                        <span className="text-sm font-medium text-gray-700">{t.timesLate || "Times Late"}</span>
                                    </div>
                                    <span className="text-lg font-bold text-yellow-700">{lateCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg text-purple-600 shadow-sm"><FileText size={18} /></div>
                                        <span className="text-sm font-medium text-gray-700">{t.leaveApplied || "Leave Applied"}</span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-700">{leaveCount}</span>
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
                        onClick={() => setShowTimetable(true)}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
                    >
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-medium">{t.timetable || 'Timetable'}</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="hidden lg:block">
                <Footer />
            </div>

            {/* Timetable Modal (Drawer/Popup) */}
            {showTimetable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">{t.timetable || 'Timetable'}</h3>
                                <p className="text-blue-100 text-xs">
                                    {translations[language]?.timetable?.days ? translations[language].timetable.days[['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(todaySchedule.key)] : todaySchedule.name}
                                    - {todaySchedule.key === 'sun' || todaySchedule.key === 'sat' ? (t.holiday || 'Weekend') : (t.regularClass || 'Regular Class')}
                                </p>
                            </div>
                            <button onClick={() => setShowTimetable(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">
                            {todaySchedule.classes.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.classes.map((cls, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                                            <div className="mt-1">
                                                <div className={`w-2 h-2 rounded-full ${cls.color.includes('bg-') ? cls.color.replace('text-', 'bg-').split(' ')[0] : 'bg-blue-500'}`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900">{translations[language]?.timetable?.subjects?.[cls.subject] || cls.subject}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cls.color}`}>{cls.time}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><User size={12} /> {cls.teacher}</span>
                                                    <span className="flex items-center gap-1">{translations[language]?.timetable?.room || "Room"}: {cls.room}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>{translations[language]?.timetable?.noClasses || "No classes scheduled for this day."}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-white text-center">
                            <button onClick={() => navigate('/student/timetable')} className="text-sm text-blue-600 font-bold flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                {t.viewFullWeek || "View Full Week"} <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
