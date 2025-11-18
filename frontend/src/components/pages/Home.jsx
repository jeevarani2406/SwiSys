'use client';

import React from "react";
import Link from "next/link";
import { Car, Settings, Shield, Wifi, Target, Zap, Cloud, Play } from "lucide-react";

export default function Home({ language }) {
    // Video files array (titles, descriptions, icons removed)
    const videos = [
        {
            link: 'https://swisystem.com/wp-content/uploads/2020/06/Nissan-Car-Door-lock-and-unlock-using-SWISYS-OBDII-Bridge..mp4'
        },
        {
            link: 'https://swisystem.com/wp-content/uploads/2020/06/OBDII-2.mp4'
        },
        {
            link: 'https://swisystem.com/wp-content/uploads/2020/09/SWISYS-OBDII-Bridge-with-GARMIN-VIRB-360-1.mp4,'
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            "url(https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-blue-800/90" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="animate-fade-in">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                            {language === "en" ? "Automotive Electronics" : "汽車電子"}
                            <span className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                                {language === "en"
                                    ? "Communication Solutions"
                                    : "通信解決方案"}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
                            {language === "en"
                                ? "Leading CAN Bus, OBD II, and SAE J1939 solutions for In-Vehicle Networking (IVN). Bridging automotive communication with IoT innovation."
                                : "領先的 CAN 總線、OBD II 與 SAE J1939 車載網路 (IVN) 解決方案，銜接汽車通訊與物聯網創新。"}
                        </p>

                        <div className="space-x-4 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/solutions"
                                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-center"
                            >
                                {language === "en" ? "Explore Solutions" : "探索解決方案"}
                            </Link>

                            <Link
                                href="/contact"
                                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-center"
                            >
                                {language === "en" ? "Get Started" : "開始合作"}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl animate-pulse delay-500" />
            </section>

            {/* Core Technologies */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "url(https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            {language === "en" ? "Core Technologies" : "核心技術"}
                        </h2>

                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {language === "en"
                                ? "Specialized in automotive communication protocols with over 5+ years of CAN Bus expertise"
                                : "專注汽車通訊協定，擁有超過 5 年 CAN 總線專業經驗"}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[ 
                            {
                                icon: Car,
                                title: "CAN Bus",
                                color: "from-purple-500 to-blue-600",
                                descEn:
                                    "Controller Area Network solutions with ISO 11898-2 compliance for reliable vehicle communication",
                                descZh:
                                    "符合 ISO 11898-2 標準的控制器區域網路方案，確保可靠車輛通訊",
                            },
                            {
                                icon: Settings,
                                title: "OBD II",
                                color: "from-purple-500 to-blue-600",
                                descEn:
                                    "On-Board Diagnostics for light-duty vehicles with comprehensive data access and analysis",
                                descZh: "輕型車輛車載診斷系統，提供全面數據存取與分析",
                            },
                            {
                                icon: Shield,
                                title: "SAE J1939",
                                color: "from-purple-500 to-blue-600",
                                descEn:
                                    "Heavy-duty vehicle communication protocol for commercial and industrial applications",
                                descZh: "重型車輛通訊協定，適用商用與工業應用",
                            },
                            {
                                icon: Wifi,
                                title: "IVN",
                                color: "from-purple-500 to-blue-600",
                                descEn:
                                    "In-Vehicle Networking solutions bridging internal systems with external IoT platforms",
                                descZh: "車載網路方案，連結內部系統與外部物聯網平台",
                            },
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50"
                            >
                                <div
                                    className={`bg-gradient-to-br ${card.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <card.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {language === "en" ? card.descEn : card.descZh}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Applications */}
            <section className="py-20 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url(https://images.pexels.com/photos/3862347/pexels-photo-3862347.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-purple-900/95" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {language === "en" ? "Applications" : "應用領域"}
                        </h2>

                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            {language === "en"
                                ? "Versatile solutions for automotive diagnostics, fleet management, and IoT integration"
                                : "適用於汽車診斷、車隊管理與物聯網整合的多功能解決方案"}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[ 
                            {
                                icon: Car,
                                titleEn: "Fleet Management",
                                titleZh: "車隊管理",
                                descEn:
                                    "Real-time vehicle monitoring and data analytics for fleet optimization",
                                descZh: "即時車輛監控與資料分析以優化車隊管理",
                            },
                            {
                                icon: Shield,
                                titleEn: "Vehicle Diagnostics",
                                titleZh: "車輛診斷",
                                descEn:
                                    "Comprehensive diagnostic solutions for maintenance and service applications",
                                descZh: "完整診斷方案，適用維修與服務應用",
                            },
                            {
                                icon: Target,
                                titleEn: "Usage-Based Insurance",
                                titleZh: "UBI 保險",
                                descEn:
                                    "Driver behavior analysis and vehicle condition monitoring for UBI systems",
                                descZh: "駕駛行為分析與車況監控，適用 UBI 系統",
                            },
                            {
                                icon: Settings,
                                titleEn: "HUD Systems",
                                titleZh: "HUD 系統",
                                descEn:
                                    "Head-up display integration with real-time vehicle data visualization",
                                descZh: "抬頭顯示器整合，即時車輛資料視覺化",
                            },
                            {
                                icon: Cloud,
                                titleEn: "IoT Gateway",
                                titleZh: "物聯網網關",
                                descEn:
                                    "Bridge between vehicle networks and cloud-based IoT platforms",
                                descZh: "連結車輛網路與雲端 IoT 平台的橋樑",
                            },
                            {
                                icon: Zap,
                                titleEn: "Performance Monitoring",
                                titleZh: "性能監控",
                                descEn:
                                    "Engine performance logging and real-time vehicle health monitoring",
                                descZh: "引擎性能紀錄與即時車輛健康監控",
                            },
                        ].map((app, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                            >
                                <div className="bg-gradient-to-br from-blue-400 to-purple-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                    <app.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {language === "en" ? app.titleEn : app.titleZh}
                                </h3>
                                <p className="text-blue-100 leading-relaxed">
                                    {language === "en" ? app.descEn : app.descZh}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Demo Videos */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "url(https://i.pinimg.com/originals/d7/79/3d/d7793d5c497abcab0da1f34fc56c943d.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        {language === "en" ? "Product Demo Videos" : "產品示範影片"}
                    </h2>

                    <p className="text-lg text-gray-600 mb-12">
                        {language === "en"
                            ? "See our OBDII Bridge in action with real vehicle operations."
                            : "觀看我們的 OBDII Bridge 在實際車輛操作中的表現。"}
                    </p>

                    {/* Simplified video cards */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {videos.map((video, index) => {
                            // support both `src` and `link`, and strip trailing commas from URLs
                            const raw = (video.src ?? video.link ?? "");
                            const videoSrc = raw.replace(/,+$/,""); // remove trailing commas
                            return (
                                <div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden"
                                >
                                    <div className="relative aspect-video bg-black">
                                        {videoSrc ? (
                                            <video
                                                className="w-full h-full object-cover"
                                                controls
                                                // preload="metadata"
                                                // poster={video.poster} // keep if poster exists
                                            >
                                                <source src={videoSrc} type="video/mp4" />
                                                {language === "en"
                                                    ? "Your browser does not support the video tag."
                                                    : "您的瀏覽器不支持視頻播放。"}
                                            </video>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                {language === "en"
                                                    ? "Video source missing"
                                                    : "影片來源遺失"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
                            <Play className="h-4 w-4" />
                            {language === "en"
                                ? "Click on videos to play and see our technology in action"
                                : "點擊視頻播放，觀看我們的技術實際應用"}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
