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
                <section className="hero">
                    <div className="hero-content">
                        <h1 id="hero.heading">Digitizing Attendance, Empowering Education.</h1>
                        <p className="subtitle" id="hero.subtitle">
                            A low-cost, user-friendly attendance system using facial recognition, designed for the needs of rural Indian schools.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-large" id="hero.getStarted">Get Started</Link>
                    </div>

                    <div className="hero-image">
                        <img src="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Teacher with students in a rural classroom" />
                    </div>
                </section>

                <section className="features">
                    <h2 id="features.title">Why Choose StrategIQ?</h2>
                    <div className="features-grid">
                        <FeatureCard
                            icon="⏱️"
                            title="Instant Attendance"
                            description="Mark attendance for an entire class in seconds using a single photo, saving valuable instructional time."
                            idPrefix="features.instant"
                        />
                        <FeatureCard
                            icon="🌐"
                            title="Works Offline"
                            description="Our system is designed for rural areas. Mark attendance without an internet connection and sync data later."
                            idPrefix="features.offline"
                        />
                        <FeatureCard
                            icon="📊"
                            title="Automated Reports"
                            description="Generate daily, monthly, and Mid-Day Meal scheme reports with a single click, eliminating manual errors."
                            idPrefix="features.reports"
                        />
                        <FeatureCard
                            icon="📱"
                            title="Simple & Accessible"
                            description="Works on any basic smartphone with no need for expensive hardware. The interface is available in multiple languages."
                            idPrefix="features.accessible"
                        />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default Home;
