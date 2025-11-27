import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Check, X, Filter, Search, Calendar, User, FileText } from 'lucide-react';

const LeaveManagement = () => {
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Requests Data
    const [requests, setRequests] = useState([
        { id: 1, student: 'Aarav Patel', roll: '12', class: 'X-A', type: 'Sick', from: '2025-11-28', to: '2025-11-30', reason: 'Suffering from high fever and viral infection.', status: 'pending', date: '2025-11-27' },
        { id: 2, student: 'Priya Singh', roll: '24', class: 'X-A', type: 'Family', from: '2025-12-05', to: '2025-12-07', reason: 'Attending sister\'s wedding ceremony in Jaipur.', status: 'pending', date: '2025-11-26' },
        { id: 3, student: 'Rahul Kumar', roll: '05', class: 'X-A', type: 'Medical', from: '2025-11-20', to: '2025-11-22', reason: 'Dental surgery appointment.', status: 'approved', date: '2025-11-18' },
        { id: 4, student: 'Sneha Gupta', roll: '31', class: 'X-A', type: 'Casual', from: '2025-11-15', to: '2025-11-15', reason: 'Personal work at bank.', status: 'rejected', date: '2025-11-14' },
    ]);

    const handleAction = (id, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus} this request?`)) {
            setRequests(requests.map(req =>
                req.id === id ? { ...req, status: newStatus } : req
            ));
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'all' ? true : req.status === filter;
        const matchesSearch = req.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.roll.includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wide">Approved</span>;
            case 'rejected': return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide">Rejected</span>;
            default: return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wide">Pending</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                        <p className="text-gray-500 mt-1">Review and manage student leave applications.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                            />
                        </div>
                        <div className="flex bg-white rounded-lg border border-gray-300 p-1">
                            {['all', 'pending', 'approved', 'rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        filteredRequests.map((req) => (
                            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                                                {req.student.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-900">{req.student}</h3>
                                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Roll #{req.roll}</span>
                                                    {getStatusBadge(req.status)}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" /> Class {req.class}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Applied: {req.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 self-start md:self-center">
                                                <button
                                                    onClick={() => handleAction(req.id, 'rejected')}
                                                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'approved')}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Duration</span>
                                            <div className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                {req.from} <span className="text-gray-400">to</span> {req.to}
                                                <span className="text-sm text-gray-500 font-normal">
                                                    ({Math.ceil((new Date(req.to) - new Date(req.from)) / (1000 * 60 * 60 * 24)) + 1} Days)
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</span>
                                            <p className="mt-1 text-gray-700 text-sm leading-relaxed">
                                                {req.reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LeaveManagement;
