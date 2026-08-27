import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, Shield, User, KeyRound, CheckCircle } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const AdminSetup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!name || !email) {
            toast.error('Name and Email are required');
            return;
        }
        try {
            const { data } = await api.post('/auth/register', { name, email });
            toast.success('OTP sent to your email!');
            
            if (data.devOtp) {
                setTimeout(() => {
                    toast.success(`[Test Mode] Email Blocked by ISP.\nYour OTP is: ${data.devOtp}`, { 
                        duration: 15000, 
                        icon: '🔧',
                        style: { border: '2px solid #C8843B', padding: '16px', fontWeight: 'bold' }
                    });
                }, 1000);
            }

            setIsOtpSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits long');
            return;
        }
        try {
            const { data } = await api.post('/auth/check-otp', { email, otp });
            if (data.valid) {
                toast.success('Email verified! You can now create your password.');
                setIsOtpVerified(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP code');
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!isOtpVerified) return;

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp, newPassword: password });
            toast.success('Admin account created successfully!', { duration: 3000 });
            login(data);
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Setup failed');
        }
    };

    const handleResendOtp = async () => {
        try {
            const { data } = await api.post('/auth/resend-otp', { email });
            toast.success('A new OTP has been sent!');
            
            if (data.devOtp) {
                setTimeout(() => {
                    toast.success(`[Test Mode] Email Blocked by ISP.\nYour OTP is: ${data.devOtp}`, { 
                        duration: 15000, 
                        icon: '🔧',
                        style: { border: '2px solid #C8843B', padding: '16px', fontWeight: 'bold' }
                    });
                }, 1000);
            }
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen bg-[#fef9e1] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#2E1A12]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <ScrollReveal variant="fade-up" duration={800}>
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-[#C8843B] flex items-center justify-center shadow-lg">
                            <Shield className="w-10 h-10 text-[#C8843B]" />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-[#4A3C31] font-serif leading-none">
                        System Setup
                    </h2>
                    <p className="text-center text-[10px] font-bold text-[#C8843B] tracking-widest uppercase mt-2.5">
                        Create First Admin Account
                    </p>
                </ScrollReveal>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <ScrollReveal variant="zoom-in" duration={900} delay={150}>
                    <div className="bg-white py-8 px-6 shadow-xl rounded-[32px] sm:px-10 border border-[#E8DCC8]/30">
                        
                        {!isOtpSent && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Welcome to Smart Bake Hub! 🎉</h3>
                                        <div className="mt-2 text-xs text-yellow-700">
                                            <p>Since this is the first time logging into the system, you need to create the Master Admin account.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleFinalSubmit}>
                            {/* Name & Email Fields */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Full Name
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm opacity-100">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text" required disabled={isOtpSent}
                                        className={`block w-full pl-10 sm:text-sm border border-gray-200 rounded-xl py-3.5 text-[#4A3C31] outline-none transition-all font-medium ${isOtpSent ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-[#FAFAFA] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B]'}`}
                                        placeholder="Admin Name"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Email Address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email" required disabled={isOtpSent}
                                        className={`block w-full pl-10 sm:text-sm border border-gray-200 rounded-xl py-3.5 text-[#4A3C31] outline-none transition-all font-medium ${isOtpSent ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-[#FAFAFA] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B]'}`}
                                        placeholder="admin@smartbakehub.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {!isOtpSent && (
                                <div>
                                    <button
                                        type="button" onClick={handleSendOtp}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-[#C8843B] hover:bg-[#b07332] focus:outline-none transition-all cursor-pointer"
                                    >
                                        Send OTP to Email
                                    </button>
                                </div>
                            )}

                            {/* OTP Field (Visible if OTP is sent) */}
                            {isOtpSent && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                        Enter 6-digit OTP {isOtpVerified && <span className="text-green-500 ml-2">✓ Verified</span>}
                                    </label>
                                    <div className="relative group flex gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                {isOtpVerified ? <CheckCircle className="h-5 w-5 text-green-500" /> : <KeyRound className="h-5 w-5 text-gray-400" />}
                                            </div>
                                            <input
                                                type="text" required={!isOtpVerified} maxLength="6" disabled={isOtpVerified}
                                                className={`block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-center text-xl font-bold tracking-[0.5em] transition-all ${isOtpVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B]'}`}
                                                placeholder="------"
                                                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                        {!isOtpVerified && (
                                            <button
                                                type="button" onClick={handleVerifyOtp}
                                                className="px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#3D291F] hover:bg-[#2E1A12] focus:outline-none transition-all cursor-pointer whitespace-nowrap"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                    {!isOtpVerified && (
                                        <div className="flex items-center justify-end mt-2">
                                            <button type="button" onClick={handleResendOtp} className="text-[10px] font-bold text-[#A67B5B] hover:text-[#8c5e35] transition-colors">
                                                Resend Code
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Password Fields (Always visible, but disabled until OTP verified) */}
                            <div className={`space-y-6 transition-all duration-500 ${!isOtpVerified ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100 grayscale-0'}`}>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Create New Password
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"} required={isOtpVerified} disabled={!isOtpVerified}
                                            className="block w-full pl-10 pr-10 sm:text-sm border border-gray-200 rounded-xl py-3.5 bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button type="button" disabled={!isOtpVerified} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#C8843B]" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-[#C8843B]" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"} required={isOtpVerified} disabled={!isOtpVerified}
                                            className="block w-full pl-10 pr-10 sm:text-sm border border-gray-200 rounded-xl py-3.5 bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Final Submit Button */}
                            {isOtpVerified && (
                                <div className="animate-fade-in pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#C8843B] hover:bg-[#A67B5B] focus:outline-none transition-all duration-300 cursor-pointer"
                                    >
                                        Setup System & Create Admin
                                    </button>
                                </div>
                            )}

                        </form>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default AdminSetup;
