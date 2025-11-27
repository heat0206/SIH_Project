import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const StudentLogin = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].studentLogin;
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

        // Simulate a short delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));

        // Bypass validation as per user request
        const studentData = {
            id: formData.userid || 'S-GUEST',
            name: "Guest Student",
            roll: "N/A",
            classId: "8th Grade",
            photo: "https://via.placeholder.com/150"
        };

        navigate('/student-dashboard', { state: { student: studentData } });
        setLoading(false);
    };

    return (
        <div className="login-split-container">
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
