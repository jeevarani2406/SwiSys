'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, Code, Cloud, Shield, CheckCircle } from 'lucide-react';

export default function Solutions({ language }) {
    return (
        <div className="bg-white">
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">{language === 'en' ? 'Our Solutions' : '我們的解決方案'}</h1>
                    <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">{language === 'en' ? 'Comprehensive automotive communication solutions with flexible command collections for various applications' : '提供全面的汽車通訊解決方案，支援各式應用場景與客製化命令集'}</p>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {[
                            { titleEn: 'OBD II to Bluetooth 4.x', titleZh: 'OBD II 轉藍牙 4.x', descEn: 'Wireless connectivity solution for light-duty vehicles with Bluetooth 4.x integration', descZh: '輕型車輛無線連接方案，整合藍牙 4.x', icon: Wifi, color: 'from-blue-500 to-blue-600', featuresEn: ['Real-time data streaming', 'Low power consumption', 'Mobile app integration', 'Diagnostic capabilities'], featuresZh: ['即時數據串流', '低功耗', '行動應用整合', '診斷功能'] },
                            { titleEn: 'OBD II to UART', titleZh: 'OBD II 轉 UART', descEn: 'Serial communication interface for direct integration with microcontrollers and embedded systems', descZh: '序列通訊介面，可直接整合微控制器與嵌入式系統', icon: Code, color: 'from-green-500 to-green-600', featuresEn: ['Direct MCU integration', 'High-speed data transfer', 'Custom protocol support', 'Industrial grade reliability'], featuresZh: ['直接 MCU 整合', '高速資料傳輸', '自訂協議支援', '工業級可靠性'] },
                            { titleEn: 'OBD II to 3G/4G', titleZh: 'OBD II 轉 3G/4G', descEn: 'Cellular connectivity for remote monitoring and cloud-based fleet management systems', descZh: '蜂巢式連接，適用於遠端監控與雲端車隊管理', icon: Cloud, color: 'from-purple-500 to-purple-600', featuresEn: ['Cloud connectivity', 'Remote monitoring', 'Fleet management', 'Global coverage'], featuresZh: ['雲端連接', '遠端監控', '車隊管理', '全球覆蓋'] },
                            { titleEn: 'J1939 Gateway Solutions', titleZh: 'J1939 網關方案', descEn: 'Heavy-duty vehicle communication bridge for commercial and industrial applications', descZh: '重型車輛通訊橋接，適用於商用與工業應用', icon: Shield, color: 'from-orange-500 to-orange-600', featuresEn: ['Heavy-duty vehicle support', 'Industrial protocols', 'Robust design', 'Multi-protocol support'], featuresZh: ['重型車輛支援', '工業協議', '堅固設計', '多協議支援'] },
                        ].map((solution, index) => (
                            <div key={index} className="group bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className={`bg-gradient-to-br ${solution.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <solution.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-6">{language === 'en' ? solution.titleEn : solution.titleZh}</h3>
                                <p className="text-gray-600 mb-8 text-lg leading-relaxed">{language === 'en' ? solution.descEn : solution.descZh}</p>
                                <ul className="space-y-3">
                                    {(language === 'en' ? solution.featuresEn : solution.featuresZh).map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-600">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/50">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">{language === 'en' ? 'Custom Solutions Available' : '提供客製化解決方案'}</h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">{language === 'en' ? 'We provide flexible command collections and customizable solutions for HUDs, engine performance logs, vehicle diagnosis, fleet management, and air pollution monitors.' : '我們提供 HUD、引擎性能記錄、車輛診斷、車隊管理與空氣污染監測等可客製化方案。'}</p>
                        <Link href="/contact" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center">
                            {language === 'en' ? 'Request Custom Solution' : '申請客製化方案'}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
