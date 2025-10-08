'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Globe, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ language, setLanguage, isMenuOpen, setIsMenuOpen }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated, hasRole } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    const navigationItems = [
        { name: language === 'en' ? 'Home' : '首頁', href: '/' },
        { name: language === 'en' ? 'About' : '關於我們', href: '/about' },
        { name: language === 'en' ? 'Solutions' : '解決方案', href: '/solutions' },
        { name: language === 'en' ? 'Successful Story' : '成功的故事', href: '/successful-story' },
        { name: language === 'en' ? 'Partners' : '合作夥伴', href: '/partners' },
        { name: language === 'en' ? 'Contact' : '聯絡我們', href: '/contact' },
    ];

    return (
        <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <img
                                    src="https://swisystem.com/wp-content/uploads/2020/05/swisys-logo.png"
                                    alt="SwiSys Logo"
                                    className="h-10 w-auto mr-3 cursor-pointer"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                                            e.currentTarget.nextElementSibling.style.display = 'block';
                                        }
                                    }}
                                />
                            </Link>
                            <Link href="/">
                                <h1
                                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                                    style={{ display: 'none' }}
                                >
                                    SwiSys
                                </h1>
                            </Link>
                        </div>
                    </div>

                    <nav className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${pathname === item.href
                                            ? 'text-blue-600 bg-blue-50 shadow-sm'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            >
                                <Globe className="h-4 w-4 mr-2" />
                                {language === 'en' ? 'EN' : '繁體中文'}
                            </button>
                        </div>

                        <div className="ml-4">
                            {isAuthenticated() ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="hidden md:flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm whitespace-nowrap"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        {user?.full_name_english || user?.username}
                                    </button>
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                            {hasRole('admin') && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                {language === 'en' ? 'Logout' : '登出'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm whitespace-nowrap"
                                >
                                    {language === 'en' ? 'Login' : '登入'}
                                </button>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === item.href
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {isAuthenticated() ? (
                            <div className="space-y-1">
                                <div className="px-3 py-2 text-base font-medium text-blue-600 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    {user?.full_name_english || user?.username}
                                </div>
                                {hasRole('admin') && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {language === 'en' ? 'Logout' : '登出'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    handleLogin();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            >
                                {language === 'en' ? 'Login' : '登入'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
