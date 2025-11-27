import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockDB } from '../utils/MockDataManager';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Check auth
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        // Load data
        refreshData();
    }, [navigate]);

    const refreshData = () => {
        setTeachers(mockDB.getTeachers());
        setClasses(mockDB.getClasses());
    };

    const handleAssignClass = (classId, teacherId) => {
        mockDB.assignClassToTeacher(classId, teacherId);
        refreshData();
        alert('Class assigned successfully!');
    };

    const getTeacherName = (teacherId) => {
        const t = teachers.find(t => t.id === teacherId);
        return t ? t.name : 'Unassigned';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header variant="dashboard" />

            <main className="flex-grow max-w-7xl mx-auto w-full p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage teachers, classes, and timetables.</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('currentUser');
                            navigate('/admin/login');
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Logout
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-sm font-medium uppercase">Total Teachers</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">{teachers.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-sm font-medium uppercase">Total Classes</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">{classes.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-sm font-medium uppercase">System Status</div>
                        <div className="text-3xl font-bold text-gray-800 mt-2">Active</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Class Management Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Class Assignments</h2>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-medium border-b">Class Name</th>
                                        <th className="p-4 font-medium border-b">Assigned Teacher</th>
                                        <th className="p-4 font-medium border-b">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {classes.map(cls => (
                                        <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">{cls.name}</td>
                                            <td className="p-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {getTeacherName(cls.teacherId).charAt(0)}
                                                    </div>
                                                    {getTeacherName(cls.teacherId)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    value={cls.teacherId}
                                                    onChange={(e) => handleAssignClass(cls.id, e.target.value)}
                                                >
                                                    {teachers.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Teacher List Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Registered Teachers</h2>
                            <button className="text-sm text-blue-600 font-medium hover:underline">+ Add New</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {teachers.map(teacher => (
                                <div key={teacher.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{teacher.name}</div>
                                            <div className="text-sm text-gray-500">{teacher.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {teacher.subjects.map(sub => (
                                            <span key={sub} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
