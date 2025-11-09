'use client';

import React from 'react';

export default function About({ language }) {
    const partners = [
        {
            name: 'Rebit',
            logo: 'https://www.rebit.com.tw/wp-content/uploads/2021/09/logo.svg',
            url: 'https://www.rebit.com.tw/',
        },
        {
            name: 'Vision',
            logo: 'https://www.vision.com.tw/images/logo.svg',
            url: 'https://www.vision.com.tw/',
        },
        {
            name: 'Zeroplus',
            logo: 'https://www.zeroplus.com.tw/img/logo.svg',
            url: 'https://www.zeroplus.com.tw/',
        },
        {
            name: 'Carce',
            logo: 'https://www.carce.com.tw/images/logo.png',
            url: 'https://www.carce.com.tw/',
        },
        {
            name: 'GTT',
            logo: 'https://www.globaltech-tw.com/images/logo.png',
            url: 'https://www.globaltech-tw.com/',
        },
        {
            name: 'Hsin Tong Tour',
            logo: 'https://www.hsin-tong.com.tw/images/logo.png',
            url: 'https://www.hsin-tong.com.tw/',
        },
        {
            name: 'Invax',
            logo: 'https://www.invax.com.tw/images/logo.png',
            url: 'https://www.invax.com.tw/',
        },
        {
            name: 'Megawin',
            logo: 'https://www.megawin.com.tw/images/logo.png',
            url: 'https://www.megawin.com.tw/',
        },
        {
            name: 'Mouser Electronics',
            logo: 'https://www.mouser.com/images/mouser_logo.svg',
            url: 'https://www.mouser.com/',
        },
        {
            name: 'Renesas',
            logo: 'https://www.renesas.com/sites/default/files/2020-07/logo_renesas.svg',
            url: 'https://www.renesas.com/',
        },
        {
            name: 'Cortec',
            logo: 'https://www.cortec.com/wp-content/uploads/2021/02/Cortec-Logo.svg',
            url: 'https://www.cortec.com/',
        },
        {
            name: 'HTBus',
            logo: 'https://www.htbus.com.tw/images/logo.png',
            url: 'https://www.htbus.com.tw/',
        },
        {
            name: 'Lumissil Microsystems',
            logo: 'https://www.lumissil.com/assets/img/logo.png',
            url: 'https://www.lumissil.com/',
        },
    ];

    return (
        <div className="bg-white">
            {/* Header Section */}
            <section className="relative py-20 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                        {language === 'en' ? 'About SwiSys' : '關於SwiSys'}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                        {language === 'en'
                            ? 'Established in 2016 by Professor Jing-Jou Tang and a team of electronic engineering experts, specializing in automotive communication solutions.'
                            : '由唐景州教授和電子工程專家團隊於2016年成立，專注於汽車通信解決方案。'}
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
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
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                                {language === 'en' ? 'Our Story' : '我們的故事'}
                            </h2>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    {language === 'en'
                                        ? 'SwiSys was established in 2016 by Professor Jing-Jou Tang from Southern Taiwan University of Science and Technology and a group of technologists with electronic engineering backgrounds.'
                                        : 'SwiSys 由南臺科技大學唐景州教授與多位電子工程領域專家於 2016 年創立。'}
                                </p>
                                <p>
                                    {language === 'en'
                                        ? 'We are an automotive electronics and communication solutions company focused on CAN Bus, OBD II, and SAE J1939 standards.'
                                        : '我們專注於 CAN Bus、OBD II 與 SAE J1939 相關之汽車電子與通訊解決方案。'}
                                </p>
                                <p>
                                    {language === 'en'
                                        ? 'We help customers overcome vehicle safety challenges and retrieve control signals over CAN and LIN protocols across multiple vehicle models.'
                                        : '我們協助客戶克服車輛安全挑戰，並能於多種車型透過 CAN 與 LIN 協議擷取控制訊號。'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-10 rounded-3xl shadow-2xl">
                            <div className="grid grid-cols-2 gap-8">
                                {[ 
                                    { labelEn: 'Founded', labelZh: '成立年份', value: '2016' },
                                    { labelEn: 'Years CAN Bus', labelZh: '年CAN經驗', value: '5+' },
                                    { labelEn: 'Projects', labelZh: '項目數量', value: '100+' },
                                    { labelEn: 'Support', labelZh: '技術支援', value: '24/7' },
                                ].map((kpi, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                            {kpi.value}
                                        </div>
                                        <div className="text-gray-600 font-medium">
                                            {language === 'en' ? kpi.labelEn : kpi.labelZh}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Trusted Partners Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        {language === 'en' ? 'Our Trusted Partners' : '我們的信賴合作夥伴'}
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                        {language === 'en'
                            ? 'Collaborating with industry leaders to deliver exceptional solutions worldwide.'
                            : '與行業領導者合作，為全球提供卓越的解決方案。'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 items-center justify-center">
                        {partners.map((partner, index) => (
                            <a
                                key={index}
                                href={partner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center h-28">
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="max-h-16 object-contain grayscale group-hover:grayscale-0 transition"
                                    />
                                </div>
                                <p className="mt-3 text-gray-700 font-medium group-hover:text-purple-600">
                                    {partner.name}
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}