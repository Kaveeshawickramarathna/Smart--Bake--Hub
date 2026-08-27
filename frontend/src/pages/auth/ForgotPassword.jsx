import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            if (data.devOtp) {
                toast.success('OTP generated (Dev Mode, check console or use: ' + data.devOtp + ')', { duration: 6000 });
            } else {
                toast.success(data.message, { duration: 6000 });
            }
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden font-sans text-[#4A3C31] bg-[#fef9e1]">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="/images/auth_bakery_basket.png" 
                    alt="Bakery Background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[#F4EFE6]/30"></div>
                <div className="absolute inset-y-0 left-0 w-full lg:w-[60%] bg-gradient-to-r from-[#F4EFE6]/90 via-[#F4EFE6]/60 to-transparent"></div>
            </div>

            {/* Left Side: Branding */}
            <div className="w-full lg:w-[55%] flex flex-col relative z-10 min-h-[40vh] lg:min-h-screen px-8 pb-8 pt-4 lg:px-16 lg:pb-16 lg:pt-8">
                {/* Logo */}
                <div className="flex items-center gap-3 lg:gap-4 mb-6">
                    <img src="/images/logo.png" alt="Wijayasiri Logo" className="w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-sm bg-white object-contain" />
                    <div className="flex flex-col justify-center">
                        <span className="text-2xl lg:text-[28px] font-bold text-[#4A3C31] leading-none tracking-tight font-serif">Smart Bake Hub</span>
                        <span className="text-[9px] lg:text-[10px] font-semibold text-[#A67B5B] uppercase tracking-widest mt-1.5 font-sans">WIJAYASIRI FRESH FOOD (PVT) LTD.</span>
                    </div>
                </div>

                <div className="mb-12 lg:mb-16">
                    <Link to="/secure-login" className="inline-flex items-center gap-2 text-xs font-bold text-[#4A3C31] hover:text-[#C8843B] transition-colors border border-transparent hover:border-[#C8843B]/30 bg-white/40 hover:bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-max">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
                <ScrollReveal variant="zoom-in" duration={1000} delay={200} className="w-full max-w-[420px]">
                    <div className="bg-[#FFFCF9]/90 backdrop-blur-xl rounded-[40px] shadow-[0_20px_40px_rgba(74,60,49,0.05)] p-10 lg:p-12 border border-white relative z-20">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#4A3C31] tracking-tight font-serif mb-3">
                                Reset Password
                            </h2>
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-[1px] w-8 bg-[#A67B5B]/30"></div>
                                <KeyRound className="w-4.5 h-4.5 text-[#C8843B]" />
                                <div className="h-[1px] w-8 bg-[#A67B5B]/30"></div>
                            </div>
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                                Enter your email address and we'll send you a 6-digit OTP to reset your password.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="email" required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                    placeholder="Enter your registered email"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex justify-center py-4 px-4 text-xs font-bold rounded-xl text-white bg-[#3D291F] hover:bg-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-[#3D291F] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500 font-semibold">
                                Remembered your password?{' '}
                                <Link to="/secure-login" className="font-bold text-[#A67B5B] hover:text-[#8c5e35] transition-colors">
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default ForgotPassword;
