import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="login-split-container">
            <div className="login-image-side">
                <div className="login-overlay">
                    <div className="login-quote">
                        <h2>"Education is the passport to the future."</h2>
                        <p>Empowering schools with smart technology.</p>
                    </div>
                </div>
            </div>
            <div className="login-form-side">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Please sign in to your account</p>
                    </div>

                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="userid">User ID / Mobile</label>
                            <input
                                type="text"
                                id="userid"
                                name="userid"
                                placeholder="Enter your ID"
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
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-actions">
                            <Link to="/forgot-password" id="forgotLink">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="login-btn-primary" id="loginBtn">Sign In</button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <button type="button" className="otp-btn-outline" id="otpBtn">Login with OTP</button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/contact">Contact Admin</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLogin;
