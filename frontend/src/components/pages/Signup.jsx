'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';
import Link from 'next/link';
import { Briefcase, User, ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';

export default function Signup({ language = 'en' }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        firstNameChinese: '',
        lastNameChinese: '',
    });
    const [userType, setUserType] = useState(null); // 'customer' | 'employee' | null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [customerUsername, setCustomerUsername] = useState('');

    const { login } = useAuth();
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError(language === 'en' ? 'Passwords do not match' : '密碼不相符');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError(language === 'en' ? 'Password must be at least 8 characters long' : '密碼長度必須至少為 8 個字元');
            setLoading(false);
            return;
        }

        try {
            const signupData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                first_name_chinese: formData.firstNameChinese,
                last_name_chinese: formData.lastNameChinese,
            };

            if (userType === 'customer') {
                await authService.registerCustomer(signupData);
                setCustomerUsername(formData.username);
                setShowOTPForm(true);
                setSuccess(language === 'en' ? 'Registration successful! Please check your email for the OTP code.' : '註冊成功！請檢查您的電子郵件以獲取 OTP 驗證碼。');
            } else if (userType === 'employee') {
                await authService.registerEmployee(signupData);
                setSuccess(language === 'en' ? 'Employee registration submitted! Please wait for admin approval before you can login.' : '員工註冊已提交！請等待管理員批准後才能登入。');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = language === 'en' ? 'Registration failed' : '註冊失敗';
            
            if (errorData) {
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.details && typeof errorData.details === 'object') {
                    const messages = Object.values(errorData.details).flat();
                    errorMessage = Array.isArray(messages) ? messages.join(', ') : String(messages);
                } else if (typeof errorData === 'object') {
                    const messages = Object.values(errorData).flat();
                    errorMessage = Array.isArray(messages) ? messages.join(', ') : String(messages);
                } else {
                    errorMessage = String(errorData);
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setError('');

        try {
            const data = await authService.verifyOTP(customerUsername, otpCode);

            if (data.token) {
                const userData = await authService.getCurrentUser();
                login(data.token, userData);
                setSuccess(language === 'en' ? 'Account verified successfully! Redirecting to dashboard...' : '帳戶驗證成功！正在重定向到儀表板...');
                setTimeout(() => {
                    router.push('/customer-dashboard');
                }, 1500);
            }
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = language === 'en' ? 'OTP verification failed' : 'OTP 驗證失敗';

            if (errorData) {
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
                    errorMessage = errorData.non_field_errors[0];
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.details && typeof errorData.details === 'object') {
                    const messages = Object.values(errorData.details).flat();
                    errorMessage = Array.isArray(messages) ? messages[0] : String(messages);
                }
            }
            setError(errorMessage);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await authService.resendOTP(customerUsername);
            setSuccess(language === 'en' ? 'OTP sent to your email!' : 'OTP 已發送到您的電子郵件！');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errorData = err.response?.data;
            setError(errorData?.message || errorData?.detail || (language === 'en' ? 'Failed to resend OTP' : '重新發送 OTP 失敗'));
        }
    };

    // Helper for Input Fields
    const ThemeInput = ({ label, ...props }) => (
        <div className="group">
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2 ml-1 drop-shadow-sm">
                {label}
            </label>
            <input
                {...props}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-white placeholder-blue-200/50 outline-none backdrop-blur-sm hover:bg-white/15"
            />
        </div>
    );

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
            
            {/* ==========================================
                1. IMMERSIVE BACKGROUND & 3D EFFECTS
               ========================================== */}
            <div className="absolute inset-0 z-0">
                {/* Main Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transform scale-105"
                    style={{
                        backgroundImage: 'url(https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?cs=srgb&dl=city-sky-skyline-618079.jpg&fm=jpg)',
                    }}
                >
                    {/* Gradient Overlay from Request */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>
                </div>

                {/* Animated Background Orbs (3D Depth) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* ==========================================
                2. FLOATING GLASS CARD CONTAINER
               ========================================== */}
            <div className={`relative z-10 w-full px-6 transition-all duration-500 ${showOTPForm || userType ? 'max-w-2xl' : 'max-w-md'}`}>
                
                {/* 3D Tilt/Float Wrapper */}
                <div className="animate-float-3d perspective-container">
                    
                    {/* The Glass Card */}
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                        
                        {/* --- VIEW 1: OTP FORM --- */}
                        {showOTPForm ? (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-100 mb-4 border border-blue-400/30 shadow-lg shadow-blue-500/20">
                                        <Mail className="h-8 w-8" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white drop-shadow-md">
                                        {language === 'en' ? 'Verify Your Email' : '驗證您的電子郵件'}
                                    </h2>
                                    <p className="text-blue-200 mt-2">
                                        {language === 'en' ? "We've sent a 6-digit code to" : '我們已發送 6 位數驗證碼至'} <span className="text-white font-semibold">{formData.email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleOTPVerification} className="space-y-6 max-w-xs mx-auto">
                                    <div>
                                        <input
                                            type="text"
                                            required
                                            maxLength="6"
                                            className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-black/20 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all outline-none shadow-inner"
                                            placeholder="000000"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                        />
                                    </div>

                                    {error && <div className="text-center text-red-200 text-sm bg-red-900/40 p-2 rounded-lg border border-red-500/30 backdrop-blur-sm">{error}</div>}
                                    {success && <div className="text-center text-green-200 text-sm bg-green-900/40 p-2 rounded-lg border border-green-500/30 backdrop-blur-sm">{success}</div>}

                                    <div className="space-y-3">
                                        <button
                                            type="submit"
                                            disabled={otpLoading || otpCode.length !== 6}
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                                        >
                                            {otpLoading 
                                                ? (language === 'en' ? 'Verifying...' : '正在驗證...') 
                                                : (language === 'en' ? 'Verify & Complete' : '驗證並完成')
                                            }
                                        </button>

                                        <div className="flex justify-between text-sm mt-4">
                                            <button type="button" onClick={handleResendOTP} className="text-blue-300 hover:text-white transition-colors">
                                                {language === 'en' ? 'Resend Code' : '重新發送驗證碼'}
                                            </button>
                                            <button type="button" onClick={() => {setShowOTPForm(false); setOtpCode('');}} className="text-gray-400 hover:text-gray-200 transition-colors">
                                                {language === 'en' ? 'Back' : '返回'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                        /* --- VIEW 2: SELECT USER TYPE --- */
                        ) : !userType ? (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        {language === 'en' ? 'Create Account' : '建立帳戶'}
                                    </h2>
                                    <p className="text-gray-400">
                                        {language === 'en' ? 'Choose your account type to get started' : '請選擇您的帳戶類型以開始'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <button
                                        onClick={() => setUserType('customer')}
                                        className="group relative p-6 flex flex-col items-center bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 transform hover:-translate-y-1"
                                    >
                                        <div className="p-4 rounded-full bg-white/10 group-hover:bg-blue-500 group-hover:text-white text-blue-300 transition-all duration-300 mb-4 shadow-inner">
                                            <User className="h-8 w-8" />
                                        </div>
                                        <span className="font-bold text-xl text-white mb-1">
                                            {language === 'en' ? 'Customer' : '客戶'}
                                        </span>
                                        <span className="text-xs text-blue-200/70 group-hover:text-blue-100 text-center">
                                            {language === 'en' ? 'For clients & partners' : '適用於客戶與合作夥伴'}
                                        </span>
                                        <span className="text-xs text-white mt-2">
                                            {language === 'en' ? 'Email verification required' : '需要電子郵件驗證'}
                                        </span>
                                        {/* Selection Glow */}
                                        <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/0 group-hover:ring-blue-400/50 transition-all duration-500"></div>
                                    </button>

                                    <button
                                        onClick={() => setUserType('employee')}
                                        className="group relative p-6 flex flex-col items-center bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 transform hover:-translate-y-1"
                                    >
                                        <div className="p-4 rounded-full bg-white/10 group-hover:bg-purple-500 group-hover:text-white text-purple-300 transition-all duration-300 mb-4 shadow-inner">
                                            <Briefcase className="h-8 w-8" />
                                        </div>
                                        <span className="font-bold text-xl text-white mb-1">
                                            {language === 'en' ? 'Employee' : '員工'}
                                        </span>
                                        <span className="text-xs text-purple-200/70 group-hover:text-purple-100 text-center">
                                            {language === 'en' ? 'For staff members' : '適用於內部員工'}
                                        </span>
                                        <span className="text-xs text-white mt-2">
                                            {language === 'en' ? 'Requires admin approval' : '需要管理員批准'}
                                        </span>
                                        {/* Selection Glow */}
                                        <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-400/0 group-hover:ring-purple-400/50 transition-all duration-500"></div>
                                    </button>
                                </div>

                                <div className="text-center pt-6 border-t border-white/10">
                                    <p className="text-sm text-blue-200">
                                        {language === 'en' ? 'Already have an account?' : '已經有帳戶了嗎？'}{' '}
                                        <Link href="/login" className="font-bold text-white hover:text-blue-300 transition-colors underline decoration-transparent hover:decoration-blue-300 underline-offset-4">
                                            {language === 'en' ? 'Login here' : '在此登入'}
                                        </Link>
                                    </p>
                                </div>
                            </div>

                        /* --- VIEW 3: REGISTRATION FORM --- */
                        ) : (
                            <form className="space-y-5 animate-fadeIn" onSubmit={handleSignup}>
                                {/* Header with Back Button */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setUserType(null)}
                                        className="flex items-center text-sm text-blue-200 hover:text-white transition-colors group"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                                        {language === 'en' ? 'Back' : '返回'}
                                    </button>
                                    <div className="flex items-center">
                                        {userType === 'customer' ? 
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-100 text-xs font-bold border border-blue-400/30 shadow-sm">
                                                <User className="h-3 w-3 mr-1.5" /> {language === 'en' ? 'Customer' : '客戶'}
                                            </span>
                                            : 
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-100 text-xs font-bold border border-purple-400/30 shadow-sm">
                                                <Briefcase className="h-3 w-3 mr-1.5" /> {language === 'en' ? 'Employee' : '員工'}
                                            </span>
                                        }
                                    </div>
                                </div>

                                {/* Inputs Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ThemeInput 
                                        label={language === 'en' ? "English First Name" : "英文名字 (First Name)"} 
                                        name="firstName" 
                                        placeholder={language === 'en' ? "John" : "John"} 
                                        type="text" 
                                        value={formData.firstName} 
                                        onChange={handleInputChange} 
                                    />
                                    <ThemeInput 
                                        label={language === 'en' ? "English Last Name" : "英文姓氏 (Last Name)"} 
                                        name="lastName" 
                                        placeholder={language === 'en' ? "Doe" : "Doe"} 
                                        type="text" 
                                        value={formData.lastName} 
                                        onChange={handleInputChange} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ThemeInput 
                                        label={language === 'en' ? "Chinese First Name" : "中文名字"} 
                                        name="firstNameChinese" 
                                        placeholder={language === 'en' ? "约翰" : "約翰"} 
                                        type="text" 
                                        value={formData.firstNameChinese} 
                                        onChange={handleInputChange} 
                                    />
                                    <ThemeInput 
                                        label={language === 'en' ? "Chinese Last Name" : "中文姓氏"} 
                                        name="lastNameChinese" 
                                        placeholder={language === 'en' ? "史密斯" : "史密斯"} 
                                        type="text" 
                                        value={formData.lastNameChinese} 
                                        onChange={handleInputChange} 
                                    />
                                </div>

                                <ThemeInput 
                                    label={language === 'en' ? "Username" : "使用者名稱"} 
                                    name="username" 
                                    placeholder={language === 'en' ? "johndoe" : "johndoe"} 
                                    type="text" 
                                    required 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                />
                                <ThemeInput 
                                    label={language === 'en' ? "Email Address" : "電子郵件地址"} 
                                    name="email" 
                                    placeholder={language === 'en' ? "john@example.com" : "john@example.com"} 
                                    type="email" 
                                    required 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ThemeInput 
                                        label={language === 'en' ? "Password" : "密碼"} 
                                        name="password" 
                                        placeholder={language === 'en' ? "Min 8 chars" : "最少 8 個字元"} 
                                        type="password" 
                                        required 
                                        value={formData.password} 
                                        onChange={handleInputChange} 
                                    />
                                    <ThemeInput 
                                        label={language === 'en' ? "Confirm Password" : "確認密碼"} 
                                        name="confirmPassword" 
                                        placeholder={language === 'en' ? "Confirm password" : "確認密碼"} 
                                        type="password" 
                                        required 
                                        value={formData.confirmPassword} 
                                        onChange={handleInputChange} 
                                    />
                                </div>

                                {/* Info Notes */}
                                {userType === 'customer' && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-600/20 border border-blue-400/20 backdrop-blur-sm">
                                        <Mail className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-100 leading-relaxed">
                                            <strong className="text-white block mb-1">
                                                {language === 'en' ? 'Email Verification Required' : '需要電子郵件驗證'}
                                            </strong>
                                            {language === 'en' ? 'We will send an OTP code to your email immediately after signup.' : '註冊後，我們將立即向您的電子郵件發送一次性密碼 (OTP)。'}
                                        </p>
                                    </div>
                                )}

                                {userType === 'employee' && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-600/20 border border-purple-400/20 backdrop-blur-sm">
                                        <Lock className="h-5 w-5 text-purple-300 shrink-0 mt-0.5" />
                                        <p className="text-xs text-purple-100 leading-relaxed">
                                            <strong className="text-white block mb-1">
                                                {language === 'en' ? 'Admin Approval Required' : '需要管理員批准'}
                                            </strong>
                                            {language === 'en' ? 'Your account will be pending until an administrator activates it.' : '您的帳戶將處於待審核狀態，直到管理員啟用它。'}
                                        </p>
                                    </div>
                                )}

                                {/* Feedback Messages */}
                                {error && (
                                    <div className="flex items-center gap-2 text-red-100 text-sm bg-red-500/20 p-3 rounded-xl border border-red-400/30 animate-shake backdrop-blur-sm">
                                        <span>⚠️ {error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="flex items-center gap-2 text-green-100 text-sm bg-green-500/20 p-3 rounded-xl border border-green-400/30 backdrop-blur-sm">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>{success}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 px-4 rounded-xl font-bold shadow-lg text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group
                                        ${userType === 'customer' 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-900/40' 
                                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-900/40'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -translate-x-full"></div>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {language === 'en' ? 'Processing...' : '處理中...'}
                                        </span>
                                    ) : (
                                        <span>{language === 'en' ? 'Create Account' : '建立帳戶'}</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
                
                {/* Bottom Security Note */}
                <p className="text-center text-xs text-white/40 mt-6 drop-shadow-md">
                    <span className="mr-1">🔒</span> {language === 'en' ? 'Secured by 256-bit Encryption' : '受 256 位元加密保護'}
                </p>
            </div>

            {/* ==========================================
                3. ANIMATION PARTICLES
               ========================================== */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-float-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* ==========================================
                4. CSS STYLES (Animations)
               ========================================== */}
            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-3d {
                    animation: float-3d 6s ease-in-out infinite;
                }
                
                @keyframes float-particle {
                    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
                    50% { transform: translateY(-100px) rotate(180deg); opacity: 0.6; }
                }
                .animate-float-particle {
                    animation: float-particle infinite linear;
                }

                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div> 
    );
}