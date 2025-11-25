import React from 'react';

const FeatureCard = ({ icon, title, description, idPrefix }) => {
    return (
        <div className="feature-card">
            <div className="feature-icon">{icon}</div>
            <h3 id={`${idPrefix}.title`}>{title}</h3>
            <p id={`${idPrefix}.desc`}>{description}</p>
        </div>
    );
};

export default FeatureCard;
