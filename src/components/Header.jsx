import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import logo from '../assets/logo.jpg';

const Header = ({ variant = 'landing' }) => {
    const location = useLocation();
    const { language, switchLanguage } = useLanguage();
    const t = translations[language].header;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const timeoutRef = React.useRef(null);

    const toggleLanguage = () => {
        switchLanguage(language === 'en' ? 'hi' : 'en');
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300);
    };

    return (
        <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Left Section: Branding */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img className="h-12 w-auto" src={logo} alt="StrategIQ Logo" />
                        </Link>
                        <div className="flex flex-col justify-center border-l border-gray-300 pl-4 h-10">
                            <h1 className="text-xl font-bold text-[#1e3a8a] leading-none tracking-tight">
                                Digital Hazri
                            </h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">
                                Rural Education Initiative
                            </p>
                        </div>
                    </div>

                    {/* Right Section: Utilities */}
                    <div className="flex items-center gap-6">
                        {/* Network Status */}
                        <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                                Online
                            </span>
                        </div>

                        {/* Help Link */}
                        <Link to="/help" className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-[#1e3a8a] transition-colors group">
                            <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Help / सहायता</span>
                        </Link>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-full p-1 pr-4 transition-colors border border-gray-200"
                        >
                            <span className="bg-white text-[#1e3a8a] text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-gray-100 mr-2">
                                {language === 'en' ? 'EN' : 'HI'}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                                {language === 'en' ? 'English' : 'हिन्दी'}
                            </span>
                        </button>

                        {/* User Profile (Only for logged in / dashboard view) */}
                        {variant !== 'landing' && (
                            <div
                                className="relative ml-2"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="h-9 w-9 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-semibold shadow-sm">
                                        SS
                                    </div>
                                    <span className="hidden lg:block text-sm font-medium text-gray-700">Sunil Sharma</span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1e3a8a]">
                                            {t.profile}
                                        </Link>
                                        <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1e3a8a]">
                                            {t.help}
                                        </Link>
                                        <Link to="/" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                            {t.logout}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
