import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-500 text-sm text-center md:text-left">
          <span id="footer.copyright">&copy; 2025 Team StrategIQ — Smart India Hackathon</span>
          <span className="mx-2 text-gray-300">|</span>
          <Link to="/help" id="footer.help" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            Help & Support
          </Link>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">
            System Status: Online
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
