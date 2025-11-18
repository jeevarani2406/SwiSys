'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Globe, User, LogOut, Shield, ChevronDown, ChevronRight, Facebook, Twitter, Youtube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ language, setLanguage, isMenuOpen, setIsMenuOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, hasRole } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSolutionsDropdown, setShowSolutionsDropdown] = useState(false);
  const [expandedSolution, setExpandedSolution] = useState(null);
  const [expandedSubItem, setExpandedSubItem] = useState(null);

  const dropdownRef = useRef(null);
  const solutionsButtonRef = useRef(null);

  const handleLogin = () => router.push('/login');
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const socialLinks = [
    { href: "https://www.facebook.com/swisys.com.tw", icon: Facebook, label: "Facebook" },
    { href: "https://x.com/SwiSys_TW", icon: Twitter, label: "Twitter" },
    { href: "https://www.youtube.com/channel/UCZMd6dN9HCQXlvnvi6aQdbA", icon: Youtube, label: "YouTube" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        solutionsButtonRef.current &&
        !solutionsButtonRef.current.contains(event.target)
      ) {
        setShowSolutionsDropdown(false);
        setExpandedSolution(null);
        setExpandedSubItem(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 const navigationItems = [
  { name: language === 'en' ? 'Home' : '首頁', href: '/' },
  { name: language === 'en' ? 'About' : '關於我們', href: '/about' },
  { name: language === 'en' ? 'Solutions' : '產品', href: '/products', isDropdown: true },
  { name: language === 'en' ? 'Successful Story' : '成功的故事', href: '/successful-story' },
  { name: language === 'en' ? 'Contact Us' : '聯絡我們', href: '/contact' },
];

  const solutionSubItems = [
    {
      name: 'Automotive MCU',
      nameZh: '汽車微控制器',
      subItems: [
        { name: 'ISSI MCU', nameZh: 'ISSI 微控制器', href: 'https://www.issi.com/US/Index.shtml', external: true },
        { name: 'Megawin (Taiwan) MCU', nameZh: 'Megawin 微控制器', href: 'https://www.megawin.com.tw/', external: true },
        { name: 'WJ (Taiwan) MCU', nameZh: 'WJ 微控制器', href: '/solutions/automotive-mcu/wj' },
      ],
    },
    {
      name: 'CAN Bus ECU',
      nameZh: 'CAN 總線 ECU',
      subItems: [
        { name: 'CAN EVB', nameZh: 'CAN 評估板', href: '#', hasChildren: true, children: [
          { name: 'CS8959 EVB', href: '/solutions/can-bus-ecu/can-evb/CS8959' },
          { name: 'CS8972 EVB', href: '/solutions/can-bus-ecu/can-evb/cs8972' },
          { name: 'CS8961 ECU', href: '/solutions/can-bus-ecu/can-evb/cs8961' },
        ]},
        { name: 'Light Duty - OBDII', nameZh: '輕型車輛 - OBDII', href: '#', hasChildren: true, children: [
          { name: 'OBD Bridge', href: '/solutions/can-bus-ecu/obdii/obd-bridge' },
          { name: 'OBDII Recorder', href: '/solutions/can-bus-ecu/obdii/obdii-recorder' },
        ]},
        { name: 'Heavy Duty - J1939', nameZh: '重型車輛 - J1939', href: '#', hasChildren: true, children: [
          { name: 'J1939 Bridge', href: '/solutions/can-bus-ecu/j1939/j1939-bridge' },
          { name: 'J1939 Recorder', href: '/solutions/can-bus-ecu/j1939/j1939-recorder' },
        ]},
        { name: 'CAN Gateway', nameZh: 'CAN 網關', href: '#', hasChildren: true, children: [
          { name: 'CAN to CAN Converter', href: '/solutions/can-bus-ecu/can-gateway/can-to-can' },
          { name: 'CAN to UART Converter', href: '/solutions/can-bus-ecu/can-gateway/can-to-uart' },
        ]},
        { name: 'Contactless CAN Probe ', href: '/solutions/can-bus-ecu/can-evb/CCP' },
      ],
    },
    {
      name: 'Instruments',
      nameZh: '儀器儀表',
      subItems: [
        { name: 'Signal Generator', nameZh: '信號發生器', href: '#', hasChildren: true, children: [
          { name: 'CAN Signal Generator', href: '/solutions/instruments/signal-generator/can' },
          { name: 'LIN Signal Generator', href: '/solutions/instruments/signal-generator/lin' },
          { name: 'OBDII Signal Generator', href: '/solutions/instruments/signal-generator/obdii' },
          { name: 'J1939 Signal Generator', href: '/solutions/instruments/signal-generator/j1939' },
        ]},
        { name: 'Logic Analyzer', nameZh: '邏輯分析儀', href: '#', hasChildren: true, children: [
          { name: 'Logic Cube Pro', href: ' https://www.zeroplus.com.tw/logic-analyzer_en/products.php?pdn=3&pdnex=255' },
          { name: 'Logic Cube', href: 'https://www.zeroplus.com.tw/logic-analyzer_en/products.php?pdn=3&pdnex=61' },
          { name: 'Logic Educator', href: 'https://www.zeroplus.com.tw/logic-analyzer_en/products.php?pdn=3&pdnex=232' },
          { name: 'Logic Analyzer - F1', href: 'https://www.zeroplus.com.tw/logic-analyzer_en/products.php?pdn=3&pdnex=175' },
          { name: 'Bus Expert-II with eMMC + SD3.0', href: '/solutions/instruments/logic-analyzer/bus-expert-ii' },
        ]},
      ],
    },
  ];

  const handleSolutionsClick = () => {
    setShowSolutionsDropdown(!showSolutionsDropdown);
    setExpandedSolution(null);
    setExpandedSubItem(null);
  };

  const toggleSubMenu = (name) => setExpandedSolution(expandedSolution === name ? null : name);
  const toggleInnerSubMenu = (name) => setExpandedSubItem(expandedSubItem === name ? null : name);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <img
              src="https://swisystem.com/wp-content/uploads/2020/05/swisys-logo.png"
              alt="SwiSys Logo"
              className="h-10 w-auto mr-3 cursor-pointer"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block relative">
            <div className="ml-10 flex items-baseline space-x-9">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.isDropdown ? (
                    <div className="relative">
                      <button
                        ref={solutionsButtonRef}
                        onClick={handleSolutionsClick}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                          pathname.startsWith('/solutions') || showSolutionsDropdown
                            ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${showSolutionsDropdown ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {showSolutionsDropdown && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-2 w-[25rem] bg-white border border-gray-200 rounded-xl shadow-lg py-3 z-50 animate-slideDown"
                        >
                          {solutionSubItems.map((sub) => (
                            <div key={sub.name} className="px-3 py-1">
                              <button
                                onClick={() => toggleSubMenu(sub.name)}
                                className="flex justify-between items-center w-full text-left px-3 py-2 rounded-lg font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                              >
                                <span>{language === 'en' ? sub.name : sub.nameZh}</span>
                                <ChevronDown
                                  className={`h-4 w-4 transform transition-transform duration-300 ${expandedSolution === sub.name ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {expandedSolution === sub.name && (
                                <div className="ml-5 mt-2 space-y-1 border-l-2 border-blue-100 pl-4 bg-blue-50/30 rounded-lg animate-slideDown shadow-inner">
                                  {sub.subItems.map((s) => (
                                    <div key={s.name}>
                                      {s.hasChildren ? (
                                        <>
                                          <button
                                            onClick={() => toggleInnerSubMenu(s.name)}
                                            className="flex justify-between items-center w-full text-left text-sm text-gray-700 py-2 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                          >
                                            {language === 'en' ? s.name : s.nameZh}
                                            <ChevronRight
                                              className={`h-4 w-4 transform transition-transform duration-300 ${expandedSubItem === s.name ? 'rotate-90' : ''}`}
                                            />
                                          </button>
                                          {expandedSubItem === s.name && (
                                            <div className="ml-4 mt-1 border-l border-blue-100 pl-3 bg-blue-50/40 rounded-md animate-slideDown">
                                              {s.children.map((child) => (
                                                <Link
                                                  key={child.name}
                                                  href={child.href}
                                                  onClick={() => setShowSolutionsDropdown(false)}
                                                  className="block text-sm text-gray-700 py-2 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                                >
                                                  {child.name}
                                                </Link>
                                              ))}
                                            </div>
                                          )}
                                        </>
                                      ) : s.external ? (
                                        <a
                                          href={s.href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block text-sm text-gray-700 py-2 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                        >
                                          {language === 'en' ? s.name : s.nameZh}
                                        </a>
                                      ) : (
                                        <Link
                                          href={s.href}
                                          onClick={() => setShowSolutionsDropdown(false)}
                                          className="block text-sm text-gray-700 py-2 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                        >
                                          {language === 'en' ? s.name : s.nameZh}
                                        </Link>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        pathname === item.href
                          ? 'text-blue-600 bg-blue-50 shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Social Media Links */}
            <div className="hidden md:flex items-center gap-2 mr-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-transform duration-300 transform hover:scale-110"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5 text-gray-700" />
                  </a>
                );
              })}
            </div>

            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'EN' : '繁體中文'}
            </button>

            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden md:flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  {user?.full_name_english || user?.username}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {hasRole('admin') && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {language === 'en' ? 'Login' : '登入'}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          {/* Social Media Icons Centered */}
          <div className="flex justify-center gap-4 px-3 py-4 border-b border-gray-200">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-transform duration-300 transform hover:scale-110"
                  aria-label={social.label}
                >
                  <IconComponent className="h-5 w-5 text-gray-700" />
                </a>
              );
            })}
          </div>

          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <div key={item.name}>
                {item.isDropdown ? (
                  <>
                    <button
                      onClick={handleSolutionsClick}
                      className="w-full flex justify-between items-center px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transform transition-transform duration-300 ${
                          showSolutionsDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {showSolutionsDropdown && (
                      <div className="pl-4 space-y-2 mt-2">
                        {solutionSubItems.map((sub) => (
                          <div key={sub.name} className="bg-gray-50 rounded-lg p-2">
                            <button
                              onClick={() => toggleSubMenu(sub.name)}
                              className="flex justify-between items-center w-full text-left text-gray-700 py-2 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                            >
                              {language === 'en' ? sub.name : sub.nameZh}
                              <ChevronDown
                                className={`h-4 w-4 transform transition-transform duration-300 ${
                                  expandedSolution === sub.name ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {expandedSolution === sub.name && (
                              <div className="ml-4 mt-1 space-y-1 border-l border-blue-200 pl-3">
                                {sub.subItems.map((s) => (
                                  <div key={s.name}>
                                    {s.hasChildren ? (
                                      <>
                                        <button
                                          onClick={() => toggleInnerSubMenu(s.name)}
                                          className="flex justify-between items-center w-full text-left text-gray-600 py-1 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                        >
                                          {language === 'en' ? s.name : s.nameZh}
                                          <ChevronRight
                                            className={`h-4 w-4 transform transition-transform duration-300 ${
                                              expandedSubItem === s.name ? 'rotate-90' : ''
                                            }`}
                                          />
                                        </button>
                                        {expandedSubItem === s.name && (
                                          <div className="ml-4 mt-1 space-y-1 border-l border-blue-100 pl-3">
                                            {s.children.map((child) => (
                                              <Link
                                                key={child.name}
                                                href={child.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block text-gray-700 py-1 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                              >
                                                {child.name}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    ) : s.external ? (
                                      <a
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-gray-700 py-1 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                      >
                                        {language === 'en' ? s.name : s.nameZh}
                                      </a>
                                    ) : (
                                      <Link
                                        href={s.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-700 py-1 px-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                      >
                                        {language === 'en' ? s.name : s.nameZh}
                                      </Link>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Login / Logout */}
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" /> {language === 'en' ? 'Logout' : '登出'}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" /> {language === 'en' ? 'Login' : '登入'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}