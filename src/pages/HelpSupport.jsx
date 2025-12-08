import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MessageCircle, ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const HelpSupport = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [activeAccordion, setActiveAccordion] = useState(null);
    const t = translations[language]?.help || translations['en'].help;

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const faqs = t.faqs;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
            <Header variant="standard" />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-blue-600 text-white py-16 px-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full z-0 opacity-10 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-white blur-[50px]"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-white blur-[50px]"></div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all backdrop-blur-md z-20"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            {t.heroTitle}
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl mb-8">
                            {t.heroSubtitle}
                        </p>
                        <div className="relative max-w-xl mx-auto">
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                className="w-full py-4 px-6 pr-12 rounded-full text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all"
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-8">
                    {/* Contact Cards */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <Phone size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t.callUs}</h3>
                        <p className="text-gray-600 mb-4">{t.callTime}</p>
                        <a href="tel:+911234567890" className="text-blue-600 font-semibold hover:underline">+91 123 456 7890</a>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t.chatSupport}</h3>
                        <p className="text-gray-600 mb-4">{t.chatDesc}</p>
                        <button className="text-green-600 font-semibold hover:underline">{t.startChat}</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t.emailUs}</h3>
                        <p className="text-gray-600 mb-4">{t.emailDesc}</p>
                        <a href="mailto:support@digitalhazri.com" className="text-purple-600 font-semibold hover:underline">support@digitalhazri.com</a>
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-4 py-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                        {t.faqTitle}
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none"
                                >
                                    <span className="font-semibold text-gray-800 text-lg">{faq.question}</span>
                                    {activeAccordion === index ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-gray-400" />}
                                </button>
                                <div
                                    className={`px-5 text-gray-600 overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === index ? 'max-h-40 py-4 border-t border-gray-100' : 'max-h-0'}`}
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Form */}
                <section className="bg-white py-16">
                    <div className="max-w-3xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
                            {t.contactTitle}
                        </h2>
                        <p className="text-center text-gray-600 mb-8">{t.contactSubtitle}</p>

                        <form className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-inner border border-gray-100" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">{t.name}</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">{t.email}</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{t.message}</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder={t.describeIssue}></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                {t.send}
                            </button>
                        </form>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default HelpSupport;
