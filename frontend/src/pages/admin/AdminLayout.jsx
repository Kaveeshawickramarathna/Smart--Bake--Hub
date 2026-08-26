import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
    LayoutDashboard, Users, ShoppingCart, Package, Box, Calendar, 
    Sparkles, FileText, Bell, Settings, LogOut, ChevronDown, Menu, Utensils, QrCode, Coffee, MessageSquare, Image
} from 'lucide-react';
import LogoutConfirmation from '../../components/LogoutConfirmation';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastNotificationId, setLastNotificationId] = useState(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            const notifications = response.data;
            const unread = notifications.filter(n => !n.is_read);
            setUnreadCount(unread.length);

            // Check if there's a NEW notification to show a toast
            if (notifications.length > 0) {
                const latestId = notifications[0].id;
                if (lastNotificationId !== null && latestId > lastNotificationId) {
                    // It's a new notification!
                    toast.success(notifications[0].title, {
                        icon: '🔔',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                }
                setLastNotificationId(latestId);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [lastNotificationId]);

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/admin/login');
    };

    const navigation = [
        { name: 'Dashboard', href: user?.role === 'staff' ? '/staff' : '/admin', icon: LayoutDashboard },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Dishes', href: '/admin/menus', icon: Utensils },
        { name: 'Beverages', href: '/admin/beverages', icon: Coffee },
        { name: 'Catering Packages', href: '/admin/catering-packages', icon: Package },
        { name: 'Inventory', href: '/admin/inventory', icon: Box },
        { name: 'QR Codes', href: '/admin/qrcodes', icon: QrCode },
        { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
        { name: 'Events & Booking', href: '/admin/events', icon: Calendar },
        { name: 'Premium Add-Ons', href: '/admin/premium-addons', icon: Sparkles },
        { name: 'Cakes', href: '/admin/cake-designs', icon: Image },
        { name: 'Reports', href: '/admin/reports', icon: FileText },
        { name: 'Chat Support', href: '/admin/chat', icon: MessageSquare },
    ];

    return (
        <div className="flex h-screen bg-[#F7F4ED] font-sans overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-[#2E1A12]/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 w-64 bg-[#F7F4ED] border-r border-[#C8843B]/20 flex flex-col justify-between overflow-y-auto custom-scrollbar`}>
                <div>
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6 gap-3 mb-4">
                        <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white shadow-sm" />
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-[#2E1A12] leading-tight font-serif">Smart Bake Hub</span>
                            <span className="text-[10px] text-[#C8843B] font-medium tracking-wide">Smarter Bakery. Better Business.</span>
                        </div>
                    </div>

                    {/* Main Nav */}
                    <nav className="px-4 space-y-1">
                        {navigation.map((item) => {
                            if (item.adminOnly && user?.role !== 'admin') return null;
                            // Active when pathname equals or is a sub-route of the item href
                            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/') ;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-[#2E1A12] text-white shadow-md' : 'text-[#2E1A12]/80 hover:bg-[#C8843B]/10 hover:text-[#2E1A12]'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="w-5 h-5" strokeWidth={2} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 opacity-0" />
                                </Link>
                            );
                        })}

                        {/* AI Insights Dropdown */}
                        <div className="pt-2 pb-1">
                            <button 
                                onClick={() => setIsAiInsightsOpen(!isAiInsightsOpen)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${isAiInsightsOpen || location.pathname.includes('/admin/ai') ? 'bg-[#2E1A12] text-white shadow-md' : 'text-[#2E1A12]/80 hover:bg-[#C8843B]/10 hover:text-[#2E1A12]'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Sparkles className="w-5 h-5 text-[#C8843B]" strokeWidth={2} />
                                    <span className="font-medium text-sm">AI Insights</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isAiInsightsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isAiInsightsOpen && (
                                <div className="mt-2 ml-4 pl-6 border-l border-[#C8843B]/30 space-y-1 relative">
                                    {/* Dynamic Active Indicator Line */}
                                    {location.pathname === '/admin' ? (
                                        <div className="absolute left-[-1px] top-3 w-[2px] bg-[#C8843B] rounded-r h-4 transition-all duration-300"></div>
                                    ) : location.pathname === '/admin/ai/waste' ? (
                                        <div className="absolute left-[-1px] top-[44px] w-[2px] bg-[#C8843B] rounded-r h-4 transition-all duration-300"></div>
                                    ) : null}
                                    <Link 
                                        to="/admin" 
                                        className={`block py-2 text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-[#C8843B]' : 'text-[#2E1A12]/70 hover:text-[#2E1A12]'}`}
                                    >
                                        Demand Forecasting Management
                                    </Link>
                                    <Link 
                                        to="/admin/ai/waste" 
                                        className={`block py-2 text-sm font-medium transition-colors ${location.pathname === '/admin/ai/waste' ? 'text-[#C8843B]' : 'text-[#2E1A12]/70 hover:text-[#2E1A12]'}`}
                                    >
                                        Food Waste Reduction
                                    </Link>
                                </div>
                            )}
                        </div>

                    </nav>
                </div>

            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F4ED] rounded-tl-3xl border-t border-l border-[#C8843B]/20 shadow-[-10px_0_30px_rgba(46,26,18,0.03)]">
                <header className="h-20 bg-[#F7F4ED] flex items-center justify-between px-8">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-[#FFFDFC] transition-colors lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-[#2E1A12]">Hi, {user?.name || 'Admin'}</span>
                                <span className="text-[11px] font-medium text-[#2E1A12]/60 capitalize">{user?.role || 'Administrator'}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#FFFDFC] flex items-center justify-center overflow-hidden border border-[#C8843B]/30 shadow-sm">
                                <Users className="w-5 h-5 text-[#C8843B]" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 border-l border-[#C8843B]/20 pl-6">
                            <Link to="/admin/notifications" className="relative p-2 rounded-full text-[#2E1A12] hover:bg-[#FFFDFC] hover:text-[#C8843B] transition-colors" title="Notifications">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#F7F4ED] text-[9px] font-bold text-white flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                            
                            <Link to="/admin/settings" className="p-2 rounded-full text-[#2E1A12] hover:bg-[#FFFDFC] hover:text-[#C8843B] transition-colors" title="Settings">
                                <Settings className="w-5 h-5" />
                            </Link>

                            <button onClick={() => setShowLogoutModal(true)} className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>
                
                <main className="flex-1 overflow-auto bg-[#F7F4ED] px-8 pb-8 pt-4 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
            
            <LogoutConfirmation 
                isOpen={showLogoutModal}
                onConfirm={handleConfirmLogout}
                onCancel={() => setShowLogoutModal(false)}
            />

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(200, 132, 59, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(200, 132, 59, 0.6);
                }
            `}} />
        </div>
    );
};

export default AdminLayout;
