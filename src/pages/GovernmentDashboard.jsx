import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Users,
    MapPin,
    BrainCircuit,
    AlertCircle,
    BookOpen,
    GraduationCap
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    getDistricts,
    getDistrictStats,
    getTeacherStats
} from '../services/governmentService';
import SchoolAuditPanel from '../components/SchoolAuditPanel';
import DetailedReportModal from '../components/DetailedReportModal';
import SchoolManagementModal from '../components/SchoolManagementModal';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const GovernmentDashboard = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.governmentDashboard || {};
    const [selectedDistrict, setSelectedDistrict] = useState('Amritsar');
    const [stats, setStats] = useState(null);
    const [teacherStats, setTeacherStats] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        const isAuth = sessionStorage.getItem('isGovtAuthenticated');
        if (isAuth !== 'true') {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        setDistricts(['Amritsar']);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const districtStats = await getDistrictStats(selectedDistrict);
            const teachers = await getTeacherStats(selectedDistrict);
            setStats(districtStats);
            setTeacherStats(teachers);
        };
        fetchData();
    }, [selectedDistrict]);

    const handleDataUpdate = () => {
        // Refresh logic would go here
        window.location.reload();
    };

    if (!stats) return <div className="p-8 text-center">{t.loading}</div>;

    const chartData = {
        labels: ['G3 Reading', 'G5 Math', 'G8 Reading', 'G8 Math'],
        datasets: [
            {
                label: '% Students',
                data: [
                    stats.aserData?.learningLevels?.reading?.std3_can_read_std2_level || 0,
                    stats.aserData?.learningLevels?.arithmetic?.std5_can_do_division || 0,
                    stats.aserData?.learningLevels?.reading?.std8_can_read_std2_level || 0,
                    stats.aserData?.learningLevels?.arithmetic?.std8_can_do_division || 0
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => `${context.raw}% Students`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#f3f4f6' },
                ticks: {
                    font: { size: 11 },
                    callback: (value) => `${value}%`
                }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Header variant="simple" title={t.headerTitle} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <LayoutDashboard className="text-blue-600" />
                            {t.dashboardTitle}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{t.dashboardSubtitle}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsManageModalOpen(true)}
                            className="text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors border border-gray-300 shadow-sm flex items-center gap-2"
                        >
                            <School size={14} />
                            {t.manageData}
                        </button>

                        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <MapPin size={18} className="text-gray-400 ml-2" />
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer min-w-[150px]"
                            >
                                {districts.map(d => (
                                    <option key={d} value={d}>{d} {t.district}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* KPI Cards (Real ASER Data) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Student Attendance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                                {t.dayOfVisit}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.avg_student_attendance}%</h3>
                        <p className="text-gray-500 text-sm font-medium">{t.avgStudentAttendance}</p>
                    </div>

                    {/* Govt School Enrollment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <School size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                                {t.ageGroup}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.enrollment_govt}%</h3>
                        <p className="text-gray-500 text-sm font-medium">{t.govtSchoolEnrollment}</p>
                    </div>

                    {/* Private Tuition (Fixed Icon) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <GraduationCap size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {t.grades}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.private_tuition}%</h3>
                        <p className="text-gray-500 text-sm font-medium">{t.privateTuition}</p>
                    </div>
                </div>

                {/* ASER Education Quality Report Card (Expanded) */}
                {stats && stats.aserData && (
                    <div className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <BrainCircuit size={20} className="text-yellow-400" />
                                {t.aserMetricsTitle}
                            </h3>
                            <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">{t.learningOutcomes}</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">{t.grade3Reading}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.learningLevels.reading.std3_can_read_std2_level}%</span>
                                    <span className="text-xs text-green-600 mb-1">{t.canReadGrade2}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.aserData.learningLevels.reading.std3_can_read_std2_level}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">{t.grade5Math}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.learningLevels.arithmetic.std5_can_do_division}%</span>
                                    <span className="text-xs text-indigo-600 mb-1">{t.canDoDivision}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.aserData.learningLevels.arithmetic.std5_can_do_division}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">{t.grade8Reading}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.learningLevels.reading.std8_can_read_std2_level}%</span>
                                    <span className="text-xs text-green-600 mb-1">{t.canReadGrade2}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.aserData.learningLevels.reading.std8_can_read_std2_level}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">{t.grade8Math}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.learningLevels.arithmetic.std8_can_do_division}%</span>
                                    <span className="text-xs text-indigo-600 mb-1">{t.canDoDivision}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${stats.aserData.learningLevels.arithmetic.std8_can_do_division}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">{t.toilets}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.schoolFacilities.toilets.usable}%</span>
                                    <span className="text-xs text-gray-500 mb-1">{t.functional}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.aserData.schoolFacilities.toilets.usable}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">{t.drinkingWater}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.schoolFacilities.drinkingWater.available}%</span>
                                    <span className="text-xs text-gray-500 mb-1">{t.available}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${stats.aserData.schoolFacilities.drinkingWater.available}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teacher Stats Section (From Main) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="text-blue-600" size={24} />
                        <h3 className="text-lg font-bold text-gray-900">{t.teacherDistribution}</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {teacherStats && Object.entries(teacherStats).map(([subject, count]) => (
                            <div key={subject} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center text-center hover:bg-blue-50 transition-colors">
                                <div className="text-2xl font-bold text-blue-900 mb-1">{count}</div>
                                <div className="text-xs font-medium text-gray-600">{subject}</div>
                            </div>
                        ))}
                        {!teacherStats && <div className="col-span-full text-center text-gray-400">{t.noTeacherData}</div>}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Learning Levels Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-600" />
                                {t.learningLevelsDist}
                            </h3>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {t.viewFullReport}
                            </button>
                        </div>
                        <div className="h-[300px]">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Data Privacy Note */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-gray-600">
                            <AlertCircle size={20} />
                            <h3 className="text-lg font-bold text-gray-900">{t.dataPrivacyNotice}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                <h4 className="font-bold text-yellow-800 text-sm mb-2">{t.schoolLevelUnavailable}</h4>
                                <p className="text-sm text-yellow-700 leading-relaxed">
                                    {t.privacyMessage1}
                                </p>
                                <p className="text-sm text-yellow-700 mt-2 leading-relaxed">
                                    {t.privacyMessage2}
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <h4 className="font-bold text-gray-900 text-sm">{t.availableGranularity}</h4>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-600">{t.stateLevel}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-600">{t.nationalTrends}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    <span className="text-sm text-gray-400 line-through">{t.districtBlockSpecifics}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <SchoolAuditPanel
                isOpen={false}
                onClose={() => { }}
                school={null}
            />

            <DetailedReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                district={selectedDistrict}
                stats={stats}
            />

            <SchoolManagementModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                districts={getDistricts()}
                onSave={handleDataUpdate}
            />
        </div>
    );
};

export default GovernmentDashboard;
