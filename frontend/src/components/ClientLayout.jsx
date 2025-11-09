'use client';

import React, { createContext, useContext, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default function ClientLayout({ children }) {
    const [language, setLanguage] = useState('en');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            <div className="min-h-screen bg-white">
                <Header
                    language={language}
                    setLanguage={setLanguage}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />
                <main>{children}</main>
                <Footer language={language} />
            </div>
        </LanguageContext.Provider>
    );
}
