import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

ChartJS.register(ArcElement, Tooltip, Legend);

const AttendanceView = () => {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId') || 'default';
    const { language } = useLanguage();
    const t = translations[language]?.attendance || {};
    const tDashboard = translations[language]?.dashboard || {};

    // Initial Mock Data
    const initialStudents = Array.from({ length: 8 }).map((_, i) => ({
        id: `student-${i}`,
        roll: i + 1,
        name: `Student ${i + 1}`,
        photo: `https://i.pravatar.cc/100?img=${(i % 70) + 1}`,
        present: Math.random() > 0.3, // Random initial status
        classId: classId === 'default' ? 'VI-B' : classId,
        rfid_tag: `${1001 + i}`
    }));

    const [students, setStudents] = useState(initialStudents);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [density, setDensity] = useState('comfortable');
    const [loading, setLoading] = useState(false);

    // RFID Scanning Logic (Mock)
    useEffect(() => {
        let buffer = '';

        const handleKeyDown = async (e) => {
            if (e.target.tagName === 'INPUT') return;

            if (e.key === 'Enter') {
                if (buffer) {
                    await handleRFIDScan(buffer);
                    buffer = '';
                }
            } else if (e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [students]);

    const handleRFIDScan = async (tagId) => {
        const studentIndex = students.findIndex(s => s.rfid_tag == tagId);
        if (studentIndex !== -1) {
            const student = students[studentIndex];
            if (!student.present) {
                toggleAttendance(student);
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play();
                } catch (e) { console.log("Audio play failed", e); }
            }
        }
    };

    const toggleAttendance = (student) => {
        setStudents(prev => prev.map(s =>
            s.id === student.id ? { ...s, present: !s.present } : s
        ));
    };

    const markAllPresent = () => {
        if (!window.confirm("Mark all students as present?")) return;
        setStudents(prev => prev.map(s => ({ ...s, present: true })));
    };

    const handleNotify = (name) => {
        const msg = `This is to notify you that ${name} is absent for the class on ${new Date().toLocaleDateString()}.`;
        if (window.confirm(`Send SMS notification to parent?\n\nMessage: "${msg}"`)) {
            alert('SMS notification sent successfully!');
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(s.roll || '').includes(searchTerm);
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'present' ? s.present : !s.present;
        return matchesSearch && matchesFilter;
    });

    const presentCount = students.filter(s => s.present).length;
    const absentCount = students.length - presentCount;

    const chartData = {
        labels: [t.present || 'Present', t.absent || 'Absent'],
        datasets: [{
            data: [presentCount, absentCount],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        cutout: '75%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    };

    const backLabel = tDashboard?.backToDashboard || "Back to Dashboard";

    return (
        <>
            <Header variant="dashboard" />
            <Link to="/dashboard" className="back-fab" aria-label={backLabel} title={backLabel} style={{
                position: 'fixed', left: '2rem', top: '100px', zIndex: 2000,
                width: '40px', height: '40px', borderRadius: '50%', background: 'white',
                boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-dark)', border: '1px solid var(--border-color)', transition: 'transform 0.2s ease'
            }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Link>

            <main className="main-container" style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem', alignItems: 'flex-start' }}>
                <div className="attendance-detail-container" style={{ flex: 1 }}>
                    <div className="detail-header" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem',
                        background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)'
                    }}>
                        <div>
                            <div className="detail-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                                {classId === 'default' ? 'Class VI - Section B' : `Class ${classId}`}
                            </div>
                            <div className="detail-meta" style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '0.25rem' }}>
                                {t.markedOn}: <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="summary-chips" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <span className="chip success" style={{ background: '#ecfdf5', color: '#059669', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #d1fae5' }}>{t.present}: {presentCount}</span>
                                <span className="chip warn" style={{ background: '#fef2f2', color: '#dc2626', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #fee2e2' }}>{t.absent}: {absentCount}</span>
                                <span className="chip" style={{ background: '#f3f4f6', color: '#374151', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e5e7eb' }}>{t.total}: {students.length}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={markAllPresent} className="btn-sm" style={{
                                padding: '0.75rem 1.25rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                                cursor: 'pointer', fontWeight: 500, boxShadow: 'var(--shadow-sm)', transition: 'background 0.2s ease'
                            }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-color)'}
                            >
                                {t.markAllPresent}
                            </button>
                        </div>
                    </div>

                    <div className="toolbar" style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="toolbar-inner" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="tabs" style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                                {['all', 'present', 'absent'].map(filterKey => (
                                    <button
                                        key={filterKey}
                                        onClick={() => setFilter(filterKey)}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            border: 'none',
                                            background: filter === filterKey ? 'white' : 'transparent',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: filter === filterKey ? 600 : 500,
                                            color: filter === filterKey ? 'var(--primary-color)' : 'var(--text-light)',
                                            boxShadow: filter === filterKey ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {t[filterKey] || filterKey}
                                    </button>
                                ))}
                            </div>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    placeholder={t.searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '8px',
                                        fontSize: '0.95rem', transition: 'border-color 0.2s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                />
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`list-shell ${density}`} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="list-header" style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '1rem 1.5rem', background: '#f9fafb',
                            borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)'
                        }}>
                            <div>{t.studentDetails}</div>
                            <div>{t.status}</div>
                            <div>{t.actions}</div>
                        </div>
                        <div className="student-list">
                            {filteredStudents.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No students found.</div>
                            ) : (
                                filteredStudents.map(s => (
                                    <div key={s.id} className="student-row" style={{
                                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '1rem 1.5rem',
                                        borderBottom: '1px solid var(--border-color)', alignItems: 'center', transition: 'background 0.1s ease'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={s.photo || 'https://via.placeholder.com/100'} alt={s.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-dark)' }}>{s.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '2px' }}>Roll #{s.roll} • ID: {s.rfid_tag || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={s.present || false}
                                                    onChange={() => toggleAttendance(s)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span className="slider" style={{
                                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                    backgroundColor: s.present ? '#10b981' : '#e5e7eb', borderRadius: '34px', transition: '.3s ease'
                                                }}>
                                                    <span style={{
                                                        position: 'absolute', content: '""', height: '22px', width: '22px', left: s.present ? '26px' : '4px', bottom: '3px',
                                                        backgroundColor: 'white', borderRadius: '50%', transition: '.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }}></span>
                                                </span>
                                            </label>
                                            <span style={{
                                                fontSize: '0.85rem', fontWeight: 600,
                                                color: s.present ? '#059669' : '#dc2626',
                                                minWidth: '60px'
                                            }}>
                                                {s.present ? t.present : t.absent}
                                            </span>
                                        </div>
                                        <div>
                                            {!s.present && (
                                                <button
                                                    onClick={() => handleNotify(s.name)}
                                                    style={{
                                                        padding: '0.5rem 1rem', fontSize: '0.85rem', border: '1px solid #e5e7eb',
                                                        background: 'white', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500,
                                                        display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = 'var(--text-dark)'; }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                        <polyline points="22,6 12,13 2,6"></polyline>
                                                    </svg>
                                                    {t.notifyParent}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="chart-container" style={{ width: '340px', flexShrink: 0 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', position: 'sticky', top: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>{t.overview}</h3>
                        <div style={{ height: '220px', marginBottom: '2rem', position: 'relative' }}>
                            <Doughnut data={chartData} options={chartOptions} />
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                textAlign: 'center', pointerEvents: 'none'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>
                                    {students.length > 0 ? ((presentCount / students.length) * 100).toFixed(0) : 0}%
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{t.present}</div>
                            </div>
                        </div>
                        <div className="chart-legend" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
                                    <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{t.present}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#059669' }}>{presentCount}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
                                    <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{t.absent}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#dc2626' }}>{absentCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default AttendanceView;
