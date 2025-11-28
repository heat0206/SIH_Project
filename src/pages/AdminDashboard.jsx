import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, BookOpen, Calendar, Settings, LogOut, Plus, Search, MoreVertical, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateMasterComplianceReport, downloadCSV } from '../utils/reportGenerator';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].adminDashboard;

    const [teachers, setTeachers] = useState([
        { id: 1, name: 'Sunil Sharma', subject: 'Mathematics', classes: ['VI-A', 'VII-B'], status: 'Active' },
        { id: 2, name: 'Anjali Gupta', subject: 'Science', classes: ['VIII-A'], status: 'Active' },
        { id: 3, name: 'Rajesh Kumar', subject: 'English', classes: ['IX-B', 'X-A'], status: 'Active' },
    ]);

    const [classes, setClasses] = useState([
        { id: 'VI-A', teacher: 'Sunil Sharma', students: 45 },
        { id: 'VII-B', teacher: 'Sunil Sharma', students: 42 },
        { id: 'VIII-A', teacher: 'Anjali Gupta', students: 40 },
        { id: 'IX-B', teacher: 'Rajesh Kumar', students: 38 },
        { id: 'X-A', teacher: 'Rajesh Kumar', students: 35 },
    ]);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        navigate('/admin-login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="simple" />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                        <p className="text-gray-600 mt-1">{t.subtitle}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const csv = generateMasterComplianceReport(teachers, classes);
                                downloadCSV(csv, `Master_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm"
                        >
                            <Download size={18} />
                            {t.masterReport}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            {t.logout}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t.totalTeachers}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{teachers.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t.totalClasses}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{classes.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Settings size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t.systemStatus}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{t.active}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class Assignments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">{t.classAssignments}</h2>
                        <button className="text-blue-600 font-medium hover:text-blue-700 text-sm flex items-center gap-1">
                            {t.addNew}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">{t.className}</th>
                                    <th className="px-6 py-4">{t.assignedTeacher}</th>
                                    <th className="px-6 py-4 text-right">{t.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {classes.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{cls.id}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {cls.teacher ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {cls.teacher.charAt(0)}
                                                    </div>
                                                    {cls.teacher}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 italic">{t.unassigned}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Teachers List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">{t.registeredTeachers}</h2>
                        <button className="text-blue-600 font-medium hover:text-blue-700 text-sm flex items-center gap-1">
                            {t.addNew}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">{t.assignedTeacher}</th>
                                    <th className="px-6 py-4">{t.className}</th>
                                    <th className="px-6 py-4 text-right">{t.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <span className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{teacher.name}</div>
                                                    <div className="text-xs text-gray-500">{teacher.subject}</div>
                                                </div>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex gap-2">
                                                {teacher.classes.map(c => (
                                                    <span key={c} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
