'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact({ language }) {
    const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
    const [showMap, setShowMap] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(language === 'en' ? 'Thank you for your message! We will get back to you soon.' : '感謝您的留言！我們會盡快回覆您。');
        setFormData({ name: '', email: '', company: '', message: '' });
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const openGoogleMaps = () => {
        const address = '70441 台南市北區開元路442巷26弄2號';
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const openGmail = () => {
        const email = 'swisys.service@gmail.com';
        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
        window.open(url, '_blank');
    };

    const toggleMap = () => setShowMap(!showMap);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(https://images.pexels.com/photos/3862347/pexels-photo-3862347.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                        {language === 'en' ? 'Contact Us' : '聯絡我們'}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                        {language === 'en'
                            ? "Ready to transform your automotive communication needs? Let's start the conversation."
                            : '準備好改變您的車用通訊需求了嗎？讓我們開始交流。'}
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage:
                            'url(https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/50">
                            <h2 className="text-4xl font-bold text-gray-900 mb-8">
                                {language === 'en' ? 'Get in Touch' : '聯絡我們'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {['name', 'email', 'company'].map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            {language === 'en' ? field.charAt(0).toUpperCase() + field.slice(1) : field === 'email' ? '郵箱 *' : field === 'name' ? '姓名 *' : '公司'}
                                        </label>
                                        <input
                                            type={field === 'email' ? 'email' : 'text'}
                                            name={field}
                                            required={field !== 'company'}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        {language === 'en' ? 'Message *' : '留言 *'}
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    {language === 'en' ? 'Send Message' : '發送訊息'}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/50">
                            <h3 className="text-3xl font-bold text-gray-900 mb-10">
                                {language === 'en' ? 'Contact Information' : '聯絡資訊'}
                            </h3>
                            <div className="space-y-8">
                                {/* Phone */}
                                <div className="flex items-start group">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Phone className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {language === 'en' ? 'Phone' : '電話'}
                                        </h4>
                                        <p className="text-gray-600 text-lg">+886 6 200 6070</p>
                                    </div>
                                </div>

                                {/* Email (Clickable Gmail) */}
                                <div
                                    className="flex items-start group cursor-pointer"
                                    onClick={openGmail}
                                >
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Mail className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {language === 'en' ? 'Email' : '郵箱'}
                                        </h4>
                                        <p className="text-gray-600 text-lg">swisys.service@gmail.com</p>
                                        <p className="text-purple-600 text-sm mt-2 flex items-center">
                                            ✉️ {language === 'en' ? 'Click to open in Gmail' : '點擊在 Gmail 中開啟'}
                                        </p>
                                    </div>
                                </div>

                                {/* Address (Toggle Map) */}
                                <div
                                    className="flex items-start group cursor-pointer"
                                    onClick={toggleMap}
                                >
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {language === 'en' ? 'Address' : '地址'}
                                        </h4>
                                        <p className="text-gray-600 text-lg">
                                            {language === 'en'
                                                ? 'No. 2號, Alley 26, Lane 442, Kaiyuan Rd, North District, Tainan City, 70441'
                                                : '70441 台南市北區開元路442巷26弄2號'}
                                        </p>
                                        <p className="text-green-600 text-sm mt-2 flex items-center">
                                            📍 {language === 'en' ? 'Tap to view on map' : '點擊查看地圖'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Map Section */}
                            <div className={`mt-8 transition-all duration-500 ${showMap ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex justify-between items-center">
                                        <h4 className="font-bold text-lg">
                                            {language === 'en' ? 'Company Location' : '公司位置'}
                                        </h4>
                                        <button onClick={toggleMap} className="text-white hover:text-gray-200">
                                            ✕
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-700 mb-4">
                                            {language === 'en'
                                                ? 'No. 2號, Alley 26, Lane 442, Kaiyuan Rd, North District, Tainan City, 70441'
                                                : '70441 台南市北區開元路442巷26弄2號'}
                                        </p>
                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.123456789012!2d120.213318!3d23.012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAwJzQ0LjQiTiAxMjDCsDEyJzQ3LjkiRQ!5e0!3m2!1szh-TW!2stw!4v1234567890"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                title="Company Location"
                                            ></iframe>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={openGoogleMaps}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                                            >
                                                {language === 'en' ? 'Open in Google Maps' : '在 Google 地圖中開啟'}
                                            </button>
                                            <button
                                                onClick={toggleMap}
                                                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                                            >
                                                {language === 'en' ? 'Close' : '關閉'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-6 text-xl">
                                    {language === 'en' ? 'Business Hours (GMT+8)' : '營業時間 (GMT+8)'}
                                </h4>
                                <div className="space-y-3 text-gray-600 text-lg">
                                    <p>{language === 'en' ? 'Monday - Friday: 9:00 AM - 6:00 PM' : '週一至週五：9:00 - 18:00'}</p>
                                    <p>{language === 'en' ? 'Saturday: 9:00 AM - 12:00 PM' : '週六：9:00 - 12:00'}</p>
                                    <p>{language === 'en' ? 'Sunday: Closed' : '週日：休息'}</p>
                                </div>
                            </div>

                            {/* Support Section */}
                            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                                <h5 className="font-bold text-gray-900 mb-3">
                                    {language === 'en' ? 'Technical Support' : '技術支援'}
                                </h5>
                                <p className="text-gray-600">
                                    {language === 'en'
                                        ? 'For technical inquiries and product support, please include your product model and specific requirements.'
                                        : '如需技術諮詢與產品支援，請在訊息中附上產品型號與具體需求。'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
