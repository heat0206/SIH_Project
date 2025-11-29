import React from 'react';
import { Link } from 'react-router-dom';

const ClassCard = ({ className, studentCount, present, absent, isMarked, id, role, subject }) => {
    return (
        <div className={`bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isMarked ? 'border-[#1e3a8a]' : 'border-gray-300'}`}>
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800">{className}</h3>
                            {role === 'Class Teacher' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    Class Teacher
                                </span>
                            )}
                            {role === 'Subject Teacher' && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                    {subject}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Total Strength: {studentCount}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-6 w-full justify-around">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500 mb-1">
                                <span className="text-lg font-bold text-green-700">{present}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Present</span>
                        </div>

                        <div className="h-10 w-px bg-gray-300"></div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-500 mb-1">
                                <span className="text-lg font-bold text-red-600">{absent}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Absent</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <Link
                        to={`/attendance/view?classId=${id}`}
                        className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors ${isMarked
                            ? 'bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-blue-50'
                            : 'bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-md'
                            }`}
                    >
                        {isMarked ? 'View / Edit Record' : 'Mark Attendance Now'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClassCard;
