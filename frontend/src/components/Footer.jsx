import React from 'react';
import { Facebook, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function Footer({ language }) {
    // Product links mapping
    const productLinks = [
        { name: 'CS8959 EVB', nameZh: 'CS8959 評估板', href: '/solutions/can-bus-ecu/can-evb/CS8959' },
        { name: 'CS8972 EVB', nameZh: 'CS8972 評估板', href: '/solutions/can-bus-ecu/can-evb/cs8972' },
        { name: 'CS8961 ECU', nameZh: 'CS8961 評估板', href: '/solutions/can-bus-ecu/can-evb/cs8961' },
        { name: 'OBD Bridge', nameZh: 'OBD 橋接器', href: '/solutions/can-bus-ecu/obdii/obd-bridge' },
        { name: 'OBDII Recorder', nameZh: 'OBDII 記錄器', href: '/solutions/can-bus-ecu/obdii/obdii-recorder' },
        { name: 'J1939 Bridge', nameZh: 'J1939 橋接器', href: '/solutions/can-bus-ecu/j1939/j1939-bridge' },
        { name: 'J1939 Recorder', nameZh: 'J1939 記錄器', href: '/solutions/can-bus-ecu/j1939/j1939-recorder' },
        { name: 'CAN-CAN Converter', nameZh: 'CAN-CAN 轉換器', href: '/solutions/can-bus-ecu/can-gateway/can-to-can' },
        { name: 'CAN-UART Converter', nameZh: 'CAN-UART 轉換器', href: '/solutions/can-bus-ecu/can-gateway/can-to-uart' },
        { name: 'Contactless CAN Probe', nameZh: '非接觸式 CAN 探頭', href: '/solutions/can-bus-ecu/can-evb/CCP' },
        { name: 'CAN Signal Generator', nameZh: 'CAN 信號發生器', href: '/solutions/instruments/signal-generator/can' },
        { name: 'LIN Signal Generator', nameZh: 'LIN 信號發生器', href: '/solutions/instruments/signal-generator/lin' },
        { name: 'OBDII Signal Generator', nameZh: 'OBDII 信號發生器', href: '/solutions/instruments/signal-generator/obdii' },
        { name: 'J1939 Signal Generator', nameZh: 'J1939 信號發生器', href: '/solutions/instruments/signal-generator/j1939' },
        { name: 'Logic Analyzer', nameZh: '邏輯分析儀', href: '/solutions/instruments/logic-analyzer' },
        { name: 'Bus Expert II', nameZh: 'Bus Expert II', href: '/solutions/instruments/logic-analyzer/bus-expert-ii' },
    ];

    return (
        <footer className="relative bg-gray-900 text-white py-12 overflow-hidden">
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'url(https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content - Side by Side */}
                <div className="grid md:grid-cols-6 gap-6 mb-8">
                    {/* Company Info - 2 columns */}
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4">
                            <img
                                src="SWISYS-TRANSPARENT-WHITE-TEXT.png"
                                alt="SwiSys Logo"
                                className="h-8 w-auto mr-4"
                            />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            {language === 'en'
                                ? 'Leading automotive communication solutions with CAN Bus, OBD II, and SAE J1939 expertise. Bridging vehicles with IoT innovation.'
                                : '領先的汽車通信解決方案，擁有CAN總線、OBD II和SAE J1939專業技術。連接車輛與物聯網創新。'}
                        </p>
                        
                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-300">
                                <span className="mr-2">📞</span>
                                +886 6 200 6070
                            </div>
                            <div className="flex items-center text-gray-300">
                                <span className="mr-2">✉️</span>
                                swisys.service@gmail.com
                            </div>
                            <div className="flex items-center text-gray-300">
                                <span className="mr-2">📍</span>
                                {language === 'en' ? 'Tainan, Taiwan' : '台南，台灣'}
                            </div>
                        </div>
                    </div>

                    {/* Solutions - 1 column */}
                    <div>
                        <h4 className="font-bold mb-4 text-base">
                            {language === 'en' ? 'Solutions' : '解決方案'}
                        </h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="hover:text-blue-400 transition-colors">
                                    {language === 'en' ? 'Automotive MCU' : 'CAN總線'}
                            </li>
                            <li className="hover:text-blue-400 transition-colors">
                                    {language === 'en' ? 'CAN BUS ECU' : 'OBD II'}
                            </li>
                            <li className="hover:text-blue-400 transition-colors">
                                    {language === 'en' ? 'Instruments' : 'Instruments'}
                            </li>
                        </ul>
                    </div>

                    {/* Products - 1 column */}
                    <div>
                        <h4 className="font-bold mb-4 text-base">
                            {language === 'en' ? 'Products' : '產品'}
                        </h4>
                        <ul className="space-y-2 text-gray-300 text-sm max-h-40 overflow-y-auto pr-2">
                            {productLinks.slice(0, 7).map((product) => (
                                <li key={product.name} className="hover:text-blue-400 transition-colors">
                                    <Link href={product.href} className="block py-0.5">
                                        {language === 'en' ? product.name : product.nameZh}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* More Products - 1 column */}
                    <div>
                        <h4 className="font-bold mb-4 text-base">
                            {language === 'en' ? 'More Products' : '更多產品'}
                        </h4>
                        <ul className="space-y-2 text-gray-300 text-sm max-h-40 overflow-y-auto pr-2">
                            {productLinks.slice(7, 14).map((product) => (
                                <li key={product.name} className="hover:text-blue-400 transition-colors">
                                    <Link href={product.href} className="block py-0.5">
                                        {language === 'en' ? product.name : product.nameZh}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links - 1 column */}
                    <div>
                        <h4 className="font-bold mb-4 text-base">
                            {language === 'en' ? 'Quick Links' : '快速連結'}
                        </h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="hover:text-blue-400 transition-colors">
                                <Link href="/about">
                                    {language === 'en' ? 'About' : '關於我們'}
                                </Link>
                            </li>
                            <li className="hover:text-blue-400 transition-colors">
                                <Link href="/successful-story">
                                    {language === 'en' ? 'successful-story' : '成功故事'}
                                </Link>
                            </li>
                            <li className="hover:text-blue-400 transition-colors">
                                <Link href="/contact">
                                    {language === 'en' ? 'Contact' : '聯絡我們'}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 pt-6">
                    {/* Social Media Links */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <a
                            href="https://www.facebook.com/swisys.com.tw"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 rounded-full hover:scale-110 transition-transform duration-300 hover:bg-blue-700"
                            aria-label="Facebook"
                        >
                            <Facebook className="h-4 w-4 text-white" />
                        </a>
                        <a
                            href="https://x.com/SwiSys_TW"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-black rounded-full hover:scale-110 transition-transform duration-300 hover:bg-gray-800"
                            aria-label="Twitter"
                        >
                            <Twitter className="h-4 w-4 text-white" />
                        </a>
                        <a
                            href="https://www.youtube.com/channel/UCZMd6dN9HCQXlvnvi6aQdbA"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-red-600 rounded-full hover:scale-110 transition-transform duration-300 hover:bg-red-700"
                            aria-label="YouTube"
                        >
                            <Youtube className="h-4 w-4 text-white" />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-center text-gray-400">
                        <p className="text-sm">
                            &copy; 2025 SwiSys Co., Ltd. {language === 'en' ? 'All rights reserved.' : '版權所有。'}
                        </p>
                        <p className="text-xs mt-1 text-gray-500">
                            {language === 'en' 
                                ? 'Innovating automotive communication since 2005'
                                : '自2005年以來創新汽車通信技術'}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Custom scrollbar for product lists */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #374151;
                    border-radius: 2px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #60a5fa;
                    border-radius: 2px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #3b82f6;
                }
            `}</style>
        </footer>
    );
}