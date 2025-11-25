import React from 'react';
import Header from './Header';
import Footer from './Footer';

const PlaceholderPage = ({ title }) => {
    return (
        <>
            <Header variant="landing" />
            <main style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
                <h1>{title}</h1>
                <p>This page is under construction.</p>
            </main>
            <Footer />
        </>
    );
};

export default PlaceholderPage;
