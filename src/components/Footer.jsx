import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <span id="footer.copyright">&copy; 2025 Team StrategIQ — Smart India Hackathon</span> |
      <Link to="/help" id="footer.help">Help & Support</Link>
    </footer>
  );
};

export default Footer;
