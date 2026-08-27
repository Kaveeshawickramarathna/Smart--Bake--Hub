import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, Mail, User as UserIcon, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const Register = () => {
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
            toast.success('Account created successfully!', { duration: 3000 });
            login(data);
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-[#4A3C31] bg-[#fef9e1] py-12 px-4 sm:px-6 lg:px-8">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="/images/auth_bakery_basket.png" 
                    alt="Bakery Background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[#F4EFE6]/60 backdrop-blur-[2px]"></div>
            </div>

            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-60 -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E8DCC8] rounded-full blur-3xl opacity-50 translate-y-1/4 pointer-events-none"></div>

            <ScrollReveal variant="zoom-in" duration={1000} delay={100} className="w-full max-w-md relative z-20">
                <div className="bg-[#FFFCF9]/95 backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(74,60,49,0.08)] p-8 sm:p-12 border border-white">
                    
                    <div className="flex flex-col items-center mb-8 relative">
                        <img src="/images/logo.png" alt="Smart Bake Hub" className="w-16 h-16 rounded-full shadow-sm bg-white object-contain mb-4" />
                        <h2 className="text-3xl font-bold text-[#4A3C31] tracking-tight font-serif text-center">
                            Create Account
                        </h2>
                        <p className="text-xs text-gray-500 font-semibold mt-2 text-center">
                            Smart Bake Hub Registration
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleFinalSubmit}>
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="text" required disabled={isOtpSent}
                                    className={`block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm font-medium transition-all ${isOtpSent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] placeholder-gray-400'}`}
                                    placeholder="Full Name"
                                    value={name} onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="email" required disabled={isOtpSent}
                                    className={`block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm font-medium transition-all ${isOtpSent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] placeholder-gray-400'}`}
                                    placeholder="Email Address"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {!isOtpSent && (
                            <div>
                                <button
                                    type="button" onClick={handleSendOtp}
                                    className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-[#C8843B] hover:bg-[#b07332] focus:outline-none transition-all cursor-pointer shadow-md"
                                >
                                    Send OTP to Email
                                </button>
                            </div>
                        )}

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

                        <div className={`space-y-6 transition-all duration-500 ${!isOtpVerified ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100 grayscale-0'}`}>
                            <div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"} required={isOtpVerified} disabled={!isOtpVerified}
                                        className="block w-full pl-11 pr-12 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                        placeholder="Create Password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button type="button" disabled={!isOtpVerified} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"} required={isOtpVerified} disabled={!isOtpVerified}
                                        className="block w-full pl-11 pr-12 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                        placeholder="Confirm Password"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {isOtpVerified && (
                            <div className="animate-fade-in pt-2">
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-[#3D291F] hover:bg-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D291F] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                                >
                                    Complete Sign Up
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-500 font-semibold mb-6">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-[#A67B5B] hover:text-[#8c5e35] transition-colors">
                                Log In
                            </Link>
                        </p>
                        
                        <div className="flex justify-center mt-2">
                            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#C8843B] transition-colors bg-gray-50 hover:bg-[#FDF6ED] px-4 py-2 rounded-full">
                                <ArrowLeft className="w-4 h-4" /> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
};

export default Register;
