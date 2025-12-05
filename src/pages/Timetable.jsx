import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { Clock, Calendar, BookOpen, User } from 'lucide-react';

const Timetable = () => {
    const { language } = useLanguage();
    const t = translations[language]?.timetable || {
        title: "Class Timetable",
        subtitle: "Weekly Schedule for your child",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        time: "Time",
        subject: "Subject",
        teacher: "Teacher",
        room: "Room"
    };

    // Mock data for timetable
    const timetableData = {
        days: [
            { id: 'mon', name: 'Monday' },
            { id: 'tue', name: 'Tuesday' },
            { id: 'wed', name: 'Wednesday' },
            { id: 'thu', name: 'Thursday' },
            { id: 'fri', name: 'Friday' },
            { id: 'sat', name: 'Saturday' }
        ],
        schedule: {
            mon: [
                { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '10:00 - 11:00', subject: 'Science', teacher: 'Mr. Verma', room: 'Lab 2', color: 'bg-green-100 text-green-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'English', teacher: 'Ms. Rita', room: '101', color: 'bg-yellow-100 text-yellow-700' },
                { time: '12:30 - 01:30', subject: 'History', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
            ],
            tue: [
                { time: '09:00 - 10:00', subject: 'Science', teacher: 'Mr. Verma', room: '101', color: 'bg-green-100 text-green-700' },
                { time: '10:00 - 11:00', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Hindi', teacher: 'Mrs. Gupta', room: '101', color: 'bg-orange-100 text-orange-700' },
                { time: '12:30 - 01:30', subject: 'Geography', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
            ],
            wed: [
                { time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Rita', room: '101', color: 'bg-yellow-100 text-yellow-700' },
                { time: '10:00 - 11:00', subject: 'Hindi', teacher: 'Mrs. Gupta', room: '101', color: 'bg-orange-100 text-orange-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '12:30 - 01:30', subject: 'Sports', teacher: 'Coach Singh', room: 'Ground', color: 'bg-purple-100 text-purple-700' },
            ],
            thu: [
                { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '10:00 - 11:00', subject: 'Computer', teacher: 'Ms. Das', room: 'Comp Lab', color: 'bg-indigo-100 text-indigo-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Science', teacher: 'Mr. Verma', room: 'Lab 2', color: 'bg-green-100 text-green-700' },
                { time: '12:30 - 01:30', subject: 'English', teacher: 'Ms. Rita', room: '101', color: 'bg-yellow-100 text-yellow-700' },
            ],
            fri: [
                { time: '09:00 - 10:00', subject: 'History', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
                { time: '10:00 - 11:00', subject: 'Geography', teacher: 'Mr. Khan', room: '101', color: 'bg-red-100 text-red-700' },
                { time: '11:00 - 11:30', subject: 'Break', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
                { time: '11:30 - 12:30', subject: 'Mathematics', teacher: 'Mrs. Sharma', room: '101', color: 'bg-blue-100 text-blue-700' },
                { time: '12:30 - 01:30', subject: 'Art', teacher: 'Ms. Roy', room: 'Art Room', color: 'bg-pink-100 text-pink-700' },
            ],
            sat: [
                { time: '09:00 - 10:00', subject: 'Activity', teacher: 'All Teachers', room: 'Hall', color: 'bg-teal-100 text-teal-700' },
                { time: '10:00 - 11:00', subject: 'Library', teacher: 'Mrs. Rao', room: 'Library', color: 'bg-amber-100 text-amber-700' },
                { time: '11:00 - 11:30', subject: 'Early Dismissal', teacher: '', room: '', color: 'bg-gray-100 text-gray-500' },
            ]
        }
    };

    const [activeDay, setActiveDay] = useState('mon');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="text-blue-600" />
                        {t.title || "Class Timetable"}
                    </h1>
                    <p className="text-gray-500 mt-2">{t.subtitle || "Weekly Schedule for your child"}</p>
                </div>

                {/* Day Selector - Scrollable on mobile */}
                <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                    {timetableData.days.map((day) => (
                        <button
                            key={day.id}
                            onClick={() => setActiveDay(day.id)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${activeDay === day.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {t.days ? t.days[["mon", "tue", "wed", "thu", "fri", "sat"].indexOf(day.id)] : day.name}
                        </button>
                    ))}
                </div>

                {/* Timetable Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">
                            {t.days ? t.days[["mon", "tue", "wed", "thu", "fri", "sat"].indexOf(activeDay)] : timetableData.days.find(d => d.id === activeDay)?.name}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            {t.weekA || "Week A"}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {timetableData.schedule[activeDay]?.map((slot, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Time Column */}
                                <div className="min-w-[140px] flex items-center text-gray-500 font-mono text-sm">
                                    <Clock size={16} className="mr-2 text-gray-400" />
                                    {slot.time}
                                </div>

                                {/* Subject Details */}
                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                {t.subjects?.[slot.subject] || slot.subject}
                                                {slot.subject === 'Break' && <span className="text-xs font-normal text-gray-500 ml-2">({t.recess || "Recess"})</span>}
                                            </h3>
                                            {slot.teacher && (
                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                    <User size={14} className="mr-1" />
                                                    {slot.teacher}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${slot.color}`}>
                                            {slot.room ? `${t.room || "Room"} ${slot.room}` : (t.subjects?.[slot.subject] || slot.subject)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!timetableData.schedule[activeDay] || timetableData.schedule[activeDay].length === 0) && (
                            <div className="p-12 text-center text-gray-500 italic">
                                {t.noClasses || "No classes scheduled for this day."}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Timetable;
