'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';
import Link from 'next/link';

// Component for the left-side welcome/hero content
function WelcomeSection({ language }) {
    return (
        <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-start p-10 space-y-4 text-white">
            <h1 className="text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                {language === 'en' ? 'Welcome Back!' : '歡迎回來!'}
            </h1>
            <p className="text-2xl font-semibold text-blue-200 drop-shadow-md">
                {language === 'en' ? 'Securely access your data and personalized dashboard.' : '安全地訪問您的數據和個人化儀表板。'}
            </p>
        </div>
    );
}

// Main Login Component
export default function Login({ language = 'en' }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(formData.username, formData.password);

            if (data.success && data.token) {
                login(data.token, data.user);

                // Redirect based on user type from backend response
                switch (data.user_type) {
                    case 'admin':
                        router.push('/admin');
                        break;
                    case 'employee':
                        router.push('/employee-dashboard');
                        break;
                    case 'customer':
                        router.push('/customer-dashboard');
                        break;
                    default:
                        router.push('/');
                }
            }
        } catch (err) {
            // Handle error response - backend may return error in different formats
            const errorData = err.response?.data;
            let errorMessage = 'Login failed';

            if (errorData) {
                // Handle custom exception handler format
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
                // Handle DRF validation errors
                else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
                    errorMessage = errorData.non_field_errors[0];
                }
                // Handle DRF detail format
                else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
                // Handle error details object
                else if (errorData.details && typeof errorData.details === 'object') {
                    const messages = Object.values(errorData.details).flat();
                    errorMessage = Array.isArray(messages) ? messages[0] : String(messages);
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Hero Section Background Theme */}
            <section className="absolute inset-0 py-20 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?cs=srgb&dl=city-sky-skyline-618079.jpg&fm=jpg)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>
                </div>

                {/* Additional decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl"></div>
            </section>

            {/* Main Content Container: Split into two columns on large screens */}
            <div className="relative z-10 flex w-full max-w-6xl mx-auto items-center justify-center lg:justify-between p-4">

                {/* Left Side: Welcome Text (Hidden on small screens) */}
                <WelcomeSection language={language} />

                {/* Right Side: Glass morphism login container */}
                <div className="bg-black/30 backdrop-blur-lg p-8 sm:p-10 rounded-2xl border border-blue-400/30 shadow-2xl w-full max-w-md mx-4 lg:ml-auto">
                    {/* Top decoration */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/80 rounded-full blur-sm"></div>

                    <div className="text-center mb-8">
                        <img
                            src="https://swisystem.com/wp-content/uploads/2020/05/swisys-logo-2.png"
                            alt="SwiSys Logo"
                            className="h-12 mx-auto mb-4 opacity-90 filter brightness-0 invert"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg mb-2">
                            {language === 'en' ? 'Login to Your Account' : '登入您的帳戶'}
                        </h2>
                        {/* Welcome Back for small screens */}
                        <p className="lg:hidden text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            {language === 'en' ? 'Welcome Back!' : '歡迎回來!'}
                        </p>
                        <p className="text-sm text-blue-200/80 drop-shadow">
                            {language === 'en' ? 'Access your personalized dashboard' : '訪問您的個人化儀表板'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Username Input with Icon */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow font-semibold">
                                {language === 'en' ? 'Username' : '用戶名'}
                            </label>
                            <div className="relative">
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    // Modified class: added pl-12 for icon space
                                    className="w-full pl-12 pr-4 py-3 bg-black/40 border border-blue-400/40 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-white placeholder-blue-200/60 backdrop-blur-sm shadow-inner shadow-blue-500/20"
                                    placeholder={language === 'en' ? 'Enter username' : '輸入用戶名'}
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                                {/* User Icon (SVG) */}
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/80 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                        </div>

                        {/* Password Input with Icon */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow font-semibold">
                                {language === 'en' ? 'Password' : '密碼'}
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    // Modified class: added pl-12 for icon space
                                    className="w-full pl-12 pr-4 py-3 bg-black/40 border border-blue-400/40 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-white placeholder-blue-200/60 backdrop-blur-sm shadow-inner shadow-blue-500/20"
                                    placeholder={language === 'en' ? 'Enter password' : '輸入密碼'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                {/* Lock Icon (SVG) */}
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/80 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V7a2 2 0 014 0v4"></path></svg>
                            </div>
                        </div>

                        {error && (
                            <div className="text-white text-sm text-center bg-blue-600/60 p-3 rounded-lg border border-blue-400/50 backdrop-blur-sm shadow-lg">
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/30 border border-blue-400/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {language === 'en' ? 'Signing in...' : '登入中...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <span className="group-hover:scale-110 transition-transform duration-300">🚀</span>
                                        <span className="ml-2">{language === 'en' ? 'Sign in' : '登入'}</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm text-blue-200/80 mt-6 drop-shadow">
                        {language === 'en' ? "Don't have an account?" : '沒有帳戶嗎？'}{' '}
                        <Link href="/signup" className="font-bold text-blue-300 hover:text-blue-200 hover:underline transition-colors">
                            {language === 'en' ? 'Sign up now' : '立即註冊'}
                        </Link>
                    </div>

                    <div className="text-center text-xs text-blue-200/60 mt-4 drop-shadow space-y-1">
                        <p className="flex items-center justify-center">
                            <span className="mr-1">✨</span>
                            {language === 'en' ? 'Secure login with advanced encryption' : '採用先進加密的安全登入'}
                        </p>
                        <p className="flex items-center justify-center">
                            <span className="mr-1">🏢</span>
                            {language === 'en' ? 'New customers will need to verify their email' : '新客戶需要驗證電子郵件'}
                        </p>
                    </div>

                    {/* Decorative light beams */}
                    <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-48 h-32">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/15 to-transparent rounded-full blur-lg"></div>
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-purple-400/10 to-transparent rounded-full blur-md"></div>
                    </div>
                </div>
            </div>

            {/* Floating particles for ambiance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i + 15}
                        className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${4 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* CSS for floating animation */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}