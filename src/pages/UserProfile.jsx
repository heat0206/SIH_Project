import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTeacherClasses } from '../services/classService';
import { getLastCorrectionRequest, submitCorrectionRequest } from '../services/correctionRequestService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Edit2, Save, X, QrCode, Fingerprint, Smartphone, RefreshCw, ShieldCheck, AlertCircle, GraduationCap, ArrowLeft, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const UserProfile = () => {
    const { language } = useLanguage();
    const t = translations[language].userProfile;
    const navigate = useNavigate();

    const { currentUser } = useAuth();
    const [dutyRosterData, setDutyRosterData] = useState({
        classTeacher: 'N/A',
        subjects: 'N/A',
        additional: 'N/A'
    });
    const [lastRequest, setLastRequest] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({
        fieldName: '',
        currentValue: '',
        requestedValue: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const isParent = currentUser?.role === 'parent';

    useEffect(() => {
        const fetchDutyRoster = async () => {
            if (currentUser?.uid && currentUser?.role === 'teacher') {
                try {
                    const classes = await getTeacherClasses(currentUser.uid);

                    // 1. Find Class Teacher assignment
                    const classTeacherClass = classes.find(c => c.teacherId === currentUser.uid);
                    const classTeacherText = classTeacherClass
                        ? classTeacherClass.name
                        : 'N/A';

                    // 2. Find Subject Teacher assignments
                    const subjectAssignments = [];
                    classes.forEach(c => {
                        if (c.subjectTeachers) {
                            const teacherEntry = c.subjectTeachers.find(t => t.id === currentUser.uid);
                            if (teacherEntry) {
                                subjectAssignments.push(`${teacherEntry.subject} (${c.name})`);
                            }
                        }
                    });
                    const subjectsText = subjectAssignments.length > 0 ? subjectAssignments.join(', ') : 'N/A';

                    setDutyRosterData({
                        classTeacher: classTeacherText,
                        subjects: subjectsText,
                        additional: currentUser.dutyRoster?.additional || 'N/A' // Keep existing additional info if any
                    });

                } catch (error) {
                    console.error("Error fetching duty roster:", error);
                }
            }
        };

        fetchDutyRoster();
    }, [currentUser]);

    // Fetch last correction request
    useEffect(() => {
        const fetchLastRequest = async () => {
            if (currentUser?.uid) {
                const request = await getLastCorrectionRequest(currentUser.uid);
                setLastRequest(request);
            }
        };
        fetchLastRequest();
    }, [currentUser]);

    // Default values in case data is missing
    const user = {
        name: currentUser?.name || 'N/A',
        role: currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'User',
        email: currentUser?.email || 'N/A',
        phone: currentUser?.phone || 'N/A',
        id: currentUser?.employeeId || currentUser?.uid || 'N/A',
        department: currentUser?.department || 'N/A',
        joiningDate: currentUser?.joiningDate || 'N/A',
        address: currentUser?.address || 'N/A',
        udise: currentUser?.udise || 'N/A',
        block: currentUser?.block || 'N/A',
        dutyRoster: dutyRosterData,
        studentName: currentUser?.studentName || 'N/A',
        studentId: currentUser?.studentId || 'N/A',
        studentRollNo: currentUser?.studentRollNo || 'N/A'
    };

    const handleRequestCorrection = () => {
        setShowRequestModal(true);
    };

    const handleSubmitRequest = async () => {
        if (!requestForm.fieldName || !requestForm.requestedValue) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await submitCorrectionRequest(
                currentUser.uid,
                currentUser.role,
                requestForm.fieldName,
                requestForm.currentValue,
                requestForm.requestedValue,
                requestForm.reason
            );

            // Refresh the last request
            const request = await getLastCorrectionRequest(currentUser.uid);
            setLastRequest(request);

            setShowRequestModal(false);
            setRequestForm({ fieldName: '', currentValue: '', requestedValue: '', reason: '' });
            alert('Data correction request submitted successfully!');
        } catch (error) {
            alert('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle2 size={12} />
                        {t.approved || 'Approved'}
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle size={12} />
                        {t.rejected || 'Rejected'}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                        <Clock size={12} />
                        {t.pendingApproval || 'Pending Admin Approval'}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                <button
                    onClick={() => isParent ? navigate('/parent-dashboard') : navigate(-1)}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t.backToDashboard}
                </button>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-900 to-blue-700 relative">
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="px-4 md:px-8 pb-8 relative">
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-8 gap-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-blue-800 text-4xl font-bold">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>

                            <div className="flex-grow pt-4 md:pt-0">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-blue-700 font-medium text-lg flex items-center gap-2">
                                    {user.role}
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </p>
                            </div>

                            <div className="flex gap-3 mt-4 md:mt-0">
                                <button
                                    onClick={handleRequestCorrection}
                                    className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 flex items-center gap-2 transition-colors"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {t.requestCorrection}
                                </button>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column - Personal Info & Duty Roster */}
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-700" />
                                        {t.personalInfo}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t.fullName}</label>
                                            <div className="text-gray-900 font-medium">{user.name}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t.role}</label>
                                            <div className="text-gray-900 font-medium">{user.role}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t.email}</label>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t.phone}</label>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {user.phone}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t.address}</label>
                                            <div className="flex items-start gap-2 text-gray-900">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                                {user.address}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {isParent ? (
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-700" />
                                            {t.studentDetails}
                                        </h2>
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-600 font-medium">{t.studentName}</span>
                                                    <span className="text-gray-900 font-bold">{user.studentName}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">{t.studentRollNo}</span>
                                                    <span className="text-gray-900 font-bold">{user.studentRollNo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                ) : (
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-blue-700" />
                                            {t.dutyRoster}
                                        </h2>
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-600 font-medium">{t.classTeacher}</span>
                                                    <span className="text-gray-900 font-bold">{user.dutyRoster.classTeacher}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                                    <span className="text-gray-600 font-medium">{t.subjects}</span>
                                                    <span className="text-gray-900 font-bold">{user.dutyRoster.subjects}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">{t.additional}</span>
                                                    <span className="text-gray-900 font-bold">{user.dutyRoster.additional}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}


                                {/* Last Request Widget */}
                                {lastRequest && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-lg">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-600">
                                                        {t.lastRequest || 'Last Request'}: <span className="font-bold text-gray-900">{lastRequest.fieldName}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="font-medium text-gray-700">{lastRequest.requestedValue}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {lastRequest.createdAt?.toLocaleDateString(language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="text-xs text-gray-500">{t.status || 'Status'}:</div>
                                                {getStatusBadge(lastRequest.status)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Employment, Security, Digital ID */}
                            <div className="space-y-6">
                                {/* Employment Details (Only for Teachers) */}
                                {!isParent && (
                                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-blue-700" />
                                            {t.employmentDetails}
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.employeeId}</div>
                                                <div className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                                                    {user.id}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.department}</div>
                                                <div className="text-gray-900 font-medium">{user.department}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.joiningDate}</div>
                                                <div className="flex items-center gap-2 text-gray-900">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {user.joiningDate}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.udise}</div>
                                                <div className="font-mono text-gray-900 font-medium">{user.udise}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.block}</div>
                                                <div className="text-gray-900 font-medium">{user.block}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Account Status / Security */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                        {t.security}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-2">
                                                <Fingerprint className="w-4 h-4 text-green-700" />
                                                <span className="text-sm font-medium text-green-800">{t.biometric}</span>
                                            </div>
                                            <span className="text-xs font-bold text-green-700 bg-white px-2 py-0.5 rounded border border-green-200">{t.faceId}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-4 h-4 text-green-700" />
                                                <span className="text-sm font-medium text-green-800">{t.twoFa}</span>
                                            </div>
                                            <span className="text-xs font-bold text-green-700 bg-white px-2 py-0.5 rounded border border-green-200">{t.mobileLinked}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4 text-blue-700" />
                                                <span className="text-sm font-medium text-blue-800">{t.lastSync}</span>
                                            </div>
                                            <span className="text-xs font-bold text-blue-700">Today, 08:30 AM</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Digital ID QR */}
                                <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <QrCode size={100} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{t.digitalId}</h3>
                                    <p className="text-blue-200 text-xs mb-6">{t.govtId}</p>

                                    <div className="flex justify-center mb-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <QrCode size={120} className="text-black" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-mono opacity-80">{user.id}</div>
                                        <div className="text-xs text-blue-300 mt-1">{t.scanVerify}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </main >

            <Footer />

            {/* Request Correction Modal */}
            {
                showRequestModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {t.requestCorrection || 'Request Data Correction'}
                                    </h3>
                                    <button
                                        onClick={() => setShowRequestModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.fieldToUpdate || 'Field to Update'} *
                                    </label>
                                    <select
                                        value={requestForm.fieldName}
                                        onChange={(e) => setRequestForm({ ...requestForm, fieldName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">{t.selectField || 'Select a field'}</option>
                                        <option value="Name">{t.fullName || 'Full Name'}</option>
                                        <option value="Phone">{t.phone || 'Phone Number'}</option>
                                        <option value="Address">{t.address || 'Address'}</option>
                                        <option value="Email">{t.email || 'Email'}</option>
                                        {!isParent && (
                                            <>
                                                <option value="Department">{t.department || 'Department'}</option>
                                                <option value="Employee ID">{t.employeeId || 'Employee ID'}</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.currentValue || 'Current Value'}
                                    </label>
                                    <input
                                        type="text"
                                        value={requestForm.currentValue}
                                        onChange={(e) => setRequestForm({ ...requestForm, currentValue: e.target.value })}
                                        placeholder={t.enterCurrentValue || 'Enter current value'}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.requestedValue || 'New/Correct Value'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={requestForm.requestedValue}
                                        onChange={(e) => setRequestForm({ ...requestForm, requestedValue: e.target.value })}
                                        placeholder={t.enterNewValue || 'Enter the correct value'}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.reason || 'Reason'} ({t.optional || 'optional'})
                                    </label>
                                    <textarea
                                        value={requestForm.reason}
                                        onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                        placeholder={t.enterReason || 'Why is this correction needed?'}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t.cancel || 'Cancel'}
                                </button>
                                <button
                                    onClick={handleSubmitRequest}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (t.submitting || 'Submitting...') : (t.submitRequest || 'Submit Request')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserProfile;
