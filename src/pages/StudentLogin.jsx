import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const StudentLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userid: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create a timeout promise
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 2000)
            );

            // Try to find the student in Firestore to get real data
            const studentsRef = collection(db, 'students');
            // Check against 'id' (e.g., S001) or 'name'
            const q = query(studentsRef, where('id', '==', formData.userid));

            // Race between Firestore query and timeout
            const querySnapshot = await Promise.race([
                getDocs(q),
                timeout
            ]);

            let studentData = null;

            if (!querySnapshot.empty) {
                // Found the student!
                const doc = querySnapshot.docs[0];
                studentData = { id: doc.id, ...doc.data() };
                console.log("Student found:", studentData);
            } else {
                // Not found, but user requested lenient login.
                // Create a dummy student object so they can still see the dashboard.
                console.log("Student not found, using dummy data.");
                studentData = {
                    id: formData.userid || 'S-GUEST',
                    name: "Guest Student",
                    roll: "N/A",
                    classId: "8th Grade",
                    photo: "https://via.placeholder.com/150"
                };
            }

            // Navigate to dashboard with student data
            navigate('/student-dashboard', { state: { student: studentData } });

        } catch (error) {
            console.error("Login error or timeout:", error);
            // Even on error, let them in for now as per request
            const dummyData = {
                id: formData.userid || 'S-ERROR',
                name: "Student (Offline)",
                roll: "00",
                classId: "Unknown",
                photo: "https://via.placeholder.com/150"
            };
            navigate('/student-dashboard', { state: { student: dummyData } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-container">
            <div className="login-image-side" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')" }}>
                <div className="login-overlay">
                    <div className="login-quote">
                        <h2>"The beautiful thing about learning is that no one can take it away from you."</h2>
                        <p>Track your progress, achieve your goals.</p>
                    </div>
                </div>
            </div>
            <div className="login-form-side">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <h1>Student Portal</h1>
                        <p>View your attendance and performance</p>
                    </div>

                    <form id="studentLoginForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="userid">Student ID / Roll No</label>
                            <input
                                type="text"
                                id="userid"
                                name="userid"
                                placeholder="Enter your ID (e.g., S001)"
                                required
                                value={formData.userid}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Any password works"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="login-btn-primary" id="loginBtn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Check Attendance'}
                        </button>

                        <div className="login-footer">
                            <p>Having trouble? <Link to="/contact">Contact Teacher</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
