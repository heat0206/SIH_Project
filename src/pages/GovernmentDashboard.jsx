import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Utensils,
    Users,
    MapPin,
    BrainCircuit,
    AlertCircle,
    BookOpen
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
    getDistrictStats
} from '../services/governmentService';
import SchoolAuditPanel from '../components/SchoolAuditPanel';
import DetailedReportModal from '../components/DetailedReportModal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const GovernmentDashboard = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('Amritsar');
    const [stats, setStats] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = sessionStorage.getItem('isGovtAuthenticated');
        if (isAuth !== 'true') {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        setDistricts(getDistricts());
    }, []);

    useEffect(() => {
        const districtStats = getDistrictStats(selectedDistrict);
        setStats(districtStats);
    }, [selectedDistrict]);

    if (!stats) return <div className="p-8 text-center">Loading Ministry Data...</div>;

    const chartData = {
        labels: ['Grade 3 Reading', 'Grade 5 Math'],
        datasets: [
            {
                label: '% Students',
                data: [
                    stats.aserData.learningLevels.reading.std3_can_read_std2_level,
                    stats.aserData.learningLevels.arithmetic.std5_can_do_division
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(99, 102, 241, 0.8)'
                ],
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
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
            <Header variant="simple" title="Ministry of Education - Monitoring Cell" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <LayoutDashboard className="text-blue-600" />
                            Macro-Monitoring Dashboard
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Real-time audit & resource tracking across districts</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <MapPin size={18} className="text-gray-400 ml-2" />
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer min-w-[150px]"
                        >
                            {districts.map(d => (
                                <option key={d} value={d}>{d} District</option>
                            ))}
                        </select>
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
                                Day of Visit
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.avg_student_attendance}%</h3>
                        <p className="text-gray-500 text-sm font-medium">Avg Student Attendance (DoV)</p>
                    </div>

                    {/* Govt School Enrollment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <School size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                                Age 6-14
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.enrollment_govt}%</h3>
                        <p className="text-gray-500 text-sm font-medium">Govt School Enrollment</p>
                    </div>

                    {/* Private Tuition */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                <Utensils size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Std I-V
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.private_tuition}%</h3>
                        <p className="text-gray-500 text-sm font-medium">Students taking Pvt Tuition</p>
                    </div>
                </div>

                {/* ASER Education Quality Report Card */}
                {stats && stats.aserData && (
                    <div className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <BrainCircuit size={20} className="text-yellow-400" />
                                ASER 2024 Educational Quality Metrics
                            </h3>
                            <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">Learning Outcomes</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">Grade 3 (Reading)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.learningLevels.reading.std3_can_read_std2_level}%</span>
                                    <span className="text-xs text-green-600 mb-1">Students can read Grade 2 text</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.aserData.learningLevels.reading.std3_can_read_std2_level}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">Grade 5 (Arithmetic)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.learningLevels.arithmetic.std5_can_do_division}%</span>
                                    <span className="text-xs text-indigo-600 mb-1">Students can do Division</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.aserData.learningLevels.arithmetic.std5_can_do_division}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">School Facilities (Toilets)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.schoolFacilities.toilets.usable}%</span>
                                    <span className="text-xs text-gray-500 mb-1">Functional</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.aserData.schoolFacilities.toilets.usable}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-medium">Drinking Water</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.aserData.schoolFacilities.drinkingWater.available}%</span>
                                    <span className="text-xs text-gray-500 mb-1">Available</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${stats.aserData.schoolFacilities.drinkingWater.available}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts & Privacy Note */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Learning Levels Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-600" />
                                Learning Levels Distribution
                            </h3>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View Full Report
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
                            <h3 className="text-lg font-bold text-gray-900">Data Privacy Notice</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                <h4 className="font-bold text-yellow-800 text-sm mb-2">School-Level Data Unavailable</h4>
                                <p className="text-sm text-yellow-700 leading-relaxed">
                                    To protect the privacy of students and staff, the Annual Status of Education Report (ASER) 2024
                                    <strong> does not publish identifiers for individual schools or blocks.</strong>
                                </p>
                                <p className="text-sm text-yellow-700 mt-2 leading-relaxed">
                                    All metrics displayed are aggregated at the State level to ensure statistical significance and anonymity.
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <h4 className="font-bold text-gray-900 text-sm">Available Data Granularity:</h4>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-600">State-Level Aggregates</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-600">National Trends</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    <span className="text-sm text-gray-400 line-through">District/Block Specifics</span>
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
        </div>
    );
};

export default GovernmentDashboard;
