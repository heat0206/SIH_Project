import React, { useState } from 'react';
import { X, BookOpen, Activity, Users, School, Download, Calendar } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { downloadCSV, generateDistrictAuditReport } from '../utils/reportGenerator';

const DetailedReportModal = ({ isOpen, onClose, district, stats }) => {
    const [activeTab, setActiveTab] = useState('aser');

    if (!isOpen || !stats) return null;

    // Use blocks from stats, or fallback to empty array
    const blocks = stats.blocks || [];

    const handleDownload = () => {
        const csvData = generateDistrictAuditReport(district, stats);
        downloadCSV(csvData, `District_Audit_Report_${district}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-indigo-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="text-indigo-400" />
                            Detailed District Report: {district}
                        </h2>
                        <p className="text-indigo-200 text-sm mt-1">
                            Comprehensive Analysis of Education Quality & Resources
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('aser')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'aser' ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BookOpen size={18} />
                        ASER Quality Metrics
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'attendance' ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users size={18} />
                        Attendance Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'resources' ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <School size={18} />
                        Resource Audit
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'aser' && (
                        <div className="space-y-8">
                            {/* Learning Levels Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BookOpen size={20} className="text-blue-600" />
                                        Foundational Literacy
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Grade 3 (Can read Std 2 Level)</span>
                                                <span className="font-bold text-gray-900">{stats.aserData?.learningLevels.reading.std3_can_read_std2_level}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${stats.aserData?.learningLevels.reading.std3_can_read_std2_level}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Grade 5 (Can read Std 2 Level)</span>
                                                <span className="font-bold text-gray-900">{stats.aserData?.learningLevels.reading.std5_can_read_std2_level}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500" style={{ width: `${stats.aserData?.learningLevels.reading.std5_can_read_std2_level}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Grade 8 (Can read Std 2 Level)</span>
                                                <span className="font-bold text-gray-900">{stats.aserData?.learningLevels.reading.std8_can_read_std2_level}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${stats.aserData?.learningLevels.reading.std8_can_read_std2_level}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-green-600" />
                                        Foundational Numeracy
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Grade 3 (Can do Subtraction)</span>
                                                <span className="font-bold text-gray-900">{stats.aserData?.learningLevels.arithmetic.std3_can_do_subtraction}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: `${stats.aserData?.learningLevels.arithmetic.std3_can_do_subtraction}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Grade 5 (Can do Division)</span>
                                                <span className="font-bold text-gray-900">{stats.aserData?.learningLevels.arithmetic.std5_can_do_division}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${stats.aserData?.learningLevels.arithmetic.std5_can_do_division}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Grade 8 (Can do Division)</span>
                                                <span className="font-bold text-gray-900">{stats.aserData?.learningLevels.arithmetic.std8_can_do_division}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500" style={{ width: `${stats.aserData?.learningLevels.arithmetic.std8_can_do_division}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Facilities Section */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <School size={20} className="text-purple-600" />
                                    School Facilities & Infrastructure
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-700 mb-1">{stats.aserData?.schoolFacilities.drinkingWater.available}%</div>
                                        <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Drinking Water</div>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-emerald-700 mb-1">{stats.aserData?.schoolFacilities.toilets.usable}%</div>
                                        <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Usable Toilets</div>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-orange-700 mb-1">
                                            {stats.aserData?.schoolFacilities.library.books_available || 'N/A'}%
                                        </div>
                                        <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">Library Books</div>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-700 mb-1">
                                            {stats.aserData?.schoolFacilities.computers.available}%
                                        </div>
                                        <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Computers</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100 bg-yellow-50">
                                <h3 className="font-bold text-yellow-800 mb-2">School-Level Data Unavailable</h3>
                                <p className="text-sm text-yellow-700">
                                    ASER 2024 does not publish block or school-specific attendance trends to safeguard privacy.
                                    Only state-level aggregates are available.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3">Block Name</th>
                                            <th className="px-6 py-3">Avg Attendance</th>
                                            <th className="px-6 py-3">Risk Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {blocks.map((block, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium text-gray-900">{block.name}</td>
                                                <td className="px-6 py-3">{block.attendance}%</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${block.risk === 'Critical' ? 'bg-red-100 text-red-700' :
                                                        block.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {block.risk}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'resources' && (
                        <div className="text-center py-12 text-gray-500">
                            <School size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>Resource Audit Data includes detailed breakdown of Mid-Day meal distribution efficiency and infrastructure utility.</p>
                            <button
                                onClick={handleDownload}
                                className="mt-4 text-indigo-600 font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                            >
                                <Download size={16} /> Download Full Audit Report
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        Close
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailedReportModal;
