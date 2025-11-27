import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const TeacherLogin = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].login;
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
                        <h1>{t.title}</h1>
                        <p>{t.subtitle}</p>
                    </div>

                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="userid">{t.userIdLabel}</label>
                            <input
                                type="text"
                                id="userid"
                                name="userid"
                                placeholder={t.userIdPlaceholder}
                                required
                                value={formData.userid}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">{t.passwordLabel}</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder={t.passwordPlaceholder}
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-actions">
                            <Link to="/forgot-password" id="forgotLink">{t.forgotPassword}</Link>
                        </div>

                        <button type="submit" className="login-btn-primary" id="loginBtn">{t.loginButton}</button>

                        <div className="divider">
                            <span>{t.orDivider}</span>
                        </div>

                        <button type="button" className="otp-btn-outline" id="otpBtn">{t.otpButton}</button>
                    </form>

                    <div className="login-footer">
                        <p>{t.noAccount} <Link to="/contact">{t.register}</Link></p>
                        <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            <Link to="/admin/login" style={{ color: 'var(--text-light)' }}>Admin Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLogin;
