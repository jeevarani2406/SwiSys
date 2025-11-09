'use client';

import React from 'react';
import { Building2, Globe, Star, Zap } from 'lucide-react';

export default function Partners({ language, partners }) {
    return (
        <div className="bg-white">
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
                        {language === 'en' ? 'Our Trusted Partners' : '我們的合作夥伴'}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                        {language === 'en'
                            ? 'Collaborating with industry leaders to deliver exceptional solutions worldwide'
                            : '與頂尖產業夥伴合作，於全球提供卓越的解決方案'}
                    </p>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            {language === 'en' ? 'Strategic Partnerships' : '策略合作夥伴'}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {language === 'en'
                                ? 'Building strong relationships with technology leaders and component suppliers'
                                : '與科技領導者與供應商建立穩固的合作關係'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {partners.map((partner, index) => (
                            <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Building2 className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{partner}</h3>
                                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/50">
                        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                            {language === 'en' ? 'Partnership Benefits' : '合作夥伴優勢'}
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Star, titleEn: 'Quality Assurance', titleZh: '品質保證', descEn: 'Rigorous quality standards maintained through trusted supplier relationships', descZh: '透過可靠供應商維持嚴謹品質標準' },
                                { icon: Zap, titleEn: 'Innovation Access', titleZh: '創新優勢', descEn: 'Early access to cutting-edge technologies and components', descZh: '優先取得尖端技術與關鍵零組件' },
                                { icon: Globe, titleEn: 'Global Reach', titleZh: '全球布局', descEn: 'Worldwide support and distribution network', descZh: '全球化支援與通路網路' },
                            ].map((b, i) => (
                                <div key={i} className="text-center">
                                    <div className={`bg-gradient-to-br ${i === 0 ? 'from-blue-500 to-blue-600' : i === 1 ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                        <b.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">{language === 'en' ? b.titleEn : b.titleZh}</h4>
                                    <p className="text-gray-600 leading-relaxed">{language === 'en' ? b.descEn : b.descZh}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
