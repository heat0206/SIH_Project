import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, BookOpen, Calendar, Settings, LogOut, Plus, Search, MoreVertical, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateMasterComplianceReport, downloadCSV } from '../utils/reportGenerator';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getAllTeachers, createTeacherProfile, deleteTeacherProfile, migrateExistingTeacherIds } from '../services/userService';
import { getRFIDLogsByDate, processRFIDLogsToAttendance, subscribeToRFIDLogs } from '../services/attendanceService';
import { getAllClasses, assignTeacherToClass, createClass, addSubjectTeacher, removeSubjectTeacher } from '../services/classService';
import { addStudent } from '../services/studentService';
import { translations } from '../utils/translations';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, onSnapshot, limit } from 'firebase/firestore';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language].adminDashboard;
    const { logout } = useAuth();

    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [rfidLogs, setRfidLogs] = useState([]);
    const [faceLogs, setFaceLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    // Assign Class State
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState('');

    // Multi-teacher state
    const [isSubjectTeacherMode, setIsSubjectTeacherMode] = useState(false);
    const [selectedSubjectTeacher, setSelectedSubjectTeacher] = useState('');
    const [subjectName, setSubjectName] = useState('');

    // Filter State
    const [filterSubject, setFilterSubject] = useState('');
    const [searchName, setSearchName] = useState('');

    // Add Teacher State
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subject: '', password: '' });

    // Add Student State
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        rfidId: '',
        rollNo: '',
        parentName: '',
        parentPhone: '',
        classId: ''
    });

    // Add Class State
    const [isAddingClass, setIsAddingClass] = useState(false);
    const [newClass, setNewClass] = useState({ name: '' });

    useEffect(() => {
        fetchData();

        // Subscribe to live RFID logs for selected date
        const unsubscribe = subscribeToRFIDLogs(selectedDate, async (logs) => {
            setRfidLogs(logs);
            // Auto-sync attendance when new logs arrive
            // Only auto-sync if viewing TODAY's logs
            const today = new Date().toISOString().split('T')[0];
            if (selectedDate === today && logs.length > 0) {
                try {
                    await processRFIDLogsToAttendance(selectedDate);
                    console.log("Auto-synced attendance from live logs");
                } catch (e) {
                    console.error("Auto-sync failed", e);
                }
            }
        });

        // Subscribe to Face Logs (Simple fetch for now, can be realtime later)
        const faceLogsRef = collection(db, "face_logs");
        const qFace = query(faceLogsRef, limit(20)); // Get last 20
        const unsubscribeFace = onSnapshot(qFace, (snapshot) => {
            const logs = [];
            snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
            // Sort by timestamp (descending)
            logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setFaceLogs(logs);
        });

        return () => {
            unsubscribe();
            unsubscribeFace();
        };
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teachersData, classesData] = await Promise.all([
                getAllTeachers(),
                getAllClasses()
            ]);
            setTeachers(teachersData);
            setClasses(classesData);
            // Logs are handled by subscription now
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleAssignTeacher = async () => {
        if (!selectedClass || !selectedTeacher) return;

        try {
            const teacher = teachers.find(t => t.id === selectedTeacher);
            await assignTeacherToClass(selectedClass.id, selectedTeacher, teacher?.name);

            // Refresh data
            await fetchData();
            // Don't close modal, just refresh to show update if we were in that mode, but actually for class teacher we usually close
            setIsAssigning(false);
            setSelectedClass(null);
            setSelectedTeacher('');
        } catch (error) {
            console.error("Failed to assign teacher:", error);
            alert("Failed to assign teacher. Please try again.");
        }
    };

    const handleAddSubjectTeacher = async () => {
        if (!selectedClass || !selectedSubjectTeacher) return;

        try {
            const teacher = teachers.find(t => t.id === selectedSubjectTeacher);
            // Use the teacher's subject from their profile, or fallback to 'General' if missing
            const subject = teacher?.subject || 'General';

            await addSubjectTeacher(selectedClass.id, selectedSubjectTeacher, teacher?.name, subject);

            // Refresh data locally to update the modal list immediately
            await fetchData();

            // Reset form but keep modal open
            setSelectedSubjectTeacher('');
            // setSubjectName(''); // No longer used

            // We need to update selectedClass to the new data so the list updates
            const updatedClasses = await getAllClasses();
            setClasses(updatedClasses);
            const updatedClass = updatedClasses.find(c => c.id === selectedClass.id);
            setSelectedClass(updatedClass);

        } catch (error) {
            console.error("Failed to add subject teacher:", error);
            alert("Failed to add subject teacher. Please try again.");
        }
    };

    const handleRemoveSubjectTeacher = async (teacherObject) => {
        if (!selectedClass) return;
        if (!window.confirm(`Remove ${teacherObject.name} from ${teacherObject.subject}?`)) return;

        try {
            await removeSubjectTeacher(selectedClass.id, teacherObject);

            // Refresh
            const updatedClasses = await getAllClasses();
            setClasses(updatedClasses);
            const updatedClass = updatedClasses.find(c => c.id === selectedClass.id);
            setSelectedClass(updatedClass);
        } catch (error) {
            console.error("Failed to remove subject teacher:", error);
            alert("Failed to remove subject teacher. Please try again.");
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await createTeacherProfile(newTeacher);
            await fetchData();
            setIsAddingTeacher(false);
            setNewTeacher({ name: '', email: '', subject: '', password: '' });
        } catch (error) {
            console.error("Failed to add teacher:", error);
            alert("Failed to add teacher. Please try again.");
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await createClass(newClass);
            await fetchData();
            setIsAddingClass(false);
            setNewClass({ name: '' });
        } catch (error) {
            console.error("Failed to create class:", error);
            alert("Failed to create class. Please try again.");
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            if (!newStudent.classId) {
                alert("Please select a class for the student.");
                return;
            }

            const selectedClassObj = classes.find(c => c.id === newStudent.classId);
            const studentData = {
                name: newStudent.name,
                rollNo: newStudent.rollNo,
                parentName: newStudent.parentName,
                parentPhone: newStudent.parentPhone,
                classId: newStudent.classId,
                className: selectedClassObj?.name || ''
            };

            await addStudent(studentData, newStudent.rfidId);

            alert("Student added successfully!");
            setIsAddingStudent(false);
            setNewStudent({
                name: '',
                rfidId: '',
                rollNo: '',
                parentName: '',
                parentPhone: '',
                classId: ''
            });
        } catch (error) {
            console.error("Failed to add student:", error);
            alert("Failed to add student. Please try again.");
        }
    };

    const handleRemoveTeacher = async (teacherId) => {
        if (window.confirm("Are you sure you want to remove this teacher? This action cannot be undone.")) {
            try {
                await deleteTeacherProfile(teacherId);
                await fetchData();
            } catch (error) {
                console.error("Failed to remove teacher:", error);
                alert("Failed to remove teacher. Please try again.");
            }
        }
    };

    const openAssignModal = (cls) => {
        setSelectedClass(cls);
        setSelectedTeacher(cls.teacherId || '');
        setIsSubjectTeacherMode(false); // Default to Class Teacher
        setIsAssigning(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="simple" />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                        <p className="text-gray-600 mt-1">{t.subtitle}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => {
                                const csv = generateMasterComplianceReport(teachers, classes);
                                downloadCSV(csv, `Master_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
                            }}
                            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 shadow-sm"
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



                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => setIsAddingTeacher(true)}
                        className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="font-semibold text-gray-700">Add New Teacher</span>
                    </button>

                    <button
                        onClick={() => setIsAddingClass(true)}
                        className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <span className="font-semibold text-gray-700">Add New Class</span>
                    </button>

                    <button
                        onClick={() => setIsAddingStudent(true)}
                        className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="font-semibold text-gray-700">Add New Student</span>
                    </button>
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
                                        <td className="px-6 py-4 font-medium text-gray-900">{cls.name || cls.id}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {cls.teacherName ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {cls.teacherName.charAt(0)}
                                                    </div>
                                                    {cls.teacherName}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 italic">{t.unassigned}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openAssignModal(cls)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Assign
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
                                                    {teacher.name ? teacher.name.charAt(0) : 'T'}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{teacher.name}</div>
                                                    <div className="text-xs text-gray-500">{teacher.email}</div>
                                                </div>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex gap-2">
                                                {classes.filter(c => c.teacherId === teacher.id).map(c => (
                                                    <span key={c.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                                                        {c.name || c.id}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveTeacher(teacher.id)}
                                                className="text-red-400 hover:text-red-600"
                                                title="Remove Teacher"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* RFID Logs Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">Today's RFID Scans</h2>
                            <button
                                onClick={async () => {
                                    if (confirm("Sync these scans to the official Class Attendance records?")) {
                                        try {
                                            const result = await processRFIDLogsToAttendance(selectedDate);
                                            alert(result.message);
                                        } catch (e) {
                                            alert("Sync failed: " + e.message);
                                        }
                                    }
                                }}
                                className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                                Sync to Attendance
                            </button>
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">RFID ID</th>
                                    <th className="px-6 py-4">Class ID</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rfidLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                            No RFID scans recorded today.
                                        </td>
                                    </tr>
                                ) : (
                                    rfidLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                {log.timestamp?.seconds
                                                    ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString()
                                                    : (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{log.studentName}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.rfidId}</td>
                                            <td className="px-6 py-4 text-gray-600">{log.classId}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {log.status === 'present' ? 'Present' : 'Absent'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Face Recognition Logs Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Face Recognition Logs</h2>
                        <span className="text-sm text-gray-500">Recent Captures</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {faceLogs.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-4">No face logs detected yet.</p>
                        ) : (
                            faceLogs.map((log) => (
                                <div key={log.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="aspect-video bg-gray-100 relative">
                                        {log.imageUrl ? (
                                            <img
                                                src={log.imageUrl}
                                                alt="Face Capture"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error' }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-gray-500">
                                            {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 mt-1">
                                            {log.device || "Unknown Device"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main >
            <Footer />

            {/* Assign Teacher Modal */}
            {
                isAssigning && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">Manage Teachers for {selectedClass?.name}</h3>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 mb-4">
                                <button
                                    className={`px-4 py-2 font-medium text-sm ${!isSubjectTeacherMode ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => { setIsSubjectTeacherMode(false); setFilterSubject(''); setSearchName(''); }}
                                >
                                    Class Teacher
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium text-sm ${isSubjectTeacherMode ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => { setIsSubjectTeacherMode(true); setFilterSubject(''); setSearchName(''); }}
                                >
                                    Subject Teachers
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="mb-4 space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search teacher by name..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <select
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">All Subjects</option>
                                    {[...new Set(teachers.map(t => t.subject).filter(Boolean))].map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Teacher Section */}
                            {!isSubjectTeacherMode && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">Select a Class Teacher responsible for daily attendance.</p>

                                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                        {teachers
                                            .filter(t =>
                                                (filterSubject ? t.subject === filterSubject : true) &&
                                                (searchName ? t.name.toLowerCase().includes(searchName.toLowerCase()) : true)
                                            )
                                            .map(t => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => setSelectedTeacher(t.id)}
                                                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedTeacher === t.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                                >
                                                    <div>
                                                        <div className="font-medium text-gray-900">{t.name}</div>
                                                        <div className="text-xs text-gray-500">{t.subject || 'No Subject'} • {t.email}</div>
                                                    </div>
                                                    {selectedTeacher === t.id && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                                                </div>
                                            ))}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            onClick={() => setIsAssigning(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAssignTeacher}
                                            disabled={!selectedTeacher}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Save Class Teacher
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Subject Teachers Section */}
                            {isSubjectTeacherMode && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Current Subject Teachers</h4>
                                        {selectedClass?.subjectTeachers && selectedClass.subjectTeachers.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedClass.subjectTeachers.map((st, index) => (
                                                    <li key={index} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm">
                                                        <span>
                                                            <span className="font-medium">{st.name}</span>
                                                            <span className="text-gray-500 mx-1">•</span>
                                                            <span className="text-blue-600">{st.subject}</span>
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveSubjectTeacher(st)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No subject teachers assigned yet.</p>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Select Subject Teacher to Add</h4>

                                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-3">
                                            {teachers
                                                .filter(t =>
                                                    (filterSubject ? t.subject === filterSubject : true) &&
                                                    (searchName ? t.name.toLowerCase().includes(searchName.toLowerCase()) : true)
                                                )
                                                .map(t => (
                                                    <div
                                                        key={t.id}
                                                        onClick={() => setSelectedSubjectTeacher(t.id)}
                                                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedSubjectTeacher === t.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-900">{t.name}</div>
                                                            <div className="text-xs text-gray-500">{t.subject || 'No Subject'}</div>
                                                        </div>
                                                        {selectedSubjectTeacher === t.id && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                                    </div>
                                                ))}
                                        </div>

                                        <button
                                            onClick={handleAddSubjectTeacher}
                                            disabled={!selectedSubjectTeacher}
                                            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add Subject Teacher
                                        </button>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => setIsAssigning(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Add Teacher Modal */}
            {
                isAddingTeacher && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
                            <form onSubmit={handleAddTeacher} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeacher.name}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="e.g. Sunil Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newTeacher.email}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="e.g. sunil@school.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newTeacher.password || ''}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Set a password (min 6 chars)"
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={newTeacher.subject}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingTeacher(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Add Teacher
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Add Class Modal */}
            {
                isAddingClass && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">Add New Class</h3>
                            <form onSubmit={handleCreateClass} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newClass.name}
                                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="e.g. Class 10-A"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingClass(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Create Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Add Student Modal */}
            {
                isAddingStudent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Student</h3>
                                <button onClick={() => setIsAddingStudent(false)} className="text-gray-400 hover:text-gray-600">
                                    <LogOut size={20} className="rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleAddStudent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RFID / Student ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Scan RFID or enter ID"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        value={newStudent.rfidId}
                                        onChange={(e) => setNewStudent({ ...newStudent, rfidId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newStudent.rollNo}
                                        onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class</label>
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newStudent.classId}
                                        onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                                    >
                                        <option value="">-- Select Class --</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newStudent.parentName}
                                        onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newStudent.parentPhone}
                                        onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium mt-2"
                                >
                                    Add Student
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
