import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import logo from '../assets/logo.jpg';

const Header = ({ variant = 'landing' }) => {
    const location = useLocation();
    const { language, switchLanguage } = useLanguage();
    const t = translations[language].header;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const timeoutRef = React.useRef(null);

    const toggleLanguage = () => {
        switchLanguage(language === 'en' ? 'hi' : 'en');
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300);
    };

    return (
        <header className={variant === 'landing' ? 'landing-header' : 'main-header'}>
            <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
                <span>Smart Attendance</span>
            </Link>

            {variant === 'landing' ? (
                <div className="auth-buttons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={toggleLanguage}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: 'var(--primary-color)'
                        }}
                    >
                        {language === 'en' ? 'HI' : 'EN'}
                    </button>
                    <Link to="/login" className="btn btn-primary">
                        <span style={{ marginRight: '6px' }}>👨‍🏫</span> {t.teacherLogin}
                    </Link>
                    <Link to="/student/login" className="btn btn-outline">
                        <span style={{ marginRight: '6px' }}>🎓</span> {t.studentLogin}
                    </Link>
                    <Link to="/admin/login" className="btn btn-ghost">
                        <span style={{ marginRight: '6px' }}>🛡️</span> Admin
                    </Link>
                </div>
            ) : (
                <nav className="main-nav" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <div className="nav-left">
                        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>{t.dashboard}</Link>
                        <Link to="/reports" className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}>{t.reports}</Link>
                    </div>
                    <div className="nav-right" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="lang-switch" style={{ marginRight: '1.5rem' }}>
                            <button
                                onClick={toggleLanguage}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    color: 'var(--primary-color)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {language === 'en' ? 'हिंदी' : 'English'}
                            </button>
                        </div>
                        <div
                            className="user-dropdown"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 600 }}>SS</div>
                                <span>Sunil Sharma</span>
                            </div>
                            {isDropdownOpen && (
                                <div className="dropdown-content" style={{ display: 'block' }}>
                                    <Link to="/profile">{t.profile}</Link>
                                    <Link to="/help">{t.help}</Link>
                                    <Link to="/">{t.logout}</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
