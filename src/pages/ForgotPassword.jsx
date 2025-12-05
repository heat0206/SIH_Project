import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const ForgotPassword = () => {
    const { language } = useLanguage();
    const t = translations[language].forgotPassword;

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage(t.successMessage);
            setEmail('');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError(t.errorNotFound);
            } else if (err.code === 'auth/invalid-email') {
                setError(t.errorInvalid);
            } else {
                setError(t.errorGeneric);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Header variant="landing" />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '2.5rem 2rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937', textAlign: 'center' }}>
                        {t.title}
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
                        {t.subtitle}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: '#6b7280' }}>
                                {t.emailLabel}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {message && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#d1fae5',
                                color: '#065f46',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                backgroundColor: loading ? '#9ca3af' : '#4f46e5',
                                color: 'white',
                                marginBottom: '1rem'
                            }}
                        >
                            {loading ? t.sending : t.sendButton}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                            <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>
                                {t.backToLogin}
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
