import React from 'react';
import { Link } from 'react-router-dom';

const ClassCard = ({ className, studentCount, present, absent, isMarked, id }) => {
    return (
        <div className={`class-card ${isMarked ? 'attendance-marked' : ''}`}>
            <div className="class-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="class-title" style={{ fontSize: '1.25rem' }}>{className}</div>
                    {isMarked && (
                        <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                            Marked
                        </div>
                    )}
                </div>
                <div className="student-count" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Total Students: {studentCount}</div>

                <div className="attendance-summary" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    background: 'var(--bg-color)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)'
                }}>
                    {isMarked ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Present</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--secondary-color)' }}>{present}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Absent</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444' }}>{absent}</span>
                            </div>
                        </>
                    ) : (
                        <div style={{ gridColumn: '1 / -1', color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Attendance not marked yet
                        </div>
                    )}
                </div>
            </div>
            <div className="status-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: '1rem' }}>
                <Link to={`/attendance/view?classId=${id}`} className="view-edit-link" style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '0.75rem',
                    background: isMarked ? 'white' : 'var(--primary-color)',
                    color: isMarked ? 'var(--primary-color)' : 'white',
                    border: isMarked ? '1px solid var(--border-color)' : 'none',
                    boxShadow: isMarked ? 'none' : 'var(--shadow-md)'
                }}>
                    {isMarked ? 'View / Edit Attendance' : 'Mark Attendance Now'}
                </Link>
            </div>
        </div>
    );
};

export default ClassCard;
