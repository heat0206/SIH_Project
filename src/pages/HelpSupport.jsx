import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MessageCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HelpSupport = () => {
    const { language } = useLanguage();
    const [activeAccordion, setActiveAccordion] = useState(null);

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const faqs = [
        {
            question: language === 'hi' ? 'मैं अपना पासवर्ड कैसे रीसेट कर सकता हूं?' : 'How do I reset my password?',
            answer: language === 'hi'
                ? 'आप लॉगिन पेज पर "पासवर्ड भूल गए" लिंक पर क्लिक कर सकते हैं।'
                : 'You can click on the "Forgot Password" link on the login page to initiate the reset process via email/OTP.',
        },
        {
            question: language === 'hi' ? 'क्या मैं अपनी उपस्थिति मैन्युअल रूप से दर्ज कर सकता हूं?' : 'Can I mark my attendance manually?',
            answer: language === 'hi'
                ? 'नहीं, उपस्थिति केवल चेहरे की पहचान के माध्यम से स्वचालित रूप से दर्ज की जाती है।'
                : 'No, attendance is marked automatically via facial recognition to ensure accuracy.',
        },
        {
            question: language === 'hi' ? 'अगर मुझे तकनीकी समस्या आती है तो मुझे क्या करना चाहिए?' : 'What should I do if I face a technical issue?',
            answer: language === 'hi'
                ? 'कृपया नीचे दिए गए संपर्क फॉर्म का उपयोग करके हमारी सहायता टीम से संपर्क करें।'
                : 'Please contact our support team using the contact form below or call our helpline.',
        },
        {
            question: language === 'hi' ? 'क्या यह ऐप ऑफ़लाइन काम करता है?' : 'Does this app work offline?',
            answer: language === 'hi' ? 'ऐप की कुछ सुविधाएँ ऑफ़लाइन काम कर सकती हैं लेकिन डेटा सिंक करने के लिए इंटरनेट की आवश्यकता है।' : 'Some features may work offline, but an internet connection is required to sync data with the server.',
        }
    ];

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
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            {language === 'hi' ? 'हम आपकी कैसे मदद कर सकते हैं?' : 'How can we help you?'}
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl mb-8">
                            {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न और सहायता संपर्क' : 'Search for answers or contact our support team.'}
                        </p>
                        <div className="relative max-w-xl mx-auto">
                            <input
                                type="text"
                                placeholder={language === 'hi' ? 'अपनी समस्या खोजें...' : 'Search for your issue...'}
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
                        <h3 className="text-xl font-bold mb-2">{language === 'hi' ? 'कॉल करें' : 'Call Us'}</h3>
                        <p className="text-gray-600 mb-4">{language === 'hi' ? 'सोम-शुक्र, सुबह 9 से शाम 6 बजे तक' : 'Mon-Fri, 9am to 6pm'}</p>
                        <a href="tel:+911234567890" className="text-blue-600 font-semibold hover:underline">+91 123 456 7890</a>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{language === 'hi' ? 'चैट करें' : 'Chat Support'}</h3>
                        <p className="text-gray-600 mb-4">{language === 'hi' ? 'तुरंत सहायता के लिए चैट करें' : 'Chat with us for instant help'}</p>
                        <button className="text-green-600 font-semibold hover:underline">{language === 'hi' ? 'चैट शुरू करें' : 'Start Chat'}</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{language === 'hi' ? 'ईमेल करें' : 'Email Us'}</h3>
                        <p className="text-gray-600 mb-4">{language === 'hi' ? 'हम 24 घंटे के भीतर जवाब देंगे' : 'We will reply within 24 hours'}</p>
                        <a href="mailto:support@digitalhazri.com" className="text-purple-600 font-semibold hover:underline">support@digitalhazri.com</a>
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-4 py-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                        {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
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
                            {language === 'hi' ? 'संपर्क करें' : 'Get in Touch'}
                        </h2>
                        <p className="text-center text-gray-600 mb-8">{language === 'hi' ? 'हमें अपनी समस्या बताएं' : 'Leave us a message and we will get back to you.'}</p>

                        <form className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-inner border border-gray-100" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">{language === 'hi' ? 'नाम' : 'Name'}</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">{language === 'hi' ? 'ईमेल' : 'Email'}</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{language === 'hi' ? 'संदेश' : 'Message'}</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder={language === 'hi' ? 'आपकी समस्या...' : 'Describe your issue...'}></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                {language === 'hi' ? 'भेजें' : 'Send Message'}
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
