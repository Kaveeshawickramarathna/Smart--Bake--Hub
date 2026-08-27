import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, Mail, Shield, ArrowLeft, Eye, EyeOff, Briefcase } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            toast.success('Logged in successfully');
            login(data);

            if (data.role === 'admin') {
                window.location.href = '/admin';
            } else if (data.role === 'staff') {
                window.location.href = '/secure-staff-portal';
            } else {
                window.location.href = '/profile';
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
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
                            Welcome Back
                        </h2>
                        <p className="text-xs text-gray-500 font-semibold mt-2 text-center">
                            Log in to your Smart Bake Hub account
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="email" required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                    placeholder="Email Address"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#C8843B] transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#4A3C31] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all text-sm font-medium"
                                    placeholder="Password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-1 mb-6">
                            <Link to="/forgot-password" className="text-xs font-semibold text-[#C8843B] hover:text-[#8c5e35] transition-colors">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-[#3D291F] hover:bg-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D291F] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Log In
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-500 font-semibold mb-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-[#A67B5B] hover:text-[#8c5e35] transition-colors">
                                Sign Up
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

export default Login;
