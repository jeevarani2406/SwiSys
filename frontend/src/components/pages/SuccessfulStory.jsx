'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Building, MapPin, Users, BookOpen, Award, Calendar, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function SuccessfulStory({ language }) {
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [activeTab, setActiveTab] = useState('academy');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const academyPartners = [
        {
            id: 1,
            name: 'Karpagam Academy of Higher Education',
            shortName: 'Karpagam University',
            location: 'Coimbatore',
            descriptionEn: 'Leading university in Coimbatore known for its engineering and technology programs. We have collaborated on multiple automotive electronics research projects that have revolutionized vehicle communication systems.',
            descriptionZh: '哥印拜陀的領先大學，以其工程和技術項目聞名。我們在多個汽車電子研究項目上進行了合作，這些項目徹底改變了車輛通信系統。',
            collaborationEn: [
                'CAN Bus protocol research and development',
                'Automotive embedded systems training',
                'Joint workshops and seminars',
                'Student internship programs',
                'Research paper publications',
                'Prototype development'
            ],
            collaborationZh: [
                'CAN 總線協議研究與開發',
                '汽車嵌入式系統培訓',
                '聯合工作坊和研討會',
                '學生實習計劃',
                '研究論文發表',
                '原型開發'
            ],
            images: [
                'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/159775/library-la-trobe-study-students-159775.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/137618/pexels-photo-137618.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            achievements: [
                { labelEn: 'Research Papers', labelZh: '研究論文', value: '15+', icon: BookOpen },
                { labelEn: 'Student Training', labelZh: '學生培訓', value: '200+', icon: Users },
                { labelEn: 'Joint Projects', labelZh: '合作項目', value: '12', icon: Award },
                { labelEn: 'Duration', labelZh: '合作時長', value: '6 Years', icon: Calendar }
            ],
            years: '2018-Present',
            projects: 12,
            rating: 4.8,
            testimonialEn: 'The collaboration with SwiSys has significantly enhanced our automotive electronics curriculum and provided students with real-world industry experience.',
            testimonialZh: '與 SwiSys 的合作顯著提升了我們的汽車電子課程，並為學生提供了真實的行業經驗。',
            testimonialAuthor: 'Dr. Rajesh Kumar, Head of Electronics Department'
        },
        {
            id: 2,
            name: 'College of Engineering, Guindy',
            shortName: 'CEG Campus, Anna University',
            location: 'Chennai',
            descriptionEn: 'One of the oldest engineering colleges in India with strong automotive engineering programs. Our partnership focuses on advanced vehicle communication systems and next-generation automotive technologies.',
            descriptionZh: '印度最古老的工程學院之一，擁有強大的汽車工程項目。我們的合作專注於先進車輛通信系統和下一代汽車技術。',
            collaborationEn: [
                'Vehicle-to-Everything (V2X) communication research',
                'OBD-II protocol optimization',
                'Real-time data acquisition systems',
                'Industry-academia knowledge exchange',
                'Advanced driver assistance systems',
                'Electric vehicle protocols'
            ],
            collaborationZh: [
                '車聯網通信研究',
                'OBD-II 協議優化',
                '實時數據採集系統',
                '產業學術知識交流',
                '先進駕駛輔助系統',
                '電動汽車協議'
            ],
            images: [
                'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/7095/people-coffee-notes-tea.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            achievements: [
                { labelEn: 'Research Papers', labelZh: '研究論文', value: '22+', icon: BookOpen },
                { labelEn: 'Student Training', labelZh: '學生培訓', value: '350+', icon: Users },
                { labelEn: 'Joint Projects', labelZh: '合作項目', value: '8', icon: Award },
                { labelEn: 'Duration', labelZh: '合作時長', value: '5 Years', icon: Calendar }
            ],
            years: '2019-Present',
            projects: 8,
            rating: 4.9,
            testimonialEn: 'SwiSys expertise in automotive communication protocols has been invaluable for our research in intelligent transportation systems.',
            testimonialZh: 'SwiSys 在汽車通信協議方面的專業知識對我們在智能交通系統方面的研究非常寶貴。',
            testimonialAuthor: 'Prof. Sanjay Patel, Automotive Engineering'
        },
        {
            id: 3,
            name: 'Madras Institute of Technology',
            shortName: 'MIT Campus, Anna University',
            location: 'Chennai',
            descriptionEn: 'Premier institute for technology education with focus on automotive electronics and embedded systems. Our collaboration has produced several innovative solutions for the automotive industry.',
            descriptionZh: '技術教育的頂尖機構，專注於汽車電子和嵌入式系統。我們的合作為汽車行業產生了多個創新解決方案。',
            collaborationEn: [
                'Embedded systems development',
                'CAN FD protocol implementation',
                'Automotive cybersecurity research',
                'Hardware-in-loop testing',
                'Sensor integration',
                'Firmware development'
            ],
            collaborationZh: [
                '嵌入式系統開發',
                'CAN FD 協議實施',
                '汽車網絡安全研究',
                '硬體在環測試',
                '傳感器集成',
                '固件開發'
            ],
            images: [
                'https://images.pexels.com/photos/159775/library-la-trobe-study-students-159775.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181403/pexels-photo-1181403.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            achievements: [
                { labelEn: 'Research Papers', labelZh: '研究論文', value: '18+', icon: BookOpen },
                { labelEn: 'Student Training', labelZh: '學生培訓', value: '280+', icon: Users },
                { labelEn: 'Joint Projects', labelZh: '合作項目', value: '6', icon: Award },
                { labelEn: 'Duration', labelZh: '合作時長', value: '4 Years', icon: Calendar }
            ],
            years: '2020-Present',
            projects: 6,
            rating: 4.7,
            testimonialEn: 'The hands-on experience with SwiSys CAN Bus solutions has greatly benefited our students career prospects in automotive electronics.',
            testimonialZh: '使用 SwiSys CAN 總線解決方案的實踐經驗極大地受益於我們學生在汽車電子領域的職業前景。',
            testimonialAuthor: 'Dr. Priya Sharma, Embedded Systems Department'
        },
        {
            id: 4,
            name: 'Indian Institute of Technology Madras',
            shortName: 'IIT Madras',
            location: 'Chennai',
            descriptionEn: 'Premier technical institute with advanced research in automotive design and engineering. Our partnership focuses on cutting-edge automotive communication technologies.',
            descriptionZh: '頂尖技術機構，在汽車設計和工程方面進行先進研究。我們的合作專注於尖端汽車通信技術。',
            collaborationEn: [
                'Advanced driver assistance systems',
                'Electric vehicle communication protocols',
                'Sensor fusion algorithms',
                'Autonomous vehicle research',
                'V2X communication',
                'AI in automotive'
            ],
            collaborationZh: [
                '先進駕駛輔助系統',
                '電動汽車通信協議',
                '傳感器融合算法',
                '自動駕駛車輛研究',
                '車聯網通信',
                '汽車人工智能'
            ],
            images: [
                'https://images.pexels.com/photos/137618/pexels-photo-137618.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            achievements: [
                { labelEn: 'Research Papers', labelZh: '研究論文', value: '25+', icon: BookOpen },
                { labelEn: 'Student Training', labelZh: '學生培訓', value: '150+', icon: Users },
                { labelEn: 'Joint Projects', labelZh: '合作項目', value: '5', icon: Award },
                { labelEn: 'Duration', labelZh: '合作時長', value: '3 Years', icon: Calendar }
            ],
            years: '2021-Present',
            projects: 5,
            rating: 4.9,
            testimonialEn: 'SwiSys has been an excellent industry partner, bringing practical automotive communication expertise to our advanced research projects.',
            testimonialZh: 'SwiSys 一直是一個優秀的行業合作夥伴，為我們的高級研究項目帶來了實用的汽車通信專業知識。',
            testimonialAuthor: 'Prof. Arjun Mehta, Engineering Design'
        },
        {
            id: 5,
            name: 'Vel Tech Rangarajan Dr. Sagunthala R&D Institute',
            shortName: 'Vel Tech University',
            location: 'Chennai',
            descriptionEn: 'Innovative university with strong focus on research and development in automotive technologies. Our collaboration has resulted in several patented technologies.',
            descriptionZh: '創新大學，專注於汽車技術的研發。我們的合作產生了多項專利技術。',
            collaborationEn: [
                'IoT in automotive applications',
                'Wireless communication protocols',
                'Smart vehicle systems',
                'Prototype development',
                'Patent filings',
                'Technology transfer'
            ],
            collaborationZh: [
                '汽車應用中的物聯網',
                '無線通信協議',
                '智能車輛系統',
                '原型開發',
                '專利申請',
                '技術轉移'
            ],
            images: [
                'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181403/pexels-photo-1181403.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            achievements: [
                { labelEn: 'Research Papers', labelZh: '研究論文', value: '20+', icon: BookOpen },
                { labelEn: 'Student Training', labelZh: '學生培訓', value: '320+', icon: Users },
                { labelEn: 'Joint Projects', labelZh: '合作項目', value: '7', icon: Award },
                { labelEn: 'Duration', labelZh: '合作時長', value: '5 Years', icon: Calendar }
            ],
            years: '2019-Present',
            projects: 7,
            rating: 4.6,
            testimonialEn: 'The industry-academia collaboration with SwiSys has accelerated our research in connected vehicle technologies.',
            testimonialZh: '與 SwiSys 的產學合作加速了我們在連接車輛技術方面的研究。',
            testimonialAuthor: 'Dr. Suresh Reddy, R&D Head'
        }
    ];

    const industryPartners = [
        {
            id: 1,
            name: 'TATA Motors',
            location: 'Multiple Locations',
            descriptionEn: 'Leading automotive manufacturer collaborating on advanced vehicle communication systems and telematics solutions.',
            descriptionZh: '領先的汽車製造商，在先進車輛通信系統和遠程信息處理解決方案方面進行合作。',
            collaborationEn: [
                'Commercial vehicle telematics',
                'Fleet management solutions',
                'Diagnostic system integration',
                'Aftermarket support systems',
                'Real-time monitoring',
                'Predictive maintenance'
            ],
            collaborationZh: [
                '商用車輛遠程信息處理',
                '車隊管理解決方案',
                '診斷系統集成',
                '售後支持系統',
                '實時監控',
                '預測性維護'
            ],
            images: [
                'https://images.pexels.com/photos/120977/pexels-photo-120977.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/2526128/pexels-photo-2526128.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            achievements: [
                { labelEn: 'Deployed Systems', labelZh: '部署系統', value: '5000+', icon: Award },
                { labelEn: 'Fleet Size', labelZh: '車隊規模', value: '50K+', icon: Users },
                { labelEn: 'Joint Projects', labelZh: '合作項目', value: '15', icon: BookOpen },
                { labelEn: 'Duration', labelZh: '合作時長', value: '7 Years', icon: Calendar }
            ],
            years: '2017-Present',
            projects: 15,
            rating: 4.8,
            testimonialEn: 'SwiSys solutions have significantly improved our vehicle communication reliability and diagnostic capabilities.',
            testimonialZh: 'SwiSys 解決方案顯著提高了我們的車輛通信可靠性和診斷能力。',
            testimonialAuthor: 'Mr. Vikram Singh, Head of Telematics'
        }
    ];

    const openDetail = (item, type) => {
        setSelectedCollege(type === 'academy' ? item : null);
        setSelectedIndustry(type === 'industry' ? item : null);
        setCurrentImageIndex(0);
    };

    const closeDetail = () => {
        setSelectedCollege(null);
        setSelectedIndustry(null);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        const item = selectedCollege || selectedIndustry;
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    };

    const prevImage = () => {
        const item = selectedCollege || selectedIndustry;
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    const currentItem = selectedCollege || selectedIndustry;

    return (
        <div className="bg-white">
            {/* Header Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.pexels.com/photos/3862347/pexels-photo-3862347.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                        {language === 'en' ? 'Successful Story' : '成功案例'}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                        {language === 'en' 
                            ? 'Collaborating with leading academic institutions and industry partners to drive innovation in automotive communication systems'
                            : '與領先的學術機構和行業合作夥伴合作，推動汽車通信系統的創新'}
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
                            <button
                                onClick={() => setActiveTab('academy')}
                                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                                    activeTab === 'academy'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5" />
                                    {language === 'en' ? 'Academy Partners' : '學術合作夥伴'}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('industry')}
                                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                                    activeTab === 'industry'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Building className="h-5 w-5" />
                                    {language === 'en' ? 'Industry Partners' : '行業合作夥伴'}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Academy Partners Grid */}
                    {activeTab === 'academy' && (
                        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {academyPartners.map((college) => (
                                <div
                                    key={college.id}
                                    onClick={() => openDetail(college, 'academy')}
                                    className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/50 group"
                                >
                                    <div className="relative">
                                        <img
                                            src={college.images[0]}
                                            alt={college.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <span className="text-white text-sm font-semibold">
                                                {language === 'en' ? 'Click for details' : '點擊查看詳情'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{college.name}</h3>
                                                <p className="text-gray-600 text-sm mt-1 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {college.location}
                                                </p>
                                            </div>
                                            <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                                <span className="text-xs font-semibold text-blue-700">{college.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {language === 'en' ? college.descriptionEn : college.descriptionZh}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center">
                                                <Users className="h-3 w-3 mr-1" />
                                                {college.projects} {language === 'en' ? 'Projects' : '項目'}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {college.years}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Industry Partners Grid */}
                    {activeTab === 'industry' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {industryPartners.map((company) => (
                                <div
                                    key={company.id}
                                    onClick={() => openDetail(company, 'industry')}
                                    className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/50 group"
                                >
                                    <div className="relative">
                                        <img
                                            src={company.images[0]}
                                            alt={company.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <span className="text-white text-sm font-semibold">
                                                {language === 'en' ? 'Click for details' : '點擊查看詳情'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                                                <p className="text-gray-600 text-sm mt-1 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {company.location}
                                                </p>
                                            </div>
                                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                                <span className="text-xs font-semibold text-green-700">{company.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {language === 'en' ? company.descriptionEn : company.descriptionZh}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center">
                                                <Users className="h-3 w-3 mr-1" />
                                                {company.projects} {language === 'en' ? 'Projects' : '項目'}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {company.years}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Enhanced Detail Modal */}
                    {currentItem && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                                {/* Header */}
                                <div className={`p-8 text-white ${selectedCollege ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-white/20 p-3 rounded-xl">
                                                {selectedCollege ? <GraduationCap className="h-8 w-8" /> : <Building className="h-8 w-8" />}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold mb-2">{currentItem.name}</h2>
                                                <p className="text-xl opacity-90 mb-1">{currentItem.shortName}</p>
                                                <p className="opacity-90 flex items-center">
                                                    <MapPin className="h-5 w-5 mr-2" />
                                                    {currentItem.location}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={closeDetail}
                                            className="text-white hover:text-gray-200 transition-colors p-2 rounded-full bg-white/20 hover:bg-white/30"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Image Gallery */}
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img
                                            src={currentItem.images[currentImageIndex]}
                                            alt={currentItem.name}
                                            className="w-full h-80 object-cover"
                                        />
                                        {currentItem.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </button>
                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                    {currentItem.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <div className="grid lg:grid-cols-3 gap-8">
                                        {/* Main Description */}
                                        <div className="lg:col-span-2">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                                <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                                                {language === 'en' ? 'Partnership Overview' : '合作概覽'}
                                            </h3>
                                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                                {language === 'en' ? currentItem.descriptionEn : currentItem.descriptionZh}
                                            </p>

                                            {/* Collaboration Areas */}
                                            <div className="mb-8">
                                                <h4 className="text-xl font-bold text-gray-900 mb-4">
                                                    {language === 'en' ? 'Collaboration Areas' : '合作領域'}
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {(language === 'en' ? currentItem.collaborationEn : currentItem.collaborationZh).map((item, index) => (
                                                        <div key={index} className="flex items-center bg-gray-50 p-4 rounded-xl">
                                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Testimonial */}
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                                                <div className="flex items-start">
                                                    <div className="text-blue-600 mr-4">
                                                        <span className="text-4xl">"</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700 text-lg italic mb-4">
                                                            {language === 'en' ? currentItem.testimonialEn : currentItem.testimonialZh}
                                                        </p>
                                                        <p className="text-gray-600 font-semibold">{currentItem.testimonialAuthor}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Achievements Sidebar */}
                                        <div className="space-y-6">
                                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                                    {language === 'en' ? 'Achievements' : '合作成果'}
                                                </h4>
                                                <div className="space-y-4">
                                                    {currentItem.achievements.map((achievement, index) => (
                                                        <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                            <achievement.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                                            <div className="text-2xl font-bold text-gray-900 mb-1">{achievement.value}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {language === 'en' ? achievement.labelEn : achievement.labelZh}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                                                <div className="flex justify-center mb-2">
                                                    {renderStars(currentItem.rating)}
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">{currentItem.rating}/5.0</div>
                                                <div className="text-sm text-gray-600">
                                                    {language === 'en' ? 'Partnership Rating' : '合作評分'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-20 text-center bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/50">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            {language === 'en' ? 'Ready to Collaborate?' : '準備好合作了嗎？'}
                        </h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
                            {language === 'en' 
                                ? 'Join our network of academic and industry partners to drive innovation in automotive communication systems.'
                                : '加入我們的學術和行業合作夥伴網絡，共同推動汽車通信系統的創新。'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/contact" 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                            >
                                {language === 'en' ? 'Start Collaboration' : '開始合作'}
                            </Link>
                            <Link 
                                href="/solutions" 
                                className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 text-center"
                            >
                                {language === 'en' ? 'View Solutions' : '查看解決方案'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}