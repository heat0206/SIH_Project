import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const ClassCard = ({ className, studentCount, present, absent, isMarked, id, role, subject, previousWeekAvg, date }) => {
    const { language } = useLanguage();
    const t = translations[language]?.classCard || {};

    // Calculate current attendance percentage
    const currentPercentage = studentCount > 0 ? Math.round((present / studentCount) * 100) : 0;

    // Calculate trend compared to previous week
    const getTrend = () => {
        if (previousWeekAvg === undefined || previousWeekAvg === null) {
            return { type: 'neutral', diff: 0 };
        }
        const diff = currentPercentage - previousWeekAvg;
        if (diff > 2) return { type: 'up', diff: Math.abs(diff) };
        if (diff < -2) return { type: 'down', diff: Math.abs(diff) };
        return { type: 'neutral', diff: 0 };
    };

    const trend = getTrend();

    const TrendIcon = () => {
        if (trend.type === 'up') {
            return (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full" title={`+${trend.diff}% ${t.vsLastWeek || 'vs last week'}`}>
                    <TrendingUp size={14} className="stroke-[2.5]" />
                    <span className="text-xs font-bold">+{trend.diff}%</span>
                </div>
            );
        }
        if (trend.type === 'down') {
            return (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full" title={`-${trend.diff}% ${t.vsLastWeek || 'vs last week'}`}>
                    <TrendingDown size={14} className="stroke-[2.5]" />
                    <span className="text-xs font-bold">-{trend.diff}%</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full" title={t.noChange || "No change vs last week"}>
                <Minus size={14} className="stroke-[2.5]" />
                <span className="text-xs font-bold">0%</span>
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isMarked ? 'border-[#1e3a8a]' : 'border-gray-300'}`}>
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800">{className}</h3>
                            {role === 'Class Teacher' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    {t.classTeacher || 'Class Teacher'}
                                </span>
                            )}
                            {role === 'Subject Teacher' && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                    {subject}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{t.totalStrength || 'Total Strength'}: {studentCount}</p>
                    </div>

                    {/* Attendance Percentage with Trend */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-2xl font-extrabold text-gray-800">
                            {currentPercentage}%
                        </div>
                        <TrendIcon />
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-6 w-full justify-around">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500 mb-1">
                                <span className="text-lg font-bold text-green-700">{present}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.present || 'Present'}</span>
                        </div>

                        <div className="h-10 w-px bg-gray-300"></div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-500 mb-1">
                                <span className="text-lg font-bold text-red-600">{absent}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.absent || 'Absent'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <Link
                        to={`/attendance/view?classId=${id}&date=${date}`}
                        className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors ${role === 'Class Teacher' && isMarked
                            ? 'bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-blue-50'
                            : 'bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-md'
                            }`}
                    >
                        {role === 'Class Teacher'
                            ? (isMarked ? (t.viewEdit || 'View / Edit Record') : (t.markNow || 'Mark Attendance Now'))
                            : (t.viewAttendance || 'View Attendance')
                        }
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClassCard;
