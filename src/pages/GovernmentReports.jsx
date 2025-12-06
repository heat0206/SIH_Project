
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, PieChart, FileText, Download } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GovernmentReports = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="simple" title="Ministry of Education - Detailed Reports" />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-blue-700 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">District Performance Reports</h1>
                        <p className="text-gray-500 mt-1">Detailed analysis and downloadable metrics for all districts.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                            <Download size={18} />
                            Export All Data
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Placeholder Report Cards */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                            <BarChart2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance Analytics</h3>
                        <p className="text-sm text-gray-500 mb-4">Comprehensive breakdown of student and teacher attendance across all zones.</p>
                        <span className="text-blue-600 text-sm font-medium hover:underline">View Report &rarr;</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-600">
                            <PieChart size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Resource Utilization</h3>
                        <p className="text-sm text-gray-500 mb-4">Mid-day meal consumption vs. enrollment statistics and variance reports.</p>
                        <span className="text-blue-600 text-sm font-medium hover:underline">View Report &rarr;</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Audit Logs</h3>
                        <p className="text-sm text-gray-500 mb-4">History of AI-detected anomalies and manual intervention records.</p>
                        <span className="text-blue-600 text-sm font-medium hover:underline">View Report &rarr;</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">More reports coming soon</h3>
                        <p className="text-gray-500">We are currently aggregating data from the new academic year. Check back later for historical analysis.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GovernmentReports;
