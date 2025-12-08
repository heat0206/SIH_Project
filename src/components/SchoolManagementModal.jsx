import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { addSchool, updateSchool } from '../services/governmentService';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const SchoolManagementModal = ({ isOpen, onClose, districts, onSave }) => {
    const { language } = useLanguage();
    const t = translations[language]?.governmentDashboard || {};
    const [formData, setFormData] = useState({
        name: '',
        district: districts[0] || '',
        totalEnrolled: '',
        avgAttendance: '',
        principal: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (districts.length > 0 && !formData.district) {
            setFormData(prev => ({ ...prev, district: districts[0] }));
        }
    }, [districts]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                totalEnrolled: parseInt(formData.totalEnrolled),
                avgAttendance: parseFloat(formData.avgAttendance),
                teachers: { // Default teachers for new school
                    "Mathematics": 1,
                    "Science": 1,
                    "English": 1,
                    "Hindi": 1,
                    "Social Studies": 1
                }
            };

            const result = await addSchool(payload);
            if (result.success) {
                onSave();
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    district: districts[0] || '',
                    totalEnrolled: '',
                    avgAttendance: '',
                    principal: ''
                });
            } else {
                setError("Failed to save school. Please try again.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Add New School</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Govt High School..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.district || 'District'}</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.district}
                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                        >
                            {districts.map(d => (
                                <option key={d} value={d}>{t[d] || d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Enrolled</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.totalEnrolled}
                                onChange={e => setFormData({ ...formData, totalEnrolled: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avg Attendance %</label>
                            <input
                                type="number"
                                required
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.avgAttendance}
                                onChange={e => setFormData({ ...formData, avgAttendance: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.principal}
                            onChange={e => setFormData({ ...formData, principal: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    Save Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SchoolManagementModal;
