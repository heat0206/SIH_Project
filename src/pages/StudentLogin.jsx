import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

const StudentLogin = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { login, currentUser } = useAuth();
    const t = translations[language].studentLogin;
    
    const [formData, setFormData] = useState({
        userid: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    React.useEffect(() => {
        if (currentUser) {
            navigate('/parent-dashboard');
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
        setLoading(true);
        setError('');

        try {
            await login(formData.userid, formData.password, rememberMe);
            // Navigation handled by useEffect
        } catch (err) {
            console.error("Login failed", err);
            setError('Failed to log in. Please check your credentials.');
            setLoading(false);
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
            <div className="login-image-side" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')" }}>
                <div className="login-overlay">
                    <div className="login-quote">
                        <h2>"{t.quote}"</h2>
                        <p>{t.quoteSubtitle}</p>
                    </div>
                </div>
            </div>
            <div className="login-form-side">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <h1>{t.title}</h1>
                        <p>{t.subtitle}</p>
                    </div>

                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    <form id="studentLoginForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="userid">{t.idLabel}</label>
                            <input
                                type="text"
                                id="userid"
                                name="userid"
                                placeholder={t.idPlaceholder}
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

                        <div className="form-actions" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ marginRight: '0.5rem', width: 'auto' }}
                            />
                            <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Remember Me</label>
                        </div>

                        <button type="submit" className="login-btn-primary" id="loginBtn" disabled={loading}>
                            {loading ? t.buttonLoading : t.buttonDefault}
                        </button>

                        <div className="login-footer">
                            <p>{t.footerText} <Link to="/contact">{t.footerLink}</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
