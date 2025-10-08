'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import Link from 'next/link';
import { Briefcase, User } from 'lucide-react';

export default function Signup() {
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
    const [userType, setUserType] = useState(null);
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
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
                await apiClient.post('/accounts/register/customer/', signupData);
                setCustomerUsername(formData.username);
                setShowOTPForm(true);
                setSuccess('Registration successful! Please check your email for the OTP code.');
            } else if (userType === 'employee') {
                await apiClient.post('/accounts/register/employee/', signupData);
                setSuccess('Employee registration submitted! Please wait for admin approval before you can login.');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err) {
            if (err.response?.data?.details || err.response?.data) {
                const details = err.response.data.details || err.response.data;
                if (typeof details === 'object') {
                    const errorMessages = Object.values(details).flat().join(', ');
                    setError(errorMessages);
                } else {
                    setError(details);
                }
            } else {
                setError(err.response?.data?.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/accounts/verify/customer/otp/', {
                username: customerUsername,
                code: otpCode,
            });

            if (response.data.token) {
                // Get user info after OTP verification
                const userResponse = await apiClient.get('/accounts/me/', {
                    headers: { Authorization: `Token ${response.data.token}` }
                });

                login(response.data.token, userResponse.data);
                setSuccess('Account verified successfully! Redirecting to dashboard...');

                setTimeout(() => {
                    router.push('/customer-dashboard');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'OTP verification failed');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await apiClient.post('/accounts/resend/customer/otp/', {
                username: customerUsername,
            });
            setSuccess('OTP sent to your email!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to resend OTP');
        }
    };

    // OTP Verification Form
    if (showOTPForm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative py-12" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4')" }}>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
                        <p className="text-gray-600 mt-2">We've sent a 6-digit verification code to your email</p>
                    </div>

                    <form onSubmit={handleOTPVerification} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                                placeholder="000000"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
                        )}

                        {success && (
                            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={otpLoading || otpCode.length !== 6}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {otpLoading ? 'Verifying...' : 'Verify & Complete Registration'}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="w-full text-blue-600 hover:text-blue-500 text-sm py-2"
                            >
                                Resend OTP
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowOTPForm(false);
                                    setOtpCode('');
                                    setError('');
                                    setSuccess('');
                                }}
                                className="w-full text-gray-600 hover:text-gray-500 text-sm py-2"
                            >
                                Back to registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative py-12" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4')" }}>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

                {!userType ? (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-center text-gray-700">Select your account type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setUserType('customer')}
                                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <User className="h-8 w-8 text-blue-600 mb-2" />
                                <span className="font-medium">Customer</span>
                                <span className="text-sm text-gray-500 mt-1">For clients and partners</span>
                                <span className="text-xs text-blue-600 mt-2">Email verification required</span>
                            </button>
                            <button
                                onClick={() => setUserType('employee')}
                                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                            >
                                <Briefcase className="h-8 w-8 text-purple-600 mb-2" />
                                <span className="font-medium">Employee</span>
                                <span className="text-sm text-gray-500 mt-1">For staff and team members</span>
                                <span className="text-xs text-orange-600 mt-2">Requires admin approval</span>
                            </button>
                        </div>
                        <div className="text-center text-sm text-gray-600 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSignup}>
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setUserType(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ← Back
                            </button>
                            <div className="flex items-center">
                                {userType === 'customer' ?
                                    <User className="h-5 w-5 text-blue-600 mr-2" /> :
                                    <Briefcase className="h-5 w-5 text-purple-600 mr-2" />
                                }
                                <span className="font-medium">
                                    {userType === 'customer' ? 'Customer' : 'Employee'} Sign Up
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">English First Name</label>
                                <input
                                    name="firstName"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">English Last Name</label>
                                <input
                                    name="lastName"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Doe"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chinese First Name</label>
                                <input
                                    name="firstNameChinese"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="约翰"
                                    type="text"
                                    value={formData.firstNameChinese}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chinese Last Name</label>
                                <input
                                    name="lastNameChinese"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="史密斯"
                                    type="text"
                                    value={formData.lastNameChinese}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                name="username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="johndoe"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="john@example.com"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                name="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Min 8 characters"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm password"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                        </div>

                        {userType === 'customer' && (
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                                <strong>Note:</strong> After registration, you'll need to verify your email with an OTP code before you can access your account.
                            </div>
                        )}

                        {userType === 'employee' && (
                            <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-700">
                                <strong>Note:</strong> Employee accounts require admin approval. You'll receive login access once approved.
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
                        )}

                        {success && (
                            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userType === 'customer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            {loading ? 'Creating Account...' : `Create ${userType === 'customer' ? 'Customer' : 'Employee'} Account`}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
