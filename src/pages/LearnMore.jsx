import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { GraduationCap, Users, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearnMore = () => {
    const { language } = useLanguage();
    const t = translations[language]?.learnMore || {};
    const navigate = useNavigate();

    const features = [
        {
            role: 'teacher',
            icon: GraduationCap,
            color: 'text-blue-600 bg-blue-50',
            title: t.teacherTitle || "Teacher View",
            desc: t.teacherDesc || "View real-time class attendance and reduce admin time.",
            benefits: t.teacherBenefits || [
                "Mark attendance with Face ID",
                "Generate instant daily reports",
                "Track student regularity"
            ]
        },
        {
            role: 'parent',
            icon: Users,
            color: 'text-green-600 bg-green-50',
            title: t.parentTitle || "Parent View",
            desc: t.parentDesc || "Track your child’s safety & attendance instantly.",
            benefits: t.parentBenefits || [
                "Receive instant absence alerts",
                "Apply for leave digitally",
                "View monthly attendance logs"
            ]
        },
        {
            role: 'admin',
            icon: ShieldCheck,
            color: 'text-purple-600 bg-purple-50',
            title: t.adminTitle || "Admin View",
            desc: t.adminDesc || "Generate compliance reports for the Education Board effortlessly.",
            benefits: t.adminBenefits || [
                "Monitor all classes in real-time",
                "Manage teacher rosters",
                "Export government compliant reports"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header variant="simple" />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            {t.heroTitle || "Why Choose Digital Hazri?"}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {t.heroSubtitle || "Discover how our smart attendance system empowers schools, protects students, and simplifies administration."}
                        </p>
                    </div>
                </div>

                {/* Features Split Section */}
                <div className="container mx-auto px-4 py-16 max-w-6xl space-y-24">
                    {features.map((feature, index) => (
                        <div key={index} className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

                            {/* Visual Side */}
                            <div className="flex-1 w-full">
                                <div className={`aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white ${index % 2 === 0 ? 'bg-gradient-to-br from-blue-100 to-white' : 'bg-gradient-to-bl from-purple-100 to-white'} flex items-center justify-center relative group`}>
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                                    <div className={`relative z-10 p-8 rounded-full ${feature.color} shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                        <feature.icon size={80} />
                                    </div>
                                    {/* Decorative circles */}
                                    <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-current opacity-10 blur-xl text-blue-500"></div>
                                    <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-current opacity-10 blur-xl text-purple-500"></div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 space-y-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${feature.color}`}>
                                    <feature.icon size={16} />
                                    {feature.role}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    {feature.title}
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {feature.desc}
                                </p>

                                <ul className="space-y-3 pt-2">
                                    {feature.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                            <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                            <span className="font-medium">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="bg-gray-900 text-white py-20 mt-12">
                    <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {t.ctaTitle || "Ready to transform your school?"}
                        </h2>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 mx-auto"
                        >
                            {t.ctaButton || "Get Started Now"}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LearnMore;
