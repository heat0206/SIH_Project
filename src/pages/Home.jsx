import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Home = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    // Fallback to English if translation is missing, or use a default object
    const t = translations[language]?.home || {};

    const [role, setRole] = useState('student');
    const [credentials, setCredentials] = useState({
        userid: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay for professional feel
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (role === 'student') {
                // Mock Student Login
                const studentData = {
                    id: credentials.userid || 'S-GUEST',
                    name: "Guest Student",
                    roll: "N/A",
                    classId: "8th Grade",
                    photo: "https://via.placeholder.com/150"
                };
                navigate('/student-dashboard', { state: { student: studentData } });
            } else if (role === 'teacher') {
                // Mock Teacher Login
                navigate('/dashboard');
            } else if (role === 'admin') {
                // Mock Admin Login
                const admin = {
                    name: 'Admin User',
                    email: credentials.userid || 'admin@school.com',
                    role: 'admin'
                };
                localStorage.setItem('currentUser', JSON.stringify(admin));
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
            <Header variant="landing" />

            <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full z-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400 blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-400 blur-[100px]"></div>
                </div>

                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Left Side: Text & Image */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold tracking-wide uppercase border border-blue-100">
                                Smart Attendance System
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                                Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">School Management</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                                Streamline attendance, enhance security, and simplify administration with our cutting-edge digital ecosystem.
                            </p>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                alt="Modern School Environment"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-4 left-6 text-white">
                                <p className="font-medium text-lg">Empowering Education</p>
                                <p className="text-sm opacity-90">Trusted by leading institutions</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Login Widget */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up delay-100">
                            <div className="p-8 space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                                    <p className="text-gray-500">Please select your role to continue</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* Role Selector */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 ml-1">I am a...</label>
                                        <div className="relative">
                                            <select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                                            >
                                                <option value="student">Student</option>
                                                <option value="teacher">Teacher</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credentials */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 ml-1">
                                                {role === 'admin' ? 'Email Address' : 'User ID / Roll Number'}
                                            </label>
                                            <input
                                                type={role === 'admin' ? 'email' : 'text'}
                                                name="userid"
                                                value={credentials.userid}
                                                onChange={handleInputChange}
                                                placeholder={role === 'admin' ? 'admin@school.com' : 'Enter your ID'}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={credentials.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center animate-pulse">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-200 ${loading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            'Secure Login'
                                        )}
                                    </button>
                                </form>

                                <div className="pt-4 border-t border-gray-100 text-center">
                                    <p className="text-sm text-gray-500">
                                        Trouble logging in? <a href="#" className="text-blue-600 font-medium hover:underline">Contact Support</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div >
    );
};

export default Home;
