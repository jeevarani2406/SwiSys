import React from 'react';
import { Facebook, Twitter, Youtube } from 'lucide-react';

export default function Footer({ language }) {
    return (
        <footer className="relative bg-gray-900 text-white py-16 overflow-hidden">
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'url(https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-6">
                            <img
                                src="https://swisystem.com/wp-content/uploads/2020/05/swisys-logo-2.png"
                                alt="SwiSys Logo"
                                className="h-8 w-auto mr-3"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                                        e.currentTarget.nextElementSibling.style.display = 'block';
                                    }
                                }}
                            />
                            <h3
                                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                style={{ display: 'none' }}
                            >
                                SwiSys
                            </h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            {language === 'en'
                                ? 'Leading automotive communication solutions with CAN Bus, OBD II, and SAE J1939 expertise. Bridging vehicles with IoT innovation.'
                                : '領先的汽車通信解決方案，擁有CAN總線、OBD II和SAE J1939專業技術。連接車輛與物聯網創新。'}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-lg">
                            {language === 'en' ? 'Solutions' : '解決方案'}
                        </h4>
                        <ul className="space-y-3 text-gray-300">
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">
                                {language === 'en' ? 'CAN Bus Solutions' : 'CAN總線解決方案'}
                            </li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">
                                {language === 'en' ? 'OBD II Systems' : 'OBD II系統'}
                            </li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">
                                {language === 'en' ? 'SAE J1939 Protocol' : 'SAE J1939協議'}
                            </li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">
                                {language === 'en' ? 'IoT Gateway' : '物聯網網關'}
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-lg">
                            {language === 'en' ? 'Products' : '產品'}
                        </h4>
                        <ul className="space-y-3 text-gray-300">
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">CS8959 - CAN Bus EVB</li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">CS8961 - CAN Sensor Node</li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">
                                {language === 'en' ? 'Development Kits' : '開發套件'}
                            </li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">
                                {language === 'en' ? 'Custom Solutions' : '定制解決方案'}
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-lg">
                            {language === 'en' ? 'Contact' : '聯絡方式'}
                        </h4>
                        <ul className="space-y-3 text-gray-300">
                            <li className="hover:text-blue-400 transition-colors">+886 6 200 6070</li>
                            <li className="hover:text-blue-400 transition-colors">swisys.service@gmail.com</li>
                            <li className="hover:text-blue-400 transition-colors">
                                {language === 'en' ? 'Tainan, Taiwan' : '台南，台灣'}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Social Media Links Centered */}
                <div className="flex justify-center items-center gap-4 mt-12 mb-4">
                    <a
                        href="https://www.facebook.com/swisys.com.tw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 rounded-full hover:scale-110 transition-transform duration-300"
                    >
                        <Facebook className="h-5 w-5 text-white" />
                    </a>
                    <a
                        href="https://x.com/SwiSys_TW"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-black rounded-full hover:scale-110 transition-transform duration-300"
                    >
                        <Twitter className="h-5 w-5 text-white" />
                    </a>
                    <a
                        href="https://www.youtube.com/channel/UCZMd6dN9HCQXlvnvi6aQdbA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-red-600 rounded-full hover:scale-110 transition-transform duration-300"
                    >
                        <Youtube className="h-5 w-5 text-white" />
                    </a>
                </div>

                <div className="border-t border-gray-800 pt-4 text-center text-gray-400">
                    <p>
                        &copy; 2025 SwiSys Co., Ltd. {language === 'en' ? 'All rights reserved.' : '版權所有。'}
                        {language === 'en' ? ' Automotive Communication Excellence.' : ' 汽車通信卓越。'}
                    </p>
                </div>
            </div>
        </footer>
    );
}
