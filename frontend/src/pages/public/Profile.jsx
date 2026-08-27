import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
    User, Mail, Lock, Key, ArrowLeft, Shield, Save,
    ShoppingBag, Calendar as CalendarIcon, Settings,
    Clock, Package, Utensils, ShoppingCart, LogOut, Store, Menu, Bell, ChevronRight, Check
} from 'lucide-react';
import LogoutConfirmation from '../../components/LogoutConfirmation';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ScrollReveal from '../../components/ScrollReveal';

const Profile = () => {
    const { user, login, logout } = useAuthStore();
    const navigate = useNavigate();
    
    // Tab state
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'bookings', 'settings'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Profile settings state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Orders and Bookings state
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Cart state
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

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (activeTab === 'orders' || activeTab === 'bookings') {
            fetchUserData();
        } else if (activeTab === 'notifications') {
            markAllAsRead();
        }
    }, [activeTab]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const fetchUserData = async () => {
        setLoadingData(true);
        try {
            if (activeTab === 'orders') {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data);
            } else if (activeTab === 'bookings') {
                const { data } = await api.get('/bookings');
                setBookings(data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updateData = { name, email };
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    toast.error("New passwords do not match!");
                    setIsSaving(false);
                    return;
                }
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            const { data } = await api.put('/users/profile', updateData);
            login({ ...user, ...data });
            toast.success("Profile updated successfully!");

            setCurrentPassword('');
            newPassword && setNewPassword('');
            confirmPassword && setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ready': return 'bg-green-100 text-green-800 border-green-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

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
                            <span className="text-[10px] text-[#C8843B] font-medium tracking-wide">Customer Dashboard</span>
                        </div>
                    </div>

                    {/* Main Nav */}
                    <nav className="px-4 space-y-2">
                        <button 
                            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#2E1A12] text-white shadow-md' : 'text-[#2E1A12]/80 hover:bg-[#C8843B]/10 hover:text-[#2E1A12]'}`}
                        >
                            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                            <span className="font-medium text-sm">My Food Orders</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-[#2E1A12] text-white shadow-md' : 'text-[#2E1A12]/80 hover:bg-[#C8843B]/10 hover:text-[#2E1A12]'}`}
                        >
                            <CalendarIcon className="w-5 h-5" strokeWidth={2} />
                            <span className="font-medium text-sm">My Event Bookings</span>
                        </button>
                    </nav>
                </div>
                
                {/* Quick Actions at bottom of sidebar */}
                <div className="p-4 space-y-2 mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Quick Actions</p>
                    <Link to="/menus" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#2E1A12] hover:bg-[#C8843B] hover:text-white transition-all w-full border border-[#C8843B]/20 shadow-sm">
                        <Utensils className="w-4 h-4" /> Order Fresh Food
                    </Link>
                    <Link to="/bookings" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C8843B]/10 text-[#C8843B] hover:bg-[#C8843B] hover:text-white transition-all w-full border border-[#C8843B]/30 shadow-sm">
                        <CalendarIcon className="w-4 h-4" /> Book an Event
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F4ED] lg:rounded-tl-3xl border-t border-l border-[#C8843B]/20 shadow-[-10px_0_30px_rgba(46,26,18,0.03)]">
                <header className="h-20 bg-[#F7F4ED] flex items-center justify-between px-6 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-white transition-colors lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        {/* Back to store */}
                        <Link to="/" className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#4A3C31] hover:text-[#C8843B] transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            <Store className="w-3.5 h-3.5" /> Back to Store
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'staff') && (
                            <Link to="/admin" className="hidden sm:flex items-center gap-2 text-xs font-bold text-white hover:text-white transition-colors bg-[#2E1A12] hover:bg-[#1a0f0a] px-3 py-1.5 rounded-full">
                                <Shield className="w-3.5 h-3.5 text-[#C8843B]" /> Admin Area
                            </Link>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        {/* Profile Area */}
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-semibold text-[#2E1A12]">Hi, {user?.name || 'Customer'}</span>
                                <span className="text-[11px] font-medium text-[#2E1A12]/60 capitalize">{user?.role || 'Customer'}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#C8843B]/30 shadow-sm">
                                <User className="w-5 h-5 text-[#C8843B]" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 lg:space-x-2 border-l border-[#C8843B]/20 pl-4 lg:pl-6">
                            <Link to="/order" className="relative p-2 rounded-full text-[#2E1A12] hover:bg-white hover:text-[#C8843B] transition-colors" title="Cart">
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-[#C8843B] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            
                            <button onClick={() => setActiveTab('notifications')} className="relative p-2 rounded-full text-[#2E1A12] hover:bg-white hover:text-[#C8843B] transition-colors" title="Notifications">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F7F4ED]"></span>
                                )}
                            </button>
                            
                            <button onClick={() => setActiveTab('settings')} className="p-2 rounded-full text-[#2E1A12] hover:bg-white hover:text-[#C8843B] transition-colors" title="Settings">
                                <Settings className="w-5 h-5" />
                            </button>

                            <button onClick={() => setShowLogoutModal(true)} className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>
                
                <main className="flex-1 overflow-auto bg-[#F7F4ED] px-4 lg:px-8 pb-8 pt-4 custom-scrollbar">
                    <div className="w-full min-h-full bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-[#e6dfd5]/40">
                            {/* ---------------- ORDERS TAB ---------------- */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-serif mb-6 text-[#2E1A12] flex items-center gap-3">
                                        <ShoppingBag className="w-6 h-6 text-[#C8843B]" /> My Food Orders
                                    </h3>

                                    {loadingData ? (
                                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8843B]"></div></div>
                                    ) : orders.length === 0 ? (
                                        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="font-bold text-[#2E1A12]">No Orders Yet</h4>
                                            <p className="text-xs text-gray-400 mt-2">You haven't placed any food orders yet. Explore our menus!</p>
                                            <Link to="/menus" className="mt-4 inline-block bg-[#2E1A12] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#C8843B] transition-colors shadow-md">Explore Menu</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => {
                                                const totalQuantity = order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;
                                                let readyTime = null;
                                                if (order.prep_time) {
                                                    readyTime = new Date(new Date(order.created_at).getTime() + order.prep_time * 60000);
                                                }
                                                const isFinalStatus = ['ready', 'completed', 'cancelled'].includes(order.status);
                                                
                                                return (
                                                <div key={order.id} className="border border-[#e6dfd5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-[#2E1A12]">Order #{order.id}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</div>
                                                            <div className="text-lg font-black text-[#C8843B]">Rs. {Number(order.total_amount).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Type:</span>
                                                            <span className="text-xs font-semibold capitalize bg-gray-100 px-2 py-1 rounded-md text-gray-600 flex items-center gap-1">
                                                                {order.order_type === 'dine-in' ? <Utensils className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                                                {order.order_type}
                                                            </span>
                                                        </div>
                                                        {!isFinalStatus && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-[#C8843B] uppercase tracking-wider">Ready Time:</span>
                                                                {readyTime ? (
                                                                    <span className="text-xs font-bold bg-[#C8843B]/10 text-[#C8843B] px-2 py-1 rounded-md flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {readyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                                                                        Pending Admin Approval
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Items summary:</p>
                                                        <ul className="text-sm font-medium text-[#2E1A12] space-y-2">
                                                            {order.items && order.items.map((item, idx) => (
                                                                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                                                    <span className="flex items-center gap-2">
                                                                        <span className="w-5 h-5 bg-[#C8843B]/10 text-[#C8843B] rounded flex items-center justify-center text-[10px] font-bold">{item.quantity}x</span>
                                                                        {item.item_name || item.menu_name || item.product_name || item.beverage_name || 'Unknown Item'}
                                                                    </span>
                                                                    <span className="text-gray-500 text-xs font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* ---------------- BOOKINGS TAB ---------------- */}
                            {activeTab === 'bookings' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-serif mb-6 text-[#2E1A12] flex items-center gap-3">
                                        <CalendarIcon className="w-6 h-6 text-[#C8843B]" /> My Event Bookings
                                    </h3>

                                    {loadingData ? (
                                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8843B]"></div></div>
                                    ) : bookings.length === 0 ? (
                                        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                                            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="font-bold text-[#2E1A12]">No Events Booked</h4>
                                            <p className="text-xs text-gray-400 mt-2">You haven't requested any event spaces yet.</p>
                                            <Link to="/bookings" className="mt-4 inline-block bg-[#2E1A12] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#C8843B] transition-colors shadow-md">Book an Event</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookings.map(booking => (
                                                <div key={booking.id} className="border border-[#e6dfd5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50/50">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-5 border-b border-gray-200 border-dashed">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-[#2E1A12]">Booking #{booking.id}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-lg font-serif font-bold text-[#C8843B]">
                                                                {booking.event_type} <span className="text-gray-400 text-sm font-sans mx-1">at</span> {booking.hall_name}
                                                            </div>
                                                        </div>
                                                        <div className="text-right bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Estimated Total</div>
                                                            <div className="text-xl font-black text-[#C8843B]">Rs. {Number(booking.total_price).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                            <p className="text-[10px] font-bold text-[#C8843B] uppercase mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date</p>
                                                            <p className="text-xs font-bold text-[#2E1A12]">{formatDate(booking.event_date)}</p>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                            <p className="text-[10px] font-bold text-[#C8843B] uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Session</p>
                                                            <p className="text-xs font-bold text-[#2E1A12] capitalize">{booking.event_session}</p>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                            <p className="text-[10px] font-bold text-[#C8843B] uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Guests</p>
                                                            <p className="text-xs font-bold text-[#2E1A12]">{booking.guest_count} Pax</p>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                            <p className="text-[10px] font-bold text-[#C8843B] uppercase mb-1 flex items-center gap-1"><Package className="w-3 h-3"/> Package</p>
                                                            <p className="text-xs font-bold text-[#2E1A12]">{booking.package_name}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {booking.add_ons && booking.add_ons.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Selected Add-ons</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {booking.add_ons.map((addon, idx) => (
                                                                    <span key={idx} className="bg-[#FDF6ED] text-[#C8843B] px-3 py-1.5 rounded-lg border border-[#C8843B]/20 text-[10px] font-bold capitalize shadow-sm">
                                                                        {addon}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ---------------- SETTINGS TAB ---------------- */}
                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-serif mb-6 text-[#2E1A12] flex items-center gap-3">
                                        <Settings className="w-6 h-6 text-[#C8843B]" /> Account Settings
                                    </h3>
                                    
                                    <form onSubmit={handleUpdateProfile} className="space-y-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                                                <User className="w-4 h-4 text-[#C8843B]" />
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E1A12]">Personal Details</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                        </span>
                                                        <input
                                                            type="text" required
                                                            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] font-medium shadow-sm transition-shadow"
                                                            value={name} onChange={(e) => setName(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                        </span>
                                                        <input
                                                            type="email" required
                                                            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] font-medium shadow-sm transition-shadow"
                                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-[#C8843B]" />
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E1A12]">Security & Password</h4>
                                                </div>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase bg-white px-2 py-1 rounded border border-gray-200">Optional</span>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="space-y-1.5 max-w-md">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Current Password</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <Lock className="h-4 w-4 text-gray-400" />
                                                        </span>
                                                        <input
                                                            type="password"
                                                            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] font-medium shadow-sm transition-shadow"
                                                            placeholder="Enter current password to change it"
                                                            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">New Password</label>
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                <Key className="h-4 w-4 text-gray-400" />
                                                            </span>
                                                            <input
                                                                type="password"
                                                                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] font-medium shadow-sm transition-shadow"
                                                                placeholder="Min 6 characters"
                                                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Confirm Password</label>
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                <Key className="h-4 w-4 text-gray-400" />
                                                            </span>
                                                            <input
                                                                type="password"
                                                                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] font-medium shadow-sm transition-shadow"
                                                                placeholder="Repeat new password"
                                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                type="submit" disabled={isSaving}
                                                className="flex items-center justify-center gap-2 bg-[#2E1A12] text-white font-bold py-3.5 px-8 rounded-xl text-xs hover:bg-[#C8843B] transition-all shadow-md cursor-pointer disabled:opacity-50"
                                            >
                                                {isSaving ? "Saving..." : (
                                                    <>
                                                        <Save className="w-4 h-4" /> Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ---------------- NOTIFICATIONS TAB ---------------- */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-serif mb-6 text-[#2E1A12] flex items-center gap-3">
                                        <Bell className="w-6 h-6 text-[#C8843B]" /> Notifications
                                    </h3>
                                    
                                    {notifications.length === 0 ? (
                                        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="font-bold text-[#2E1A12]">No Notifications</h4>
                                            <p className="text-xs text-gray-400 mt-2">You don't have any notifications yet. Check back later!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {notifications.map(notification => (
                                                <div key={notification.id} className={`p-4 rounded-xl border ${notification.is_read ? 'bg-white border-gray-100' : 'bg-[#FDF6ED] border-[#C8843B]/20'} shadow-sm flex items-start gap-4 transition-colors`}>
                                                    <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 text-gray-400' : 'bg-[#C8843B]/10 text-[#C8843B]'}`}>
                                                        <Bell className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-bold ${notification.is_read ? 'text-gray-700' : 'text-[#2E1A12]'}`}>{notification.title}</h4>
                                                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(notification.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    {!notification.is_read && (
                                                        <div className="w-2 h-2 rounded-full bg-[#C8843B] mt-2"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
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

export default Profile;
