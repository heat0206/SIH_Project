import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClassCard from '../components/ClassCard';
import { useLanguage } from '../context/LanguageContext';
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

    const classes = [
        { id: 'VI-B', className: 'Class VI - Section B', studentCount: 45, present: 43, absent: 2, isMarked: true },
        { id: 'VIII-A', className: 'Class VIII - Section A', studentCount: 38, present: 36, absent: 2, isMarked: true },
        { id: 'X-A', className: 'Class X - Section A', studentCount: 40, present: 39, absent: 1, isMarked: true },
        { id: 'XI-B', className: 'Class XI - Section B', studentCount: 35, present: 33, absent: 2, isMarked: true },
    ];

    return (
        <>
            <Header variant="dashboard" />
            <main className="dashboard-main">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 id="welcomeMessage">{t.welcome}, Sunil Sharma</h2>
                        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                            {status === 'active' ? t.subtitleActive :
                                status === 'holiday' ? t.subtitleHoliday :
                                    t.subtitleFuture}
                        </p>
                    </div>

                    <div className="date-selector" style={{ position: 'relative' }}>
                        <label htmlFor="datePicker" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
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
                            <div style={{ color: 'var(--primary-color)', display: 'flex' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <span style={{ fontWeight: 500, color: 'var(--text-dark)', minWidth: '140px' }}>
                                {new Date(date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <input
                                type="date"
                                id="datePicker"
                                style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', zIndex: 10 }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                {status === 'active' && (
                    <>
                        {/* Quick Stats Overview */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>{t.totalStudents}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '0.5rem' }}>158</div>
                            </div>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>{t.avgAttendance}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary-color)', marginTop: '0.5rem' }}>92%</div>
                            </div>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>{t.classesToday}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '0.5rem' }}>4</div>
                            </div>
                            <div
                                onClick={() => window.location.href = '/leave-management'}
                                style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>Leave Requests</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    4 <span style={{ fontSize: '0.8rem', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>Pending</span>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>{t.yourClasses}</h3>
                        <section className="class-list">
                            {classes.map((cls) => (
                                <ClassCard key={cls.id} {...cls} />
                            ))}
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
