import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = () => {
        try {
            const raw = localStorage.getItem('cart');
            const items = raw ? JSON.parse(raw) : [];
            const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(count);
        } catch (e) {
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        window.addEventListener('cartUpdate', updateCartCount);
        window.addEventListener('storage', updateCartCount);
        return () => {
            window.removeEventListener('cartUpdate', updateCartCount);
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    const getLinkClass = (path) => {
        const base = "font-medium text-sm transition-colors pb-1";
        const active = "text-[#C8843B] border-b-2 border-[#C8843B]";
        const inactive = "text-[#2E1A12] hover:text-[#C8843B]";
        return `${base} ${location.pathname === path ? active : inactive}`;
    };

    return (
        <header className="bg-[#FFFDFC] sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 lg:gap-4 hover:opacity-90 transition-opacity">
                    <img src="/images/logo.png" alt="Wijayasiri Logo" className="w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-sm bg-white object-contain" />
                    <div className="flex flex-col justify-center">
                        <span className="text-2xl font-bold text-[#4A3C31] leading-none tracking-tight font-serif">Smart Bake Hub</span>
                        <span className="text-[10px] font-semibold text-[#A67B5B] uppercase tracking-widest mt-1.5 font-sans">WIJAYASIRI FRESH FOOD (PVT) LTD.</span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden lg:flex items-center gap-10">
                    <Link to="/" className={getLinkClass('/')}>Home</Link>
                    <Link to="/menus" className={getLinkClass('/menus')}>Food Menu</Link>
                    <Link to="/catering" className={getLinkClass('/catering')}>Catering</Link>
                    <Link to="/bookings" className={getLinkClass('/bookings')}>Events</Link>
                    <Link to="/about" className={getLinkClass('/about')}>About Us</Link>
                    <Link to="/contact" className={getLinkClass('/contact')}>Contact Us</Link>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-8">
                    {/* Cart */}
                    <Link to="/order" className="relative cursor-pointer text-[#2E1A12] hover:text-[#C8843B] transition-colors">
                        <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-[#C8843B] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#FFFDFC] animate-[pulse_2s_infinite]">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Auth Status - Desktop */}
                    {user ? (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/profile" className="text-sm font-semibold text-[#2E1A12] hover:text-[#C8843B] transition-colors">
                                {user.name}
                            </Link>
                            <button onClick={logout} className="bg-[#2E1A12] text-white font-medium px-4 py-2 rounded-full text-xs hover:bg-[#C8843B] transition-colors cursor-pointer">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="hidden md:flex bg-[#2E1A12] text-white font-medium px-6 py-2.5 rounded-full text-sm hover:bg-[#C8843B] transition-colors">
                            Login / Register
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                        className="lg:hidden text-[#2E1A12] hover:text-[#C8843B] transition-colors cursor-pointer focus:outline-none"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#FFFDFC] border-t border-gray-100 px-6 py-4 flex flex-col gap-4 shadow-inner animate-[fadeIn_0.2s_ease-out]">
                    <nav className="flex flex-col gap-3">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`${location.pathname === '/' ? 'text-[#C8843B] font-semibold' : 'text-[#2E1A12]'} text-sm py-1`}>Home</Link>
                        <Link to="/menus" onClick={() => setMobileMenuOpen(false)} className={`${location.pathname === '/menus' ? 'text-[#C8843B] font-semibold' : 'text-[#2E1A12]'} text-sm py-1`}>Food Menu</Link>
                        <Link to="/catering" onClick={() => setMobileMenuOpen(false)} className={`${location.pathname === '/catering' ? 'text-[#C8843B] font-semibold' : 'text-[#2E1A12]'} text-sm py-1`}>Catering</Link>
                        <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className={`${location.pathname === '/bookings' ? 'text-[#C8843B] font-semibold' : 'text-[#2E1A12]'} text-sm py-1`}>Events</Link>
                        <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`${location.pathname === '/about' ? 'text-[#C8843B] font-semibold' : 'text-[#2E1A12]'} text-sm py-1`}>About Us</Link>
                        <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={`${location.pathname === '/contact' ? 'text-[#C8843B] font-semibold' : 'text-[#2E1A12]'} text-sm py-1`}>Contact Us</Link>
                    </nav>
                    
                    {/* Auth Status - Mobile */}
                    <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
                        {user ? (
                            <>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#2E1A12]">
                                    {user.name}
                                </Link>
                                <button 
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }} 
                                    className="bg-[#2E1A12] text-white font-medium px-4 py-2.5 rounded-full text-center text-xs hover:bg-[#C8843B] transition-colors w-full cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link 
                                to="/login" 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="bg-[#2E1A12] text-white font-medium px-6 py-2.5 rounded-full text-center text-sm hover:bg-[#C8843B] transition-colors w-full"
                            >
                                Login / Register
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
