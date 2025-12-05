import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    School,
    TrendingDown,
    AlertTriangle,
    Utensils,
    Users,
    MapPin,
    BrainCircuit,
    ArrowDownRight,
    ArrowUpRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    getDistricts,
    getDistrictStats,
    getSchoolTrends,
    getGhostSchools,
    getAIInsight
} from '../services/governmentService';
import SchoolAuditPanel from '../components/SchoolAuditPanel';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const GovernmentDashboard = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('Varanasi');
    const [stats, setStats] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [ghostSchools, setGhostSchools] = useState([]);
    const [aiInsight, setAiInsight] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [selectedAuditSchool, setSelectedAuditSchool] = useState(null);

    useEffect(() => {
        setDistricts(getDistricts());
    }, []);

    useEffect(() => {
        // Fetch data when district changes
        const districtStats = getDistrictStats(selectedDistrict);
        const trends = getSchoolTrends(selectedDistrict);
        const ghosts = getGhostSchools(selectedDistrict);
        const insight = getAIInsight(selectedDistrict);

        setStats(districtStats);
        setTrendData(trends);
        setGhostSchools(ghosts);
        setAiInsight(insight);
    }, [selectedDistrict]);

    if (!stats || !trendData) return <div className="p-8 text-center">Loading Ministry Data...</div>;

    const chartData = {
        labels: trendData.labels,
        datasets: [
            {
                label: 'Avg Attendance %',
                data: trendData.data,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4,
                pointBackgroundColor: 'white',
                pointBorderColor: 'rgb(59, 130, 246)',
                pointBorderWidth: 2,
                pointRadius: 4,
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
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#f3f4f6' },
                ticks: { font: { size: 11 } }
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

                {/* AI Insight Badge */}
                {aiInsight && (
                    <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BrainCircuit size={64} className="text-indigo-600" />
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600 z-10">
                            <BrainCircuit size={24} />
                        </div>
                        <div className="z-10">
                            <h3 className="text-indigo-900 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                AI Insight Detected
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">BETA</span>
                            </h3>
                            <p className="text-indigo-800 font-medium">{aiInsight.message}</p>
                        </div>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Active Schools */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <School size={24} />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <ArrowUpRight size={12} /> +2.4%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeSchools}</h3>
                        <p className="text-gray-500 text-sm font-medium">Active Schools Reporting</p>
                    </div>

                    {/* Avg Attendance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${parseFloat(stats.avgAttendance) < 75 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                {parseFloat(stats.avgAttendance) < 75 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                {Math.abs(parseFloat(stats.avgAttendance) - 75).toFixed(1)}%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.avgAttendance}%</h3>
                        <p className="text-gray-500 text-sm font-medium">Average Attendance</p>
                    </div>

                    {/* Resources Saved */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                <Utensils size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Today
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.mealsSaved}</h3>
                        <p className="text-gray-500 text-sm font-medium">Mid-Day Meals Saved (Audit)</p>
                        <p className="text-xs text-gray-400 mt-2">Based on {stats.totalEnrolled} enrolled vs {stats.totalPresent} present</p>
                    </div>
                </div>

                {/* Charts & Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Trend Graph */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Attendance Trend (7 Days)</h3>
                            <button className="text-sm text-blue-600 hover:underline">View Full Report</button>
                        </div>
                        <div className="h-[300px]">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Ghost School Detector */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-red-600">
                            <AlertTriangle size={20} />
                            <h3 className="text-lg font-bold text-gray-900">"Ghost School" Detector</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Schools with critical attendance levels ({'<'} 50%) flagged for immediate audit.</p>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {ghostSchools.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No critical alerts in this district.</div>
                            ) : (
                                <div className="space-y-3">
                                    {ghostSchools.map(school => (
                                        <div key={school.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-800 text-sm">{school.name}</h4>
                                                <span className="bg-red-200 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    {school.attendance}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600">ID: {school.id}</div>
                                            <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                                <Users size={10} /> Principal: {school.principal}
                                            </div>
                                            <button
                                                onClick={() => setSelectedAuditSchool(school)}
                                                className="mt-2 w-full py-1 bg-white border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition-colors"
                                            >
                                                Initiate Audit
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <Footer />

            <SchoolAuditPanel
                isOpen={!!selectedAuditSchool}
                onClose={() => setSelectedAuditSchool(null)}
                school={selectedAuditSchool}
            />
        </div>
    );
};

export default GovernmentDashboard;
