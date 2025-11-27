import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Bypass validation as per user request
        const admin = { name: 'Admin User', email: email || 'admin@school.com', role: 'admin' };

        localStorage.setItem('currentUser', JSON.stringify(admin));
        navigate('/admin/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header variant="landing" />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-red-600">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
                        <p className="text-gray-500 mt-2">Restricted Access</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="admin@school.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            Access Dashboard
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
                            Not an admin? Go to Teacher Login
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminLogin;
