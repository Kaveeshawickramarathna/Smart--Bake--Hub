import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const { data } = await api.get('/auth/setup-status');
                if (data.isFirstSetup) {
                    navigate('/admin/setup');
                }
            } catch (error) {
                console.error('Failed to check setup status', error);
            }
        };
        checkSetup();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            if (data.role !== 'admin') {
                toast.error('Access denied. Admin portal only.');
                return;
            }
            
            login(data);
            toast.success('Welcome to the Admin Dashboard');
            window.location.href = '/admin';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#fef9e1] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#2E1A12]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <ScrollReveal variant="fade-up" duration={800}>
                    <div className="flex justify-center mb-4">
                        <img src="/images/logo.png" alt="Smart Bake Hub" className="w-20 h-20 rounded-full shadow-sm bg-white object-contain border-2 border-[#E8DCC8]" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-[#4A3C31] font-serif leading-none">
                        Smart Bake Hub
                    </h2>
                    <p className="text-center text-[10px] font-bold text-[#C8843B] tracking-widest uppercase mt-2.5">
                        Admin Portal
                    </p>
                </ScrollReveal>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <ScrollReveal variant="zoom-in" duration={900} delay={150}>
                    <div className="bg-white py-8 px-6 shadow-xl rounded-[32px] sm:px-10 border border-[#E8DCC8]/30">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Email Address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 sm:text-sm border border-gray-200 rounded-xl py-3.5 bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] outline-none transition-all text-sm font-medium"
                                        placeholder="admin@smartbakehub.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 pr-10 sm:text-sm border border-gray-200 rounded-xl py-3.5 bg-[#FAFAFA] text-[#4A3C31] focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] outline-none transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-[#C8843B] transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-semibold">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-[#C8843B] focus:ring-[#C8843B] border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-[#4A3C31]">
                                        Remember me
                                    </label>
                                </div>

                                <div>
                                    <Link to="/forgot-password" className="font-medium text-[#C8843B] hover:text-[#8c5e35]">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-[#4A3C31] hover:bg-[#3D291F] focus:outline-none transition-all cursor-pointer"
                                >
                                    Sign in to Dashboard
                                </button>
                            </div>
                        </form>
                    </div>
                </ScrollReveal>
                
                <ScrollReveal variant="fade-up" duration={800} delay={300}>
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 text-xs font-bold text-[#A67B5B] hover:text-[#4A3C31] transition-colors bg-white/40 border border-gray-200/50 px-4 py-2 rounded-full shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </button>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default AdminLogin;
