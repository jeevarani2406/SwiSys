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
            descriptionEn: 'Leading university in Coimbatore established under Section 3 of UGC Act 1956, accredited with A+ Grade by NAAC. Prof. Jing-Jou Tang delivered an inspiring speech on Recent Trends in Vehicle Electronics during the Freshers\' Program inauguration on 24 October 2019.',
            descriptionZh: '哥印拜陀的領先大學，根據 UGC 法案第 3 條成立，獲得 NAAC A+ 等級認證。唐敬柔教授於 2019 年 10 月 24 日在新生計劃開幕式上就車輛電子最新趨勢發表了鼓舞人心的演講。',
            images: [
                'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop'
            ],
            years: '2018-Present',
            projects: 12,
            testimonialEn: 'Prof. Jing-Jou Tang\'s lecture on Recent Trends in Vehicle Electronics provided valuable knowledge to our newly joined students, motivating them to explore automotive technologies and emphasizing continuous learning and innovation.',
            testimonialZh: '唐敬柔教授關於車輛電子最新趨勢的講座為我們的新生提供了寶貴的知識，激勵他們探索汽車技術，並強調持續學習和創新。',
            testimonialAuthor: 'Dr. Rajesh Kumar, Head of Electronics Department',
            specialEvent: {
                date: '24 October 2019',
                guest: 'Prof. Jing-Jou Tang from Southern Taiwan University of Science and Technology, Taiwan',
                event: 'Inauguration Day of the Freshers\' Program',
                topicEn: 'Recent Trends in Vehicle Electronics with emphasis on CAN Bus, LIN Bus, OBDII, and SAE J1939',
                topicZh: '車輛電子最新趨勢，重點介紹 CAN 總線、LIN 總線、OBDII 和 SAE J1939',
                focusEn: [
                    'CAN Bus communication protocols',
                    'LIN Bus implementation',
                    'OBDII diagnostic systems', 
                    'SAE J1939 standards',
                    'Automotive embedded systems',
                    'Industry-oriented research'
                ],
                focusZh: [
                    'CAN 總線通信協議',
                    'LIN 總線實施',
                    'OBDII 診斷系統',
                    'SAE J1939 標準',
                    '汽車嵌入式系統',
                    '行業導向研究'
                ]
            }
        },
        {
            id: 2,
            name: 'College of Engineering, Guindy',
            shortName: 'CEG Campus, Anna University',
            location: 'Chennai',
            descriptionEn: 'One of the oldest engineering colleges in India with strong automotive engineering programs. Prof. Jing-Jou Tang delivered a comprehensive lecture on vehicle electronics to students and faculty members on 22 October 2019.',
            descriptionZh: '印度最古老的工程學院之一，擁有強大的汽車工程項目。唐敬柔教授於 2019 年 10 月 22 日向師生就車輛電子學進行了全面講座。',
            images: [
                'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=600&fit=crop'
            ],
            years: '2019-Present',
            projects: 8,
            testimonialEn: 'Prof. Jing-Jou Tang\'s session on Recent Trends in Vehicle Electronics provided valuable insights into advanced automotive communication standards and their applications in vehicle diagnostics and intelligent transportation systems.',
            testimonialZh: '唐敬柔教授關於車輛電子最新趨勢的講座為先進汽車通信標準及其在車輛診斷和智能交通系統中的應用提供了寶貴的見解。',
            testimonialAuthor: 'Prof. Sanjay Patel, Automotive Engineering',
            specialEvent: {
                date: '22 October 2019',
                guest: 'Prof. Jing-Jou Tang from Southern Taiwan University of Science and Technology, Taiwan',
                event: 'Technical Lecture for Electronics and Communication Engineering Department',
                topicEn: 'Recent Trends in Vehicle Electronics focusing on CAN Bus, LIN Bus, OBDII, and SAE J1939',
                topicZh: '車輛電子最新趨勢，重點關注 CAN 總線、LIN 總線、OBDII 和 SAE J1939',
                focusEn: [
                    'Advanced automotive communication standards',
                    'Vehicle diagnostics applications',
                    'Intelligent transportation systems',
                    'CAN Bus protocols',
                    'LIN Bus systems',
                    'Industry-academia collaboration'
                ],
                focusZh: [
                    '先進汽車通信標準',
                    '車輛診斷應用',
                    '智能交通系統',
                    'CAN 總線協議',
                    'LIN 總線系統',
                    '產學合作'
                ]
            }
        },
        {
            id: 3,
            name: 'Madras Institute of Technology',
            shortName: 'MIT Campus, Anna University',
            location: 'Chennai',
            descriptionEn: 'Premier institute for technology education with focus on automotive electronics and embedded systems. Prof. Jing-Jou Tang conducted a detailed seminar bridging electronics and automotive engineering disciplines on 23 October 2019.',
            descriptionZh: '技術教育的頂尖機構，專注於汽車電子和嵌入式系統。唐敬柔教授於 2019 年 10 月 23 日舉辦了詳細的研討會，連接電子與汽車工程學科。',
            images: [
                'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop'
            ],
            years: '2020-Present',
            projects: 6,
            testimonialEn: 'Prof. Jing-Jou Tang\'s detailed seminar on Recent Trends in Vehicle Electronics effectively bridged knowledge between electronics and automotive engineering disciplines, highlighting industrial applications of CAN Bus, LIN Bus, OBDII, and SAE J1939 protocols.',
            testimonialZh: '唐敬柔教授關於車輛電子最新趨勢的詳細研討會有效地連接了電子與汽車工程學科之間的知識，突出了 CAN 總線、LIN 總線、OBDII 和 SAE J1939 協議的工業應用。',
            testimonialAuthor: 'Dr. Priya Sharma, Embedded Systems Department',
            specialEvent: {
                date: '23 October 2019',
                guest: 'Prof. Jing-Jou Tang from Southern Taiwan University of Science and Technology, Taiwan',
                event: 'Technical Seminar for Electronics and Automobile Engineering Departments',
                topicEn: 'Recent Trends in Vehicle Electronics based on CAN Bus, LIN Bus, OBDII, and SAE J1939',
                topicZh: '基於 CAN 總線、LIN 總線、OBDII 和 SAE J1939 的車輛電子最新趨勢',
                focusEn: [
                    'Electronics and automotive engineering integration',
                    'Industrial applications of protocols',
                    'CAN Bus systems',
                    'LIN Bus implementations',
                    'OBDII diagnostics',
                    'SAE J1939 standards'
                ],
                focusZh: [
                    '電子與汽車工程整合',
                    '協議的工業應用',
                    'CAN 總線系統',
                    'LIN 總線實施',
                    'OBDII 診斷',
                    'SAE J1939 標準'
                ]
            }
        },
        {
            id: 4,
            name: 'Indian Institute of Technology Madras',
            shortName: 'IIT Madras',
            location: 'Chennai',
            descriptionEn: 'Premier technical institute with advanced research in automotive design and engineering. Our partnership focuses on cutting-edge automotive communication technologies.',
            descriptionZh: '頂尖技術機構，在汽車設計和工程方面進行先進研究。我們的合作專注於尖端汽車通信技術。',
            images: [
                'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop'
            ],
            years: '2021-Present',
            projects: 5,
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
            images: [
                'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=600&fit=crop'
            ],
            years: '2019-Present',
            projects: 7,
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
            images: [
                'https://images.unsplash.com/photo-1593941707882-a5bba5331b2a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop'
            ],
            years: '2017-Present',
            projects: 15,
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

    const currentItem = selectedCollege || selectedIndustry;

    return (
        <div className="bg-white">
            {/* Header Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&h=1080&fit=crop)' }}>
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
                                        <div className="lg:col-span-3">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                                <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                                                {language === 'en' ? 'Partnership Overview' : '合作概覽'}
                                            </h3>
                                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                                {language === 'en' ? currentItem.descriptionEn : currentItem.descriptionZh}
                                            </p>

                                            {/* Special Event Section for Academy Partners */}
                                            {selectedCollege && currentItem.specialEvent && (
                                                <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-200">
                                                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                                        <Award className="h-5 w-5 mr-2 text-purple-600" />
                                                        {language === 'en' ? 'Special Collaboration Event' : '特別合作活動'}
                                                    </h4>
                                                    <div className="space-y-4">
                                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                            <div className="bg-white p-4 rounded-xl border border-purple-100">
                                                                <div className="font-semibold text-purple-700 mb-1">
                                                                    {language === 'en' ? 'Event Date' : '活動日期'}
                                                                </div>
                                                                <div className="text-gray-700">{currentItem.specialEvent.date}</div>
                                                            </div>
                                                            <div className="bg-white p-4 rounded-xl border border-purple-100">
                                                                <div className="font-semibold text-purple-700 mb-1">
                                                                    {language === 'en' ? 'Distinguished Guest' : '特邀嘉賓'}
                                                                </div>
                                                                <div className="text-gray-700">{currentItem.specialEvent.guest}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-white p-4 rounded-xl border border-purple-100">
                                                            <div className="font-semibold text-purple-700 mb-2">
                                                                {language === 'en' ? 'Event Details' : '活動詳情'}
                                                            </div>
                                                            <p className="text-gray-700 mb-3">
                                                                <strong>{currentItem.specialEvent.event}</strong> - {language === 'en' ? currentItem.specialEvent.topicEn : currentItem.specialEvent.topicZh}
                                                            </p>
                                                            
                                                            <div className="mt-3">
                                                                <div className="font-semibold text-purple-700 mb-2">
                                                                    {language === 'en' ? 'Key Focus Areas' : '重點關注領域'}
                                                                </div>
                                                                <div className="grid md:grid-cols-2 gap-2">
                                                                    {(language === 'en' ? currentItem.specialEvent.focusEn : currentItem.specialEvent.focusZh).map((item, index) => (
                                                                        <div key={index} className="flex items-center text-sm">
                                                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                                                            <span className="text-gray-700">{item}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

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