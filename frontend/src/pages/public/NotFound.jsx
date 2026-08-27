import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#F7F4ED] flex flex-col items-center justify-center p-4">
            <ScrollReveal variant="fade-up">
                <div className="bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-[40px] shadow-[0_20px_40px_rgba(46,26,18,0.05)] border border-[#C8843B]/20 text-center max-w-md w-full relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8843B]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2E1A12]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#FFFDFC] rounded-full border border-[#C8843B]/20 flex items-center justify-center shadow-inner mb-8">
                            <AlertTriangle className="w-12 h-12 text-[#C8843B]" />
                        </div>
                        
                        <h1 className="text-7xl font-black font-serif text-[#2E1A12] mb-4">404</h1>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Page Not Found</h2>
                        <p className="text-gray-500 font-medium text-sm mb-10 max-w-[280px]">
                            Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
                        </p>
                        
                        <Link 
                            to="/"
                            className="w-full flex items-center justify-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white py-4 rounded-2xl font-bold shadow-[0_8px_20px_rgba(46,26,18,0.15)] hover:shadow-[0_8px_25px_rgba(200,132,59,0.25)] transition-all duration-300"
                        >
                            <Home className="w-5 h-5" />
                            <span>Return to Home</span>
                        </Link>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
};

export default NotFound;
