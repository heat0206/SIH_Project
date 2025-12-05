import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const HelpandSupport = () => {
    const { language } = useLanguage();
    const t = translations[language].helpSupport;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Header variant="landing" />

            <main style={{ flex: 1, padding: '6rem 20px 2rem 20px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '20px' }}>{t.title}</h1>

                    <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>{t.faqTitle}</h2>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: '#000', fontSize: '18px', marginBottom: '8px' }}>{t.faq1Question}</h3>
                            <p style={{ color: '#666' }}>{t.faq1Answer}</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: '#000', fontSize: '18px', marginBottom: '8px' }}>{t.faq2Question}</h3>
                            <p style={{ color: '#666' }}>{t.faq2Answer}</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: '#000', fontSize: '18px', marginBottom: '8px' }}>{t.faq3Question}</h3>
                            <p style={{ color: '#666' }}>{t.faq3Answer}</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>{t.contactTitle}</h2>
                        <p style={{ color: '#666', marginBottom: '15px' }}>{t.contactDesc}</p>
                        <p style={{ color: '#0066cc', marginBottom: '8px' }}><strong>{t.emailLabel}</strong> support@strategiq.edu</p>
                        <p style={{ color: '#0066cc' }}><strong>{t.phoneLabel}</strong> +91 12345 67890</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HelpandSupport;
