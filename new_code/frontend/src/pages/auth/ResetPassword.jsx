import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (!token) {
            return toast.error('Reset token is missing from the URL');
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password', { token, newPassword });
            toast.success(data.message || 'Password reset successful!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden font-sans text-[#4A3C31] bg-[#fef9e1]">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="/images/auth_bakery_basket.png" 
                    alt="Bakery Background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[#F4EFE6]/30"></div>
                <div className="absolute inset-y-0 left-0 w-full lg:w-[60%] bg-gradient-to-r from-[#F4EFE6]/90 via-[#F4EFE6]/60 to-transparent"></div>
            </div>

            {/* Left Side */}
            <div className="w-full lg:w-[55%] flex flex-col relative z-10 min-h-[40vh] lg:min-h-screen px-8 pb-8 pt-4 lg:px-16 lg:pb-16 lg:pt-8">
                <div className="flex items-center gap-3 lg:gap-4 mb-6">
                    <img src="/images/logo.png" alt="Wijayasiri Logo" className="w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-sm bg-white object-contain" />
                    <div className="flex flex-col justify-center">
                        <span className="text-2xl lg:text-[28px] font-bold text-[#4A3C31] leading-none tracking-tight font-serif">Smart Bake Hub</span>
                        <span className="text-[9px] lg:text-[10px] font-semibold text-[#A67B5B] uppercase tracking-widest mt-1.5 font-sans">WIJAYASIRI FRESH FOOD (PVT) LTD.</span>
                    </div>
                </div>

                <div className="mb-12 lg:mb-16">
                    <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#4A3C31] hover:text-[#C8843B] transition-colors border border-transparent hover:border-[#C8843B]/30 bg-white/40 hover:bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-max">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
                <ScrollReveal variant="zoom-in" duration={1000} delay={200} className="w-full max-w-[420px]">
                    <div className="bg-[#FFFCF9]/90 backdrop-blur-xl rounded-[40px] shadow-[0_20px_40px_rgba(74,60,49,0.05)] p-10 lg:p-12 border border-white relative z-20">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#4A3C31] tracking-tight font-serif mb-3">
                                New Password
                            </h2>
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-[1px] w-8 bg-[#A67B5B]/30"></div>
                                <KeyRound className="w-4.5 h-4.5 text-[#C8843B]" />
                                <div className="h-[1px] w-8 bg-[#A67B5B]/30"></div>
                            </div>
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                                Enter your new password below.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                    placeholder="New Password"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />
                                    )}
                                </button>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                    placeholder="Confirm Password"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex justify-center py-4 px-4 text-xs font-bold rounded-xl text-white bg-[#3D291F] hover:bg-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-[#3D291F] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default ResetPassword;
