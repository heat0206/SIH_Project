import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const TeacherLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userid: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add authentication logic here
        console.log('Login attempt with:', formData);
        // For now, redirect to dashboard as per legacy behavior
        navigate('/dashboard');
    };

    return (
        <div className="auth-bg">
            <div className="auth-container">
                <div className="auth-card">
                    <h2 id="loginTitle">Login</h2>
                    <form id="loginForm" onSubmit={handleSubmit}>
                        <label htmlFor="userid" id="useridLabel">Mobile Number or User ID</label>
                        <input
                            type="text"
                            id="userid"
                            name="userid"
                            required
                            value={formData.userid}
                            onChange={handleChange}
                        />

                        <label htmlFor="password" id="passwordLabel">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />

                        <button type="submit" className="login-btn" id="loginBtn">Login</button>
                        <button type="button" className="otp-btn" id="otpBtn">Login with OTP</button>
                    </form>
                    <div className="auth-links">
                        <Link to="/forgot-password" id="forgotLink">Forgot Password?</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TeacherLogin;
