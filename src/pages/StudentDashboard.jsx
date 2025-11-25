import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StudentDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (location.state?.student) {
            setStudent(location.state.student);

            const mockSubjects = [
                { name: 'Mathematics', attended: 42, total: 45, color: '#4F46E5', icon: '📐' },
                { name: 'Science', attended: 38, total: 45, color: '#10B981', icon: '🧬' },
                { name: 'English', attended: 40, total: 45, color: '#F59E0B', icon: '📚' },
                { name: 'Hindi', attended: 44, total: 45, color: '#EC4899', icon: '🕉️' },
                { name: 'Social Studies', attended: 35, total: 45, color: '#8B5CF6', icon: '🌍' }
            ];
            setSubjects(mockSubjects);
        } else {
            navigate('/student-login');
        }
    }, [location, navigate]);

    if (!student) return <div className="loading">Loading dashboard...</div>;

    const calculatePercentage = (attended, total) => Math.round((attended / total) * 100);
    const overallPercentage = Math.round(subjects.reduce((acc, sub) => acc + (sub.attended / sub.total), 0) / subjects.length * 100);

    return (
        <div className="dashboard-layout">
            <Header variant="dashboard" role="student" />

            <div className="dashboard-container">
                {/* Sidebar / Profile Section */}
                <aside className="dashboard-sidebar">
                    <div className="profile-card">
                        <div className="profile-header-bg"></div>
                        <div className="profile-content">
                            <img src={student.photo} alt="Profile" className="profile-avatar" />
                            <h3>{student.name}</h3>
                            <p className="student-id">ID: {student.id}</p>
                            <div className="profile-details">
                                <div className="detail-row">
                                    <span>Class</span>
                                    <strong>{student.classId || '8th Grade'}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Roll No</span>
                                    <strong>{student.roll}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Section</span>
                                    <strong>A</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-stats-card">
                        <h4>Quick Stats</h4>
                        <div className="quick-stat">
                            <span>Total Classes</span>
                            <strong>225</strong>
                        </div>
                        <div className="quick-stat">
                            <span>Present</span>
                            <strong>199</strong>
                        </div>
                        <div className="quick-stat">
                            <span>Absent</span>
                            <strong className="text-danger">26</strong>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="dashboard-content">
                    {/* Welcome Banner */}
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h1>Hello, {student.name.split(' ')[0]}! 👋</h1>
                            <p>Here is your attendance overview for this semester.</p>
                        </div>
                        <div className="overall-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray={`${overallPercentage}, 100`}
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">{overallPercentage}%</text>
                            </svg>
                            <span>Overall Attendance</span>
                        </div>
                    </div>

                    {/* Subjects Grid */}
                    <h3 className="section-header-left">Subject Performance</h3>
                    <div className="subjects-grid-refined">
                        {subjects.map((sub) => {
                            const percentage = calculatePercentage(sub.attended, sub.total);
                            const status = percentage >= 75 ? 'Good' : percentage >= 60 ? 'Average' : 'Low';
                            const statusColor = percentage >= 75 ? '#10B981' : percentage >= 60 ? '#F59E0B' : '#EF4444';

                            return (
                                <div key={sub.name} className="subject-card-refined">
                                    <div className="card-top">
                                        <div className="subject-icon" style={{ background: sub.color + '20' }}>
                                            {sub.icon}
                                        </div>
                                        <div className="subject-info">
                                            <h4>{sub.name}</h4>
                                            <span className="status-badge" style={{ color: statusColor, background: statusColor + '15' }}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="attendance-stat-row">
                                        <div className="stat-group">
                                            <span className="label">Attended</span>
                                            <span className="value">{sub.attended}/{sub.total}</span>
                                        </div>
                                        <div className="stat-group text-right">
                                            <span className="label">Percentage</span>
                                            <span className="value" style={{ color: sub.color }}>{percentage}%</span>
                                        </div>
                                    </div>

                                    <div className="progress-bar-refined">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${percentage}%`, backgroundColor: sub.color }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default StudentDashboard;
