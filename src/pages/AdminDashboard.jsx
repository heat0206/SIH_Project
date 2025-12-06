import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    GraduationCap,
    School,
    LayoutDashboard,
    LogOut,
    Plus,
    Search,
    Edit,
    Trash2,
    Video,
    Download,
    Filter,
    RefreshCw,
    BookOpen,
    Phone,
    UserCheck,
    Utensils,
    Wifi,
    FileText,
    CheckCircle,
    XCircle
} from 'lucide-react';
import {
    collection,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { translations } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';
import { generateMasterComplianceReport, downloadCSV } from '../utils/reportGenerator';
import { deleteStudent } from '../services/studentService';
import { createParentProfile } from '../services/userService';
import { subscribeToRFIDLogs } from '../services/attendanceService';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Admin Dashboard Component
const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { language } = useLanguage();
    const t = translations[language].adminDashboard;

    // State Management
    const activeTab = searchParams.get('tab') || 'dashboard';
    const setActiveTab = (tab) => setSearchParams({ tab });

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [faceLogs, setFaceLogs] = useState([]);
    const [totalPresent, setTotalPresent] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [leaveRequests, setLeaveRequests] = useState([]);

    // Modal States
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [isEditingTeacher, setIsEditingTeacher] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [isAddingClass, setIsAddingClass] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [isSubjectTeacherMode, setIsSubjectTeacherMode] = useState(false);
    const [filterSubject, setFilterSubject] = useState('');
    const [searchName, setSearchName] = useState('');
    const [selectedSubjectTeacher, setSelectedSubjectTeacher] = useState('');
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subject: '', password: '' });
    const [newClass, setNewClass] = useState({ name: '' });
    const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', classId: '', rfidId: '', parentName: '', parentPhone: '', parentUid: '', parentPassword: '' });

    // Edit States
    const [isEditingStudent, setIsEditingStudent] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    // Search & Filter States
    const [searchStudentQuery, setSearchStudentQuery] = useState('');
    const [studentClassFilter, setStudentClassFilter] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
    const [searchClassQuery, setSearchClassQuery] = useState('');


    // Data Fetching
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Students
            const studentsSnapshot = await getDocs(collection(db, 'students'));
            const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(studentsList);

            // Fetch Teachers
            const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
            const teachersSnapshot = await getDocs(teachersQuery);
            const teachersList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeachers(teachersList);

            // Fetch Classes
            const classesSnapshot = await getDocs(collection(db, 'classes'));
            const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClasses(classesList);

            // Fetch Logs (Mock or Real)
            // Removed manual fetch to use real-time subscription below

            // Fetch Leave Requests
            const leavesQuery = query(collection(db, 'leave_requests'), orderBy('createdAt', 'desc'));
            const leavesSnapshot = await getDocs(leavesQuery);
            const leavesList = leavesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeaveRequests(leavesList);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Real-time listener for RFID logs & Auto-Process Attendance
        const today = new Date().toISOString().split('T')[0];
        console.log("[Dashboard] Setting up RFID subscription for date:", today);

        const unsubscribeLogs = subscribeToRFIDLogs(today, (newLogs) => {
            console.log("[Dashboard] Received logs update:", newLogs.length);
            setLogs(newLogs);
        });

        const unsubscribeFace = onSnapshot(
            query(collection(db, 'face_recognition_logs'), orderBy('timestamp', 'desc'), limit(1)),
            (snapshot) => {
                const newLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (newLogs.length > 0) {
                    setFaceLogs(newLogs);
                }
            }
        );

        // Real-time listener for Total Attendance (Mid-Day Meal)
        const attendanceQuery = query(collection(db, 'attendance'), where('date', '==', today));
        const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
            let count = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.records) {
                    count += data.records.filter(r => r.present).length;
                }
            });
            setTotalPresent(count);
        });

        // Online/Offline Listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            unsubscribeLogs();
            unsubscribeFace();
            unsubscribeAttendance();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Filter Logic
    useEffect(() => {
        let filtered = students;

        // Filter by Search Query
        if (searchStudentQuery.trim()) {
            const query = searchStudentQuery.toLowerCase();
            filtered = filtered.filter(student =>
                (student.name || "").toLowerCase().includes(query) ||
                (student.rfidId && student.rfidId.toLowerCase().includes(query)) ||
                (student.rollNo && student.rollNo.toLowerCase().includes(query))
            );
        }

        // Filter by Class
        if (studentClassFilter) {
            filtered = filtered.filter(student => student.classId === studentClassFilter);
        }

        setFilteredStudents(filtered);
    }, [searchStudentQuery, studentClassFilter, students]);

    // Handlers
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        // Use state directly instead of FormData because inputs are controlled
        const studentData = {
            name: newStudent.name,
            rollNo: newStudent.rollNo,
            classId: newStudent.classId,
            className: classes.find(c => c.id === newStudent.classId)?.name || '',
            rfidId: newStudent.rfidId,
            parentName: newStudent.parentName,
            parentPhone: newStudent.parentPhone,
            parentEmail: newStudent.parentUid, // Save parent email for linking
            createdAt: serverTimestamp()
        };

        try {
            // 1. Create Student
            let studentId;
            if (studentData.rfidId) {
                // Use RFID ID as document ID
                const studentRef = doc(db, 'students', studentData.rfidId);
                await setDoc(studentRef, studentData);
                studentId = studentData.rfidId;
            } else {
                // Fallback to auto-ID if no RFID provided (though it should be required ideally)
                const studentRef = await addDoc(collection(db, 'students'), studentData);
                studentId = studentRef.id;
            }

            // 2. Create Parent Account if credentials provided
            if (newStudent.parentUid && newStudent.parentPassword) {
                await createParentProfile({
                    email: newStudent.parentUid,
                    password: newStudent.parentPassword,
                    studentId: studentId,
                    studentName: studentData.name
                });
            }

            setIsAddingStudent(false);
            setNewStudent({ name: '', rollNo: '', classId: '', rfidId: '', parentName: '', parentPhone: '', parentUid: '', parentPassword: '' });
            fetchData();
            alert("Student and Parent Account added successfully!");
        } catch (error) {
            console.error("Error adding student/parent:", error);
            alert("Failed to add student or parent account. Check console for details.");
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!editingStudent) return;

        // Use state directly as inputs might miss name attributes
        const updatedStudent = {
            name: editingStudent.name,
            rollNo: editingStudent.rollNo,
            classId: editingStudent.classId,
            className: classes.find(c => c.id === editingStudent.classId)?.name || '',
            rfidId: editingStudent.rfidId,
            parentName: editingStudent.parentName,
            parentPhone: editingStudent.parentPhone,
        };

        try {
            const studentRef = doc(db, 'students', editingStudent.id);
            await updateDoc(studentRef, updatedStudent);
            setIsEditingStudent(false);
            setEditingStudent(null);
            fetchData();
            alert("Student updated successfully!");
        } catch (error) {
            console.error("Error updating student:", error);
            alert("Failed to update student.");
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
            try {
                await deleteStudent(studentId);
                await fetchData();
            } catch (error) {
                console.error("Failed to delete student:", error);
                alert("Failed to delete student. Please try again.");
            }
        }
    };

    const handleCleanupInvalidStudents = async () => {
        if (!window.confirm("This will delete all students with missing or invalid names (likely caused by the previous bug). Are you sure?")) return;

        setLoading(true);
        try {
            const studentsSnapshot = await getDocs(collection(db, 'students'));
            const invalidStudents = studentsSnapshot.docs.filter(doc => {
                const data = doc.data();
                // Check for null, undefined, empty string, or string "null"
                return !data.name || data.name === 'null' || data.name.trim() === '';
            });

            if (invalidStudents.length === 0) {
                alert("No invalid students found.");
                setLoading(false);
                return;
            }

            // Delete in parallel
            await Promise.all(invalidStudents.map(d => deleteDoc(doc(db, 'students', d.id))));

            alert(`Successfully removed ${invalidStudents.length} invalid student records.`);
            fetchData();
        } catch (error) {
            console.error("Error cleaning up:", error);
            alert("Failed to cleanup students.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        const teacherData = {
            name: newTeacher.name,
            email: newTeacher.email,
            subject: newTeacher.subject,
            role: 'teacher',
            password: newTeacher.password, // Include password if needed for profile creation service? 
            // Note: In a real app, we'd create an Auth user here. For now, just storing in 'users' collection as per existing logic.
            // But wait, the existing logic (snapshot) just added to collection. 
            // The original code:
            // const newTeacher = { name: formData.get('name'), ... }
            // await addDoc(collection(db, 'users'), newTeacher);

            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, 'users'), teacherData);
            setNewTeacher({ name: '', email: '', subject: '', password: '' }); // Reset state
            setIsAddingTeacher(false);
            fetchData();
            alert("Teacher added successfully!");
        } catch (error) {
            console.error("Error adding teacher:", error);
            alert("Failed to add teacher.");
        }
    };

    const handleUpdateTeacher = async (e) => {
        e.preventDefault();
        if (!editingTeacher) return;

        // Use state directly as inputs might miss name attributes
        const updatedTeacher = {
            name: editingTeacher.name,
            email: editingTeacher.email,
            subject: editingTeacher.subject
        };

        try {
            const teacherRef = doc(db, 'users', editingTeacher.id);
            await updateDoc(teacherRef, updatedTeacher);
            setIsEditingTeacher(false);
            setEditingTeacher(null);
            fetchData();
            alert("Teacher updated successfully!");
        } catch (error) {
            console.error("Error updating teacher:", error);
            alert("Failed to update teacher.");
        }
    };

    const handleRemoveTeacher = async (teacherId) => {
        if (window.confirm("Are you sure you want to remove this teacher?")) {
            try {
                await deleteDoc(doc(db, 'users', teacherId));
                fetchData();
            } catch (error) {
                console.error("Error removing teacher:", error);
            }
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newClass = {
            id: formData.get('classId'), // Using ID as manual input for simplicity like '6B'
            name: formData.get('className'),
            teacherId: '',
            teacherName: '',
            createdAt: serverTimestamp()
        };

        try {
            // Check if ID exists
            if (classes.some(c => c.id === newClass.id)) {
                alert("Class ID already exists!");
                return;
            }
            // We use setDoc if we want custom ID, but addDoc generates one.
            // For this app, let's use custom ID if possible, but Firestore addDoc is safer.
            // We'll store 'id' as a field.
            await addDoc(collection(db, 'classes'), newClass);
            setIsAddingClass(false);
            fetchData();
            alert("Class added successfully!");
        } catch (error) {
            console.error("Error adding class:", error);
            alert("Failed to add class.");
        }
    };

    const handleAssignTeacher = async () => {
        if (!selectedClass || !selectedTeacher) return;

        try {
            const classRef = doc(db, 'classes', selectedClass.id);
            const teacher = teachers.find(t => t.id === selectedTeacher);

            if (!isSubjectTeacherMode) {
                // Assign Class Teacher
                await updateDoc(classRef, {
                    teacherId: teacher.id,
                    teacherName: teacher.name
                });
            } else {
                // Assign Subject Teacher
                const newSubjectTeacher = {
                    id: teacher.id,
                    name: teacher.name,
                    subject: teacher.subject || 'General'
                };
                const currentSubjectTeachers = selectedClass.subjectTeachers || [];
                // Check if subject already exists
                if (currentSubjectTeachers.some(st => st.subject === newSubjectTeacher.subject)) {
                    if (!window.confirm(`A teacher for ${newSubjectTeacher.subject} is already assigned. Overwrite?`)) {
                        return;
                    }
                    // Remove old one
                    const filtered = currentSubjectTeachers.filter(st => st.subject !== newSubjectTeacher.subject);
                    await updateDoc(classRef, {
                        subjectTeachers: [...filtered, newSubjectTeacher]
                    });
                } else {
                    await updateDoc(classRef, {
                        subjectTeachers: [...currentSubjectTeachers, newSubjectTeacher]
                    });
                }
            }

            setIsAssigning(false);
            fetchData();
            alert("Teacher assigned successfully!");
        } catch (error) {
            console.error("Error assigning teacher:", error);
            alert("Failed to assign teacher.");
        }
    };

    const handleRemoveSubjectTeacher = async (teacherToRemove) => {
        if (!window.confirm(`Remove ${teacherToRemove.name} as ${teacherToRemove.subject} teacher?`)) return;
        try {
            const classRef = doc(db, 'classes', selectedClass.id);
            const updatedSubjectTeachers = selectedClass.subjectTeachers.filter(st => st.id !== teacherToRemove.id || st.subject !== teacherToRemove.subject);
            await updateDoc(classRef, {
                subjectTeachers: updatedSubjectTeachers
            });
            // Update local state to reflect change immediately in modal
            setSelectedClass(prev => ({ ...prev, subjectTeachers: updatedSubjectTeachers }));
            fetchData();
        } catch (error) {
            console.error("Error removing subject teacher:", error);
        }
    };

    const handleAddSubjectTeacher = async () => {
        if (!selectedClass || !selectedSubjectTeacher) return;

        try {
            const teacher = teachers.find(t => t.id === selectedSubjectTeacher);
            if (!teacher) return;

            const newSubjectTeacher = {
                id: teacher.id,
                name: teacher.name,
                subject: teacher.subject || 'General'
            };

            const classRef = doc(db, 'classes', selectedClass.id);
            const currentSubjectTeachers = selectedClass.subjectTeachers || [];

            // Check if subject already exists
            if (currentSubjectTeachers.some(st => st.subject === newSubjectTeacher.subject)) {
                if (!window.confirm(`A teacher for ${newSubjectTeacher.subject} is already assigned. Overwrite?`)) {
                    return;
                }
                // Remove old one and add new
                const filtered = currentSubjectTeachers.filter(st => st.subject !== newSubjectTeacher.subject);
                const updated = [...filtered, newSubjectTeacher];

                await updateDoc(classRef, { subjectTeachers: updated });
                setSelectedClass(prev => ({ ...prev, subjectTeachers: updated }));
            } else {
                const updated = [...currentSubjectTeachers, newSubjectTeacher];
                await updateDoc(classRef, { subjectTeachers: updated });
                setSelectedClass(prev => ({ ...prev, subjectTeachers: updated }));
            }

            setSelectedSubjectTeacher('');
            fetchData();
            alert("Subject teacher assigned successfully!");
        } catch (error) {
            console.error("Error assigning subject teacher:", error);
            alert("Failed to assign subject teacher.");
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!newClass.name) return;

        try {
            // Generate a simple ID from name if not provided (e.g. "Class 6A" -> "6A")
            // For now, let's just use the name as ID if it's short, or generate one.
            // Actually, let's just use addDoc to let Firestore generate ID, 
            // OR use the name as ID if we want readable IDs.
            // Let's stick to addDoc for safety, but store name.

            await addDoc(collection(db, 'classes'), {
                name: newClass.name,
                createdAt: serverTimestamp(),
                teacherId: '',
                teacherName: '',
                subjectTeachers: []
            });

            setIsAddingClass(false);
            setNewClass({ name: '' });
            fetchData();
            alert("Class created successfully!");
        } catch (error) {
            console.error("Error creating class:", error);
            alert("Failed to create class.");
        }
    };

    const handleApproveLeave = async (leaveId) => {
        try {
            const leaveRef = doc(db, 'leave_requests', leaveId);
            await updateDoc(leaveRef, { status: 'Approved' });
            fetchData();
            alert("Leave approved successfully.");
        } catch (error) {
            console.error("Error approving leave:", error);
            alert("Failed to approve leave.");
        }
    };

    const handleRejectLeave = async (leaveId) => {
        if (!window.confirm("Are you sure you want to reject this leave?")) return;
        try {
            const leaveRef = doc(db, 'leave_requests', leaveId);
            await updateDoc(leaveRef, { status: 'Rejected' });
            fetchData();
            alert("Leave rejected.");
        } catch (error) {
            console.error("Error rejecting leave:", error);
            alert("Failed to reject leave.");
        }
    };

    // Filtered Lists
    const filteredTeachers = teachers.filter(t =>
        (t.name || "").toLowerCase().includes(searchTeacherQuery.toLowerCase()) ||
        (t.email && (t.email || "").toLowerCase().includes(searchTeacherQuery.toLowerCase()))
    );

    const filteredClasses = classes.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchClassQuery.toLowerCase())) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(searchClassQuery.toLowerCase()))
    );

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
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <Header variant="dashboard" />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
                    <nav className="flex-1 p-4 space-y-2 mt-4">
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <LayoutDashboard size={20} /> {t.dashboard}
                        </button>
                        <button onClick={() => setActiveTab('students')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Users size={20} /> {t.students}
                        </button>
                        <button onClick={() => setActiveTab('teachers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'teachers' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <GraduationCap size={20} /> {t.teachers}
                        </button>
                        <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classes' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <School size={20} /> {t.classes}
                        </button>
                        <button onClick={() => setActiveTab('leaves')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'leaves' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <FileText size={20} /> Leaves
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10">
                        <h1 className="text-2xl font-bold text-gray-900 capitalize">{t[activeTab]}</h1>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
                            <button
                                onClick={() => {
                                    const csv = generateMasterComplianceReport(teachers, classes);
                                    downloadCSV(csv, `Master_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
                                }}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-2 text-sm"
                            >
                                <Download size={16} />
                                Report
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'dashboard' && (
                            <>
                                {/* KPI Cards Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {/* Card 1: Total Students */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">{t.totalStudents}</p>
                                            <h3 className="text-2xl font-bold text-gray-900">{students.length}</h3>
                                        </div>
                                    </div>

                                    {/* Card 2: Staff Present */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <UserCheck size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">{t.teachersPresent}</p>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {teachers.length > 0 ? `${Math.floor(teachers.length * 0.8)}/${teachers.length}` : "0/0"}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Card 3: Mid-Day Meal Eligible */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex items-center gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                            <Utensils size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">{t.midDayMealEligible}</p>
                                            <h3 className="text-2xl font-bold text-orange-600">
                                                {totalPresent}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Card 4: Connectivity Status */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            <Wifi size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">{t.connectivityStatus}</p>
                                            <h3 className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                                {isOnline ? t.online : t.offline}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Feed Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Left: Recent Scans */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[400px] flex flex-col">
                                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <Users size={18} /> Recent Scans
                                            </h2>
                                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">Live</span>
                                        </div>
                                        <div className="overflow-y-auto flex-grow p-0">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3">Time</th>
                                                        <th className="px-4 py-3">Name</th>
                                                        <th className="px-4 py-3 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {logs.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-400 text-sm">
                                                                No scans yet today.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        logs.slice(0, 20).map((log) => (
                                                            <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                                                                    {log.timestamp?.seconds
                                                                        ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                        : 'Just now'}
                                                                </td>
                                                                <td className="px-4 py-3 font-medium text-gray-800 text-sm">{log.studentName}</td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

                                    {/* Right: Live Camera Feed */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[400px] flex flex-col">
                                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <Video size={18} /> Live Camera Feed
                                            </h2>
                                            <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded animate-pulse">REC</span>
                                        </div>
                                        <div className="flex-grow bg-gray-900 flex flex-col items-center justify-center text-gray-500 relative">
                                            {/* Placeholder for Stream */}
                                            <div className="text-center p-6">
                                                <div className="w-16 h-16 border-4 border-gray-700 border-t-gray-500 rounded-full animate-spin mb-4 mx-auto"></div>
                                                <p className="text-gray-400 font-mono text-sm">Awaiting ESP32 Stream...</p>
                                                <p className="text-gray-600 text-xs mt-2">Device ID: ESP32-CAM-01</p>
                                            </div>

                                            {/* Overlay latest face log if available */}
                                            {faceLogs.length > 0 && (
                                                <div className="absolute bottom-4 right-4 w-32 h-24 bg-black border border-gray-700 rounded overflow-hidden shadow-lg">
                                                    <img
                                                        src={faceLogs[0].imageUrl}
                                                        alt="Latest Face"
                                                        className="w-full h-full object-cover opacity-80"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 truncate">
                                                        Last: {faceLogs[0].timestamp?.seconds ? new Date(faceLogs[0].timestamp.seconds * 1000).toLocaleTimeString() : 'Now'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'classes' && (
                            <>
                                <div className="flex justify-end mb-6">
                                    <button onClick={() => setIsAddingClass(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <Plus size={18} /> Add New Class
                                    </button>
                                </div>
                                {/* Class Assignments */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <h2 className="text-xl font-bold text-gray-900">{t.classAssignments}</h2>
                                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                            {/* Search */}
                                            <div className="relative w-full md:w-64">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search class..."
                                                    value={searchClassQuery}
                                                    onChange={(e) => setSearchClassQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            {/* Sync Button */}
                                            <button
                                                onClick={fetchData}
                                                className="flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                                            >
                                                <RefreshCw size={18} />
                                                Sync Data
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                                <tr>
                                                    <th className="px-6 py-4">Class Info</th>
                                                    <th className="px-6 py-4">{t.assignedTeacher}</th>
                                                    <th className="px-6 py-4 text-right">{t.action}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredClasses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                                                            No classes found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredClasses.map((cls) => (
                                                        <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                                        <BookOpen size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-900">{cls.name || cls.id}</div>
                                                                        <div className="text-xs text-gray-500">ID: {cls.id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">
                                                                {cls.teacherName ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                                            {cls.teacherName.charAt(0)}
                                                                        </div>
                                                                        <span className="font-medium text-gray-900">{cls.teacherName}</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                                        {t.unassigned}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() => openAssignModal(cls)}
                                                                    className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
                                                                >
                                                                    Assign
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'teachers' && (
                            <>
                                <div className="flex justify-end mb-6">
                                    <button onClick={() => setIsAddingTeacher(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <Plus size={18} /> Add New Teacher
                                    </button>
                                </div>
                                {/* Teachers List */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <h2 className="text-xl font-bold text-gray-900">{t.registeredTeachers}</h2>
                                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                            {/* Search */}
                                            <div className="relative w-full md:w-64">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search teacher..."
                                                    value={searchTeacherQuery}
                                                    onChange={(e) => setSearchTeacherQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            {/* Sync Button */}
                                            <button
                                                onClick={fetchData}
                                                className="flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                                            >
                                                <RefreshCw size={18} />
                                                Sync Data
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                                <tr>
                                                    <th className="px-6 py-4">Teacher Info</th>
                                                    <th className="px-6 py-4">Subject</th>
                                                    <th className="px-6 py-4">Classes Assigned</th>
                                                    <th className="px-6 py-4 text-right">{t.action}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredTeachers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">
                                                            No teachers found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredTeachers.map((teacher) => (
                                                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                                                                        {teacher.name ? teacher.name.charAt(0) : 'T'}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-900">{teacher.name}</div>
                                                                        <div className="text-xs text-gray-500">{teacher.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                                                    {teacher.subject || 'General'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {classes.filter(c => c.teacherId === teacher.id).length > 0 ? (
                                                                        classes.filter(c => c.teacherId === teacher.id).map(c => (
                                                                            <span key={c.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                                                                                {c.name || c.id}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-gray-400 italic text-xs">No classes assigned</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingTeacher(teacher);
                                                                            setIsEditingTeacher(true);
                                                                        }}
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit Teacher"
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRemoveTeacher(teacher.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Remove Teacher"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'students' && (
                            <>
                                <div className="flex justify-end mb-6">
                                    <button onClick={() => setIsAddingStudent(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <Plus size={18} /> Add New Student
                                    </button>
                                </div>
                                {/* Manage Students Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <h2 className="text-xl font-bold text-gray-900">Manage Students</h2>

                                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                            {/* Search */}
                                            <div className="relative w-full md:w-64">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search student..."
                                                    value={searchStudentQuery}
                                                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            {/* Class Filter */}
                                            <div className="relative w-full md:w-48">
                                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    value={studentClassFilter}
                                                    onChange={(e) => setStudentClassFilter(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                                >
                                                    <option value="">All Classes</option>
                                                    {classes.map(cls => (
                                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sync Button */}
                                            <button
                                                onClick={fetchData}
                                                className="flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                                            >
                                                <RefreshCw size={18} />
                                                Sync Data
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-6 py-4">Profile</th>
                                                    <th className="px-6 py-4">Student Info</th>
                                                    <th className="px-6 py-4">Class</th>
                                                    <th className="px-6 py-4">Attendance Rate</th>
                                                    <th className="px-6 py-4">Parent Contact</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredStudents.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                                                            No students found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredStudents.map((student) => {
                                                        // Mock attendance rate for demo
                                                        const attendanceRate = Math.floor(Math.random() * 30) + 70;

                                                        return (
                                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                                                        {student.name ? student.name.charAt(0) : '?'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="font-bold text-gray-900">{student.name}</div>
                                                                    <div className="text-xs text-gray-500 font-mono">Roll: {student.rollNo}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                                        {student.className || 'Unassigned'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                            <div
                                                                                className="bg-green-500 h-2 rounded-full"
                                                                                style={{ width: `${attendanceRate}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-xs text-gray-600 font-medium">{attendanceRate}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <Phone size={14} className="text-gray-400" />
                                                                        <span className="text-sm">{student.parentPhone}</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 ml-6">{student.parentName}</div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingStudent(student);
                                                                                setIsEditingStudent(true);
                                                                            }}
                                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                            title="Edit Student"
                                                                        >
                                                                            <Edit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteStudent(student.id)}
                                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Delete Student"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'leaves' && (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Leave Requests</h2>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                                <tr>
                                                    <th className="px-6 py-4">Student</th>
                                                    <th className="px-6 py-4">Type & Reason</th>
                                                    <th className="px-6 py-4">Dates</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {leaveRequests.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                                            No leave notices found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    leaveRequests.map((leave) => (
                                                        <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-900">{leave.studentName}</div>
                                                                <div className="text-xs text-gray-500">{leave.classId}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-medium text-gray-900">{leave.type}</div>
                                                                <div className="text-xs text-gray-500 max-w-xs">{leave.reason}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                <div>{leave.from} to {leave.to}</div>
                                                                <div className="text-xs text-gray-500">({leave.days} days)</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {leave.status === 'Approved' && <CheckCircle size={12} />}
                                                                    {leave.status === 'Rejected' && <XCircle size={12} />}
                                                                    {leave.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {leave.status === 'Pending' && (
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleApproveLeave(leave.id)}
                                                                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors flex items-center gap-1 text-xs font-medium"
                                                                        >
                                                                            <CheckCircle size={14} /> Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectLeave(leave.id)}
                                                                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center gap-1 text-xs font-medium"
                                                                        >
                                                                            <XCircle size={14} /> Reject
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        <Footer />
                    </main >
                </div>
            </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent User ID (Email)</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="For Parent Login"
                                        value={newStudent.parentUid}
                                        onChange={(e) => setNewStudent({ ...newStudent, parentUid: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Password</label>
                                    <input
                                        type="password"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Min 6 chars"
                                        value={newStudent.parentPassword}
                                        onChange={(e) => setNewStudent({ ...newStudent, parentPassword: e.target.value })}
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
            {/* Edit Student Modal */}
            {
                isEditingStudent && editingStudent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit Student Details</h3>
                                <button onClick={() => setIsEditingStudent(false)} className="text-gray-400 hover:text-gray-600">
                                    <LogOut size={20} className="rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateStudent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingStudent.name}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RFID / Student ID (Read Only)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
                                        value={editingStudent.rfidId}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingStudent.rollNo}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class</label>
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingStudent.classId}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, classId: e.target.value })}
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
                                        value={editingStudent.parentName}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingStudent.parentPhone}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium mt-2"
                                >
                                    Update Student
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Teacher Modal */}
            {
                isEditingTeacher && editingTeacher && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit Teacher Details</h3>
                                <button onClick={() => setIsEditingTeacher(false)} className="text-gray-400 hover:text-gray-600">
                                    <LogOut size={20} className="rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateTeacher} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTeacher.name}
                                        onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTeacher.email}
                                        onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTeacher.subject || ''}
                                        onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium mt-2"
                                >
                                    Update Teacher
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
