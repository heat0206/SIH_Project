import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { translations } from '../utils/translations';

const Home = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    // Fallback to English if translation is missing, or use a default object
    const t = translations[language]?.home || {};

    const [role, setRole] = useState('student'); // Default to student (mapped to Parent/Student role)
    const [credentials, setCredentials] = useState({
        userid: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
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

    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await login(credentials.userid, credentials.password, rememberMe);
            const user = userCredential.user;

            // Fetch user profile to check role
            const userProfile = await getUserProfile(user.uid);

            if (!userProfile) {
                throw new Error("User profile not found.");
            }

            const selectedRole = role;
            const dbRole = userProfile.role;

            let isAuthorized = false;

            if (selectedRole === 'admin' && dbRole === 'admin') isAuthorized = true;
            else if (selectedRole === 'teacher' && dbRole === 'teacher') isAuthorized = true;
            else if (selectedRole === 'student' && (dbRole === 'student' || dbRole === 'parent')) isAuthorized = true;

            if (!isAuthorized) {
                throw new Error(`Access denied. You are not a ${selectedRole}.`);
            }

            if (selectedRole === 'student') {
                navigate('/parent-dashboard');
            } else if (selectedRole === 'teacher') {
                navigate('/dashboard');
            } else if (selectedRole === 'admin') {
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error(err);
            if (err.message.includes('Access denied')) {
                setError(err.message);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const RoleCard = ({ id, icon: Icon, label }) => (
        <div
            onClick={() => {
                setRole(id);
                setRememberMe(false);
            }}
            className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${role === id
                ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105'
                : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
                }`}
        >
            <Icon
                size={32}
                className={`mb-2 ${role === id ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <span className={`font-semibold text-sm ${role === id ? 'text-blue-900' : 'text-gray-500'}`}>
                {label}
            </span>
        </div>
    );

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
                                {t.digitalHazri}
                            </div>
                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900"
                                style={{ lineHeight: language === 'hi' ? '1.4' : undefined }}
                            >
                                {t.heroTitle}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                                {t.heroSubtitle}
                            </p>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                            <img
                                src="/rural-school.jpg"
                                alt="Students in a rural Indian school classroom"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-4 left-6 text-white">
                                <p className="font-medium text-lg">{t.imageCaptionTitle}</p>
                                <p className="text-sm opacity-90">{t.imageCaptionSubtitle}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Login Widget */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up delay-100">
                            <div className="p-8 space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{t.welcomeBack}</h2>
                                    <p className="text-gray-500">{t.selectRole}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <RoleCard id="teacher" icon={GraduationCap} label={t.teacher} />
                                    <RoleCard id="student" icon={Users} label={t.parent} />
                                    <RoleCard id="admin" icon={ShieldCheck} label={t.admin} />
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* Credentials */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 ml-1">
                                                {role === 'admin' ? t.emailLabel : t.userIdLabel}
                                            </label>
                                            <input
                                                type={role === 'admin' ? 'email' : 'text'}
                                                name="userid"
                                                value={credentials.userid}
                                                onChange={handleInputChange}
                                                placeholder={role === 'admin' ? t.emailPlaceholder : t.enterIdPlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 ml-1">{t.passwordLabel}</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={credentials.password}
                                                onChange={handleInputChange}
                                                placeholder={t.passwordPlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {role === 'student' && (
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                                {t.rememberMe || "Remember me"}
                                            </label>
                                        </div>
                                    )}

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
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {t.loggingIn}
                                            </span>
                                        ) : (
                                            t.loginButton
                                        )}
                                    </button>
                                </form>

                                <div className="pt-4 border-t border-gray-100 text-center space-y-2">
                                    <p className="text-sm text-gray-500">
                                        {t.troubleLoggingIn} <a href="#" className="text-blue-600 font-medium hover:underline">{t.contactSupport}</a>
                                    </p>
                                    <div className="flex justify-center gap-4 text-xs font-medium">
                                        <Link to="/government-dashboard" className="text-indigo-600 hover:underline">
                                            Govt. Monitor
                                        </Link>
                                    </div>
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

export default Home;
