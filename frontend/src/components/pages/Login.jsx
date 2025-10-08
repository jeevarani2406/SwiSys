'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import Link from 'next/link';

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
            const response = await apiClient.post('/accounts/login/', {
                username: formData.username,
                password: formData.password,
            });

            if (response.data.success && response.data.token) {
                login(response.data.token, response.data.user);

                // Redirect based on user type from backend response
                switch (response.data.user_type) {
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
            const errorMessage = err.response?.data?.non_field_errors?.[0] ||
                err.response?.data?.message ||
                err.response?.data?.detail ||
                'Login failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{ backgroundImage: 'url(https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg)' }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-blue-800/30"></div>
            </div>

            <div className="relative z-10 bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl border border-white/50 w-full max-w-md mx-4">
                <div className="text-center mb-8">
                    <img src="https://swisystem.com/wp-content/uploads/2020/05/swisys-logo-2.png" alt="SwiSys Logo" className="h-12 mx-auto mb-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <h2 className="text-3xl font-extrabold text-gray-900">{language === 'en' ? 'Login' : '登入'}</h2>
                    <p className="mt-2 text-sm text-gray-600">{language === 'en' ? 'Access your account' : '訪問您的帳戶'}</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'en' ? 'Username' : '用戶名'}
                        </label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            placeholder={language === 'en' ? 'Enter username' : '輸入用戶名'}
                            value={formData.username}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'en' ? 'Password' : '密碼'}
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            placeholder={language === 'en' ? 'Enter password' : '輸入密碼'}
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (language === 'en' ? 'Signing in...' : '登入中...') : (language === 'en' ? 'Sign in' : '登入')}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-600 mt-6">
                    {language === 'en' ? "Don't have an account?" : '沒有帳戶嗎？'}{' '}
                    <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                        {language === 'en' ? 'Sign up' : '註冊'}
                    </Link>
                </div>

                <div className="text-center text-xs text-gray-500 mt-4">
                    <p className="mb-1">{language === 'en' ? 'Login with your username and password' : '使用您的用戶名和密碼登入'}</p>
                    <p>{language === 'en' ? 'New customers will need to verify their email during signup' : '新客戶需要在註冊時驗證電子郵件'}</p>
                </div>
            </div>
        </div>
    );
}
