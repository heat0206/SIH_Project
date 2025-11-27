import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language].home;

    return (
        <>
            <Header variant="landing" />
            <main>
                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-content">
                        <div className="badge-new">🚀 Smart Attendance System</div>
                        <h1 id="hero.heading">
                            {t.heroTitle}
                        </h1>
                        <p className="subtitle" id="hero.subtitle">
                            {t.heroSubtitle}
                        </p>
                        <div className="hero-actions">
                            <Link to="/login" className="btn btn-primary btn-large" id="hero.getStarted">
                                {t.getStarted}
                            </Link>
                            <a href="#features" className="btn btn-outline btn-large">
                                {t.learnMore}
                            </a>
                        </div>
                        <div className="trust-badges">
                            <span>Trusted by 50+ Schools</span>
                            <span>•</span>
                            <span>10,000+ Students Tracked</span>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                            alt="Students using smart ID cards"
                        />
                    </div>
                </section>

                {/* Stats Section */}
                <section className="stats-section">
                    <div className="stats-container">
                        <div className="stat-item">
                            <h3>98%</h3>
                            <p>Time Saved</p>
                        </div>
                        <div className="stat-item">
                            <h3>100%</h3>
                            <p>Accuracy</p>
                        </div>
                        <div className="stat-item">
                            <h3>0</h3>
                            <p>Paper Usage</p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features" id="features">
                    <div className="section-header">
                        <h2 id="features.title">{t.featuresTitle}</h2>
                        <p>A complete ecosystem designed for efficiency and transparency.</p>
                    </div>
                    <div className="features-grid">
                        <FeatureCard
                            icon="📡"
                            title={t.feature1Title}
                            description={t.feature1Desc}
                            idPrefix="features.rfid"
                        />
                        <FeatureCard
                            icon="⚡"
                            title={t.feature2Title}
                            description={t.feature2Desc}
                            idPrefix="features.sync"
                        />
                        <FeatureCard
                            icon="🔔"
                            title={t.feature3Title}
                            description={t.feature3Desc}
                            idPrefix="features.alerts"
                        />
                        <FeatureCard
                            icon="📊"
                            title={t.feature4Title}
                            description={t.feature4Desc}
                            idPrefix="features.analytics"
                        />
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works">
                    <div className="section-header">
                        <h2>{t.howItWorksTitle}</h2>
                        <p>Simple steps to modernize your school's attendance.</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>{t.step1}</h3>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>{t.step2}</h3>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>{t.step3}</h3>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">4</div>
                            <h3>{t.step4}</h3>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="cta-content">
                        <h2>{t.ctaTitle}</h2>
                        <p>{t.ctaDesc}</p>
                        <Link to="/login" className="btn btn-white btn-large">
                            {t.ctaButton}
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default Home;
