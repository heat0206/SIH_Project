import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Header = ({ variant = 'landing', role = 'admin' }) => {
    const setLanguage = (lang) => {
        // Placeholder for language logic
        console.log('Set language to', lang);
    };

    return (
        <header className={variant === 'landing' ? 'landing-header' : 'main-header'}>
            {variant === 'dashboard' ? (
                <div className="nav-left">
                    <Link to="/" className="logo">
                        <img src={logo} alt="StrategIQ Logo" style={{ height: '60px', width: 'auto', display: 'block' }} />
                    </Link>
                    <nav className="main-nav">
                        <Link to="/dashboard" className="nav-link active" id="navDashboard">Dashboard</Link>
                        {role !== 'student' && (
                            <Link to="/reports" className="nav-link admin-only" id="navReports">Reports</Link>
                        )}
                    </nav>
                </div>
            ) : (
                <>
                    <Link to="/" className="logo">
                        <img src={logo} alt="StrategIQ Logo" style={{ height: '60px', width: 'auto', display: 'block' }} />
                    </Link>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="lang-switch">
                            <a href="#" onClick={(e) => { e.preventDefault(); setLanguage('en'); }} className="active">English</a> |
                            <a href="#" onClick={(e) => { e.preventDefault(); setLanguage('hi'); }}>हिन्दी</a>
                        </div>
                        <Link to="/login" className="btn btn-primary" id="nav.teacherLogin">Teacher Login</Link>
                        <Link to="/student-login" className="btn btn-primary" id="nav.studentLogin">Student Login</Link>
                    </nav>
                </>
            )}

            {variant === 'dashboard' && (
                <div className="nav-right">
                    <div className="lang-switch">
                        <a href="#" onClick={(e) => { e.preventDefault(); setLanguage('en'); }} className="active">English</a> |
                        <a href="#" onClick={(e) => { e.preventDefault(); setLanguage('hi'); }}>हिन्दी</a>
                    </div>
                    <div className="user-dropdown">
                        <div className="user-name">Sunil Sharma ▼</div>
                        <div className="dropdown-content">
                            <Link to="/profile" id="profileLink">My Profile</Link>
                            <Link to="/logout" className="logout-btn" id="logoutLink">Logout</Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
