import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Utensils, Calendar, MessageCircle, Clock, ChevronDown, CalendarDays } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.parentDashboard || {};

    const [selectedChild, setSelectedChild] = useState('rohan');

    const children = {
        rohan: { name: 'Rohan', class: 'Class 8', status: 'present' },
        priya: { name: 'Priya', class: 'Class 5', status: 'present' }
    };

    const currentChild = children[selectedChild];

    // Mock Calendar Data
    const calendarDays = Array.from({ length: 30 }, (_, i) => {
        const status = Math.random() > 0.8 ? 'absent' : Math.random() > 0.9 ? 'holiday' : 'present';
        return { day: i + 1, status };
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-6 max-w-lg">
                {/* Parent Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t.greeting || 'Namaste, Rajesh Ji'}</h1>
                        <p className="text-sm text-gray-500">{t.welcomeMessage || 'Welcome to Parent Portal'}</p>
                    </div>

                    {/* Child Switcher */}
                    <div className="relative">
                        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
                            {currentChild.name} ({currentChild.class})
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                {/* Hero Status Card */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-fit p-2 rounded-xl mb-4 backdrop-blur-sm">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                            {currentChild.name} {t.isSafe || 'is Safe at School'}
                        </h2>
                        <p className="text-green-50 font-medium flex items-center gap-2">
                            <Clock size={16} />
                            {t.clockedIn || 'Clocked in at 08:15 AM via Face ID'}
                        </p>
                    </div>
                </div>

                {/* Nutrition Tracker */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t.poshanStatus || 'Poshan Status'}</h3>
                        <p className="text-green-600 font-medium text-sm flex items-center gap-1">
                            ✅ {t.mealServed || 'Mid-Day Meal Served Today'}
                        </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-full">
                        <Utensils size={24} className="text-orange-500" />
                    </div>
                </div>

                {/* Attendance Calendar Widget */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-24">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CalendarDays size={20} className="text-blue-600" />
                            {t.attendance || 'Attendance'}
                        </h3>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            85% {t.thisMonth || 'This Month'}
                        </span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-xs font-bold text-gray-400">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day) => (
                            <div key={day.day} className="flex flex-col items-center gap-1">
                                <span className="text-xs font-medium text-gray-700">{day.day}</span>
                                <div className={`w-2 h-2 rounded-full ${day.status === 'present' ? 'bg-green-500' :
                                    day.status === 'absent' ? 'bg-red-500' : 'bg-yellow-400'
                                    }`}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> {t.present || 'Present'}</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> {t.absent || 'Absent'}</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> {t.holiday || 'Holiday'}</div>
                    </div>
                </div>

            </main>

            {/* Bottom Quick Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 z-40">
                <div className="container mx-auto max-w-lg grid grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/student/leave')}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
                    >
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-medium">{t.applyLeave || 'Apply Leave'}</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:scale-95 transition-all">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <MessageCircle size={24} />
                        </div>
                        <span className="text-xs font-medium">{t.message || 'Message'}</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 active:scale-95 transition-all">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-medium">{t.timetable || 'Timetable'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
