import React, { useState, useEffect } from 'react';
import { Utensils, Cloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClassCard from '../components/ClassCard';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getTeacherClasses } from '../services/classService';
import { getStudentsByClass } from '../services/studentService';
import { getAttendanceByDate } from '../services/attendanceService';
import { translations } from '../utils/translations';

const Dashboard = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const { language } = useLanguage();
    const t = translations[language].dashboard;

    // Mock logic for date status
    const getDateStatus = (selectedDate) => {
        const today = new Date();
        const selected = new Date(selectedDate);

        // Reset hours for accurate comparison
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        if (selected > today) return 'future';

        // Mock holiday: Sundays (0) or specific date
        if (selected.getDay() === 0 || selectedDate === '2025-10-02') return 'holiday';

        return 'active';
    };

    const status = getDateStatus(date);

    const { currentUser } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    // Use name from context, fallback to 'Teacher' if not yet loaded
    const userName = currentUser?.name || 'Teacher';

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                try {
                    // Fetch classes
                    const classData = await getTeacherClasses(currentUser.uid);

                    const classesWithDetails = await Promise.all(classData.map(async (cls) => {
                        let role = 'Subject Teacher';
                        let subject = '';

                        if (cls.teacherId === currentUser.uid) {
                            role = 'Class Teacher';
                        } else if (cls.subjectTeachers) {
                            const st = cls.subjectTeachers.find(t => t.id === currentUser.uid);
                            if (st) {
                                subject = st.subject;
                            }
                        }

                        // Fetch students for count
                        const students = await getStudentsByClass(cls.id);
                        const studentCount = students.length;

                        // Fetch attendance for today
                        const attendanceRecord = await getAttendanceByDate(cls.id, date);
                        let present = 0;
                        let absent = studentCount;
                        let isMarked = false;

                        if (attendanceRecord && attendanceRecord.records) {
                            isMarked = true;
                            present = attendanceRecord.records.filter(r => r.present).length;
                            absent = studentCount - present;
                        }

                        // Calculate previous week's average attendance
                        let previousWeekAvg = null;
                        try {
                            const selectedDate = new Date(date);
                            const weekAttendance = [];

                            // Get attendance for the previous 7 days (excluding current date)
                            for (let i = 1; i <= 7; i++) {
                                const pastDate = new Date(selectedDate);
                                pastDate.setDate(selectedDate.getDate() - i);

                                // Skip Sundays (holidays)
                                if (pastDate.getDay() === 0) continue;

                                const pastDateStr = pastDate.toISOString().split('T')[0];
                                const pastRecord = await getAttendanceByDate(cls.id, pastDateStr);

                                if (pastRecord && pastRecord.records && pastRecord.records.length > 0) {
                                    const pastPresent = pastRecord.records.filter(r => r.present).length;
                                    const pastTotal = pastRecord.records.length;
                                    if (pastTotal > 0) {
                                        weekAttendance.push(Math.round((pastPresent / pastTotal) * 100));
                                    }
                                }
                            }

                            // Calculate average if we have data
                            if (weekAttendance.length > 0) {
                                previousWeekAvg = Math.round(
                                    weekAttendance.reduce((a, b) => a + b, 0) / weekAttendance.length
                                );
                            }
                        } catch (err) {
                            console.error("Failed to fetch previous week data", err);
                        }

                        return {
                            id: cls.id,
                            className: cls.name,
                            studentCount,
                            present,
                            absent,
                            isMarked,
                            role,
                            subject,
                            previousWeekAvg
                        };
                    }));

                    setClasses(classesWithDetails);
                } catch (err) {
                    console.error("Failed to fetch dashboard data", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [currentUser, date]);

    // Calculate aggregate stats
    const totalStudents = classes.reduce((acc, cls) => acc + cls.studentCount, 0);
    const totalPresent = classes.reduce((acc, cls) => acc + cls.present, 0);
    const avgAttendance = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    return (
        <>
            <Header variant="dashboard" />
            <main className="dashboard-main">
                <div className="dashboard-header flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h2 id="welcomeMessage">{t.welcome}, {userName}</h2>
                        <p className="text-gray-500 mt-2">
                            {status === 'active' ? t.subtitleActive :
                                status === 'holiday' ? t.subtitleHoliday :
                                    t.subtitleFuture}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        {/* Sync Now Button */}
                        <button
                            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 font-bold rounded-xl border border-gray-200 cursor-not-allowed"
                            disabled
                        >
                            <Cloud size={20} />
                            Sync Now
                        </button>

                        <div className="date-selector relative mt-0">
                            <label htmlFor="datePicker" className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-all hover:border-blue-600 w-full justify-between md:justify-start"
                                onClick={(e) => {
                                    // Ensure the picker opens on click
                                    const input = document.getElementById('datePicker');
                                    if (input && typeof input.showPicker === 'function') {
                                        try {
                                            input.showPicker();
                                            e.preventDefault(); // Prevent default to avoid double-toggling if label handles it too
                                        } catch (error) {
                                            // Fallback to default behavior if showPicker fails
                                            console.log('showPicker failed', error);
                                        }
                                    }
                                }}
                            >
                                <div className="text-blue-600 flex">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <span className="font-medium text-gray-900 min-w-[140px]">
                                    {new Date(date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <input
                                    type="date"
                                    id="datePicker"
                                    className="absolute opacity-0 inset-0 cursor-pointer z-10"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {status === 'active' && (
                    <>
                        {/* Quick Stats Overview */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {/* Card 1: Average Attendance */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>{t.avgAttendance}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>{avgAttendance}%</div>
                            </div>

                            {/* Card 2: Mid-Day Meals */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>
                                    <Utensils size={16} />
                                    <span>Mid-Day Meals</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '0.5rem' }}>
                                    {totalPresent}<span className="text-gray-400 text-lg font-normal">/{totalStudents}</span>
                                </div>
                                <div className="text-xs text-green-600 font-medium mt-1">Served Today</div>
                            </div>

                            {/* Card 3: Pending Sync */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>Pending Sync</div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={24} className="text-green-500" />
                                    <span className="text-lg font-bold text-green-700">All Synced</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Last synced: 2 mins ago</div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>{t.yourClasses}</h3>
                        <section className="class-list">
                            {loading ? (
                                <div className="col-span-full flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : classes.length > 0 ? (
                                classes.map((cls) => (
                                    <ClassCard key={cls.id} {...cls} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p>No classes assigned to you yet.</p>
                                </div>
                            )}
                        </section>

                        <div className="recent-scans-section" style={{ marginTop: '3rem' }}>
                            <h3 id="recentScansTitle" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>{t.recentScans}</h3>
                            <div className="recent-scans-container" id="recentScansContainer" style={{
                                background: 'white',
                                borderRadius: 'var(--radius-lg)',
                                border: '2px dashed var(--border-color)',
                                padding: '3rem',
                                textAlign: 'center',
                                color: 'var(--text-light)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                                <p style={{ fontWeight: 500 }}>{t.noScans}</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{t.uploadPhoto}</p>
                            </div>
                        </div>
                    </>
                )}

                {status === 'holiday' && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border-color)',
                        marginTop: '2rem'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏖️</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.holidayTitle}</h3>
                        <p style={{ color: 'var(--text-light)' }}>{t.holidayDesc}</p>
                    </div>
                )}

                {status === 'future' && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border-color)',
                        marginTop: '2rem'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.futureTitle}</h3>
                        <p style={{ color: 'var(--text-light)' }}>{t.futureDesc}</p>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Dashboard;
