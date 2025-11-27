import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';

const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        name: 'Sunil Sharma',
        role: 'Senior Teacher',
        email: 'sunil.sharma@school.edu',
        phone: '+91 98765 43210',
        id: 'EMP-2023-045',
        department: 'Mathematics',
        joiningDate: '15 June 2018',
        address: '42, Saraswati Vihar, New Delhi',
        bio: 'Passionate mathematics educator with over 8 years of experience in fostering student engagement and curriculum development.'
    });

    const [editForm, setEditForm] = useState(user);

    const handleEdit = () => {
        setEditForm(user);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm(user);
    };

    const handleSave = () => {
        setUser(editForm);
        setIsEditing(false);
        // In a real app, we would make an API call here
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="dashboard" />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="px-8 pb-8 relative">
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-8 gap-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-blue-600 text-4xl font-bold">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 transition-colors border border-gray-100">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-grow pt-4 md:pt-0">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-blue-600 font-medium text-lg">{user.role}</p>
                            </div>

                            <div className="flex gap-3 mt-4 md:mt-0">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleEdit}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column - Personal Info */}
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editForm.name}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="text-gray-900 font-medium">{user.name}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Role / Designation</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={editForm.role}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="text-gray-900 font-medium">{user.role}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editForm.email}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-900">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={editForm.phone}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-900">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Address</label>
                                            {isEditing ? (
                                                <textarea
                                                    name="address"
                                                    value={editForm.address}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="flex items-start gap-2 text-gray-900">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                                    {user.address}
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Bio</label>
                                            {isEditing ? (
                                                <textarea
                                                    name="bio"
                                                    value={editForm.bio}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-700 leading-relaxed">
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column - Employment Details */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        Employment Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Employee ID</div>
                                            <div className="font-mono text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                                                {user.id}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</div>
                                            <div className="text-gray-900 font-medium">{user.department}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Joining</div>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {user.joiningDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                    <h3 className="text-lg font-bold text-blue-900 mb-2">Account Status</h3>
                                    <div className="flex items-center gap-2 text-green-700 font-medium mb-4">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Active
                                    </div>
                                    <p className="text-sm text-blue-800 mb-4">
                                        Your account is fully verified and has access to all teacher portals.
                                    </p>
                                    <button className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserProfile;
