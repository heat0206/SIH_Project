import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';

const Home = () => {
    return (
        <>
            <Header variant="landing" />
            <main>
                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-content">
                        <div className="badge-new">🚀 Smart Attendance System</div>
                        <h1 id="hero.heading">
                            Next-Gen <span className="highlight-text">RFID Attendance</span> for Modern Schools.
                        </h1>
                        <p className="subtitle" id="hero.subtitle">
                            Automate attendance, eliminate paperwork, and ensure student safety with our real-time RFID tracking and SMS notification system.
                        </p>
                        <div className="hero-actions">
                            <Link to="/login" className="btn btn-primary btn-large" id="hero.getStarted">
                                Get Started
                            </Link>
                            <a href="#features" className="btn btn-outline btn-large">
                                Learn More
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
                        <h2 id="features.title">Why Choose StrategIQ?</h2>
                        <p>A complete ecosystem designed for efficiency and transparency.</p>
                    </div>
                    <div className="features-grid">
                        <FeatureCard
                            icon="📡"
                            title="RFID Technology"
                            description="Contactless attendance tracking using secure RFID tags. Fast, accurate, and durable."
                            idPrefix="features.rfid"
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Real-time Sync"
                            description="Attendance data is instantly synced to the cloud (Firebase) and accessible from anywhere."
                            idPrefix="features.sync"
                        />
                        <FeatureCard
                            icon="🔔"
                            title="Instant Alerts"
                            description="Parents receive immediate SMS/WhatsApp notifications when their child arrives or leaves."
                            idPrefix="features.alerts"
                        />
                        <FeatureCard
                            icon="📊"
                            title="Smart Analytics"
                            description="Visual dashboards to track attendance trends, identifying irregular students early."
                            idPrefix="features.analytics"
                        />
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Simple steps to modernize your school's attendance.</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Issue Smart Cards</h3>
                            <p>Distribute RFID-enabled ID cards to every student.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Tap to Mark</h3>
                            <p>Students tap their card on the reader at the entrance.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Instant Update</h3>
                            <p>Dashboard updates instantly and parents get notified.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="cta-content">
                        <h2>Ready to upgrade your campus?</h2>
                        <p>Join the digital revolution in education today.</p>
                        <Link to="/login" className="btn btn-white btn-large">
                            Start Free Trial
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default Home;
