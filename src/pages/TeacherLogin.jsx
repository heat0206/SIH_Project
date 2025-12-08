import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

const TeacherLogin = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].login;
    const [formData, setFormData] = useState({
        userid: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);

    const { login, currentUser } = useAuth(); // Get login function from context
    const [error, setError] = useState('');

    // Redirect if already logged in
    React.useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // Attempt to login with Firebase
            await login(formData.userid, formData.password, rememberMe);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed", err);
            setError('Failed to log in. Please check your credentials.');
        }
    };

    // Check for offline status
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="login-split-container">
            {!isOnline && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#f59e0b', color: 'black', padding: '0.5rem', textAlign: 'center', zIndex: 9999 }}>
                    ⚠️ You are offline. You can login if you have used this device before.
                </div>
            )}
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

                        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ marginRight: '0.5rem', width: 'auto' }}
                                />
                                <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{t.rememberMe}</label>
                            </div>
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
