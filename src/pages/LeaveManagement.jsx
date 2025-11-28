import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, CheckCircle, XCircle, Clock, Search, Filter, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const LeaveManagement = () => {
    const { language } = useLanguage();
    const t = translations[language].leaveManagement;

    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Leave Requests Data
    const [requests, setRequests] = useState([
        { id: 1, student: 'Rohan Kumar', class: 'VI-B', type: 'Sick Leave', from: '2023-11-15', to: '2023-11-17', days: 3, reason: 'High fever and viral infection', status: 'Pending', date: '2023-11-14' },
        { id: 2, student: 'Priya Singh', class: 'VI-B', type: 'Family Function', from: '2023-11-20', to: '2023-11-21', days: 2, reason: 'Sister\'s wedding ceremony', status: 'Pending', date: '2023-11-14' },
        { id: 3, student: 'Amit Patel', class: 'VI-B', type: 'Casual Leave', from: '2023-11-10', to: '2023-11-10', days: 1, reason: 'Personal work', status: 'Approved', date: '2023-11-08' },
        { id: 4, student: 'Sneha Gupta', class: 'VI-B', type: 'Sick Leave', from: '2023-11-05', to: '2023-11-07', days: 3, reason: 'Stomach infection', status: 'Rejected', date: '2023-11-04' },
    ]);

    const handleAction = (id, action) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: action === 'approve' ? 'Approved' : 'Rejected' } : req
        ));
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'all' || req.status.toLowerCase() === filter;
        const matchesSearch = req.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.class.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12} /> {t.approved}</span>;
            case 'Rejected':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"><XCircle size={12} /> {t.rejected}</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock size={12} /> {t.pending}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                        <p className="text-gray-600 mt-1">{t.subtitle}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white w-full sm:w-auto"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">{t.allRequests}</option>
                                <option value="pending">{t.pending}</option>
                                <option value="approved">{t.approved}</option>
                                <option value="rejected">{t.rejected}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">{t.student}</th>
                                    <th className="px-6 py-4">{t.leaveDetails}</th>
                                    <th className="px-6 py-4">{t.duration}</th>
                                    <th className="px-6 py-4">{t.status}</th>
                                    <th className="px-6 py-4 text-right">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            {t.noRequests}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {req.student.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{req.student}</div>
                                                        <div className="text-xs text-gray-500">{req.class}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{req.type}</div>
                                                <div className="text-sm text-gray-500 mt-1">{req.reason}</div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Calendar size={12} /> {req.from} - {req.to}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-700">{req.days} {t.days}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === 'Pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleAction(req.id, 'approve')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title={t.approve}
                                                        >
                                                            <CheckCircle size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'reject')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title={t.reject}
                                                        >
                                                            <XCircle size={20} />
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
            </main>

            <Footer />
        </div>
    );
};

export default LeaveManagement;
