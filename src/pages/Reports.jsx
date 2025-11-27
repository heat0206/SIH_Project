import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const { language } = useLanguage();
    const t = translations[language].reports;
    const tDashboard = translations[language].dashboard;
    const [selectedClass, setSelectedClass] = useState('all');
    const [dateRange, setDateRange] = useState('today');

    // Mock Data - In a real app, this would be fetched based on filters
    const attendanceData = [
        { class: 'Class VI - B', percentage: 95.5 },
        { class: 'Class VIII - A', percentage: 88.0 },
        { class: 'Class X - A', percentage: 85.1 },
        { class: 'Class XI - B', percentage: 98.2 }
    ];

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: t.chartTitle,
                font: {
                    size: 20,
                    weight: 'bold'
                },
                color: '#232946',
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: '#232946',
                titleColor: '#eebbc3',
                bodyColor: '#fff',
                callbacks: {
                    label: function (context) {
                        return `${t.attendancePercentage}: ${context.parsed.y}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: t.attendancePercentage,
                    font: {
                        weight: 'bold'
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: t.classLabel,
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    };

    const data = {
        labels: attendanceData.map(item => item.class),
        datasets: [
            {
                label: t.attendancePercentage,
                data: attendanceData.map(item => item.percentage),
                backgroundColor: [
                    'rgba(79, 70, 229, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(255, 205, 86, 0.85)',
                    'rgba(255, 99, 132, 0.85)'
                ],
                borderRadius: 5,
            },
        ],
    };

    const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const backLabel = tDashboard?.backToDashboard || "Back to Dashboard";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />
            <Link to="/dashboard" className="back-fab" aria-label={backLabel} title={backLabel} style={{
                position: 'fixed', left: '2rem', top: '100px', zIndex: 2000,
                width: '40px', height: '40px', borderRadius: '50%', background: 'white',
                boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-dark)', border: '1px solid var(--border-color)', transition: 'transform 0.2s ease'
            }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Link>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
                        <div className="text-gray-500 mt-1">{t.generatedOn}: {today}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col w-full md:w-auto">
                        <label htmlFor="class-select" className="text-sm font-medium text-gray-700 mb-1">{t.selectClass}:</label>
                        <select
                            id="class-select"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="all">{t.allClasses}</option>
                            <option value="VI-B">Class VI-B</option>
                            <option value="VIII-A">Class VIII-A</option>
                            <option value="X-A">Class X-A</option>
                            <option value="XI-B">Class XI-B</option>
                        </select>
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                        <label htmlFor="date-range-select" className="text-sm font-medium text-gray-700 mb-1">{t.dateRange}:</label>
                        <select
                            id="date-range-select"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="today">{t.today}</option>
                            <option value="last-7-days">{t.last7Days}</option>
                            <option value="last-30-days">{t.last30Days}</option>
                            <option value="custom">{t.custom}</option>
                        </select>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="bg-white p-6 rounded-xl shadow-sm h-[500px] w-full max-w-4xl mx-auto">
                    <Bar options={options} data={data} />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Reports;
