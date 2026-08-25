import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/ScrollReveal';
import { 
    ResponsiveContainer, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell
} from 'recharts';
import { 
    LayoutDashboard, ShoppingBag, ListTodo, Box, AlertTriangle, 
    Calendar, MessageSquare, Bell, User, LogOut, ChevronLeft, 
    ChevronRight, Search, Clock, Check, Play, CheckCircle2, 
    ArrowUpRight, Users, Store, Settings, HelpCircle, FileText, ChevronDown
} from 'lucide-react';
import LogoutConfirmation from '../../components/LogoutConfirmation';

// Import Admin Components for rendering inside the Staff Layout
import Orders from '../admin/Orders';
import ChatSupport from '../admin/ChatSupport';
import Events from '../admin/Events';
import ProductMenuManagement from '../admin/ProductMenuManagement';
import InventoryManagement from '../admin/InventoryManagement';
import SettingsPage from '../admin/Settings';
import TablesManagement from '../admin/TablesManagement';

const StaffDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    // UI state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    
    // Store Selection State
    const [selectedBranch, setSelectedBranch] = useState('Main Branch');
    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

    // Keep clock ticking
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchRecentOrders();
        }
    }, [activeTab]);

    const fetchRecentOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            // Filter pending orders and take top 3
            const pending = data.filter(o => o.status === 'pending').slice(0, 3);
            setRecentOrders(pending);
        } catch (error) {
            console.error('Failed to fetch recent orders:', error);
        }
    };

    const handleOrderStatus = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            toast.success(`Order ${status === 'accepted' ? 'accepted' : 'declined'} successfully!`);
            fetchRecentOrders();
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [isInventoryDrawerOpen, setIsInventoryDrawerOpen] = useState(false);
    const [selectedInventoryProduct, setSelectedInventoryProduct] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [chatReplyText, setChatReplyText] = useState('');

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    // 1. Live Order Kanban Board State
    const [orders, setOrders] = useState([]);
    
    // Event Bookings State
    const [bookings, setBookings] = useState([]);

    // Fetch data from backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Orders
                const ordersRes = await api.get('/orders');
                const formattedOrders = ordersRes.data.map(o => ({
                    id: o._id,
                    displayId: o._id.substring(o._id.length - 4),
                    customer: o.customerInfo?.name || o.user?.name || 'Customer',
                    type: o.orderType || 'Takeaway',
                    items: o.orderItems.map(i => `${i.quantity}x ${i.name}`).join(', '),
                    priority: o.priority || 'Normal',
                    elapsed: Math.floor((new Date() - new Date(o.createdAt)) / 60000),
                    est: '15 min',
                    status: o.orderStatus,
                    total: o.total_amount || 0
                }));
                setOrders(formattedOrders);

                // Fetch Inventory (Products)
                const inventoryRes = await api.get('/products');
                const formattedInventory = inventoryRes.data.map(p => {
                    let status = 'good';
                    let type = 'In Stock';
                    if (p.countInStock <= 5) {
                        status = 'warning';
                        type = 'Low Stock';
                    }
                    if (p.countInStock === 0) {
                        status = 'critical';
                        type = 'Out of Stock';
                    }
                    return {
                        id: p._id,
                        name: p.name,
                        count: p.countInStock,
                        unit: 'pcs',
                        type: type,
                        status: status,
                        trend: 'stable'
                    };
                }).filter(i => i.status !== 'good'); // Only show low/out of stock
                setInventory(formattedInventory);

                // Fetch Bookings
                const bookingsRes = await api.get('/bookings/admin');
                const formattedBookings = bookingsRes.data.map(b => ({
                    title: `${b.eventType} at ${b.hallName}`,
                    time: new Date(b.date).toLocaleDateString(),
                    status: b.status,
                    notes: `By ${b.name}, Guests: ${b.numberOfGuests}`
                }));
                setBookings(formattedBookings);

                // Fetch Chats
                const chatsRes = await api.get('/chat/admin/sessions');
                const formattedChats = chatsRes.data.map(c => ({
                    id: c.session_id,
                    name: c.user_id ? `User ${c.user_id.substring(c.user_id.length - 4)}` : 'Customer',
                    msg: c.messages[c.messages.length - 1]?.text || 'No messages',
                    unread: c.status === 'open' ? 1 : 0,
                    messages: c.messages
                }));
                setChats(formattedChats);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); 
        return () => clearInterval(interval);
    }, []);

    const moveOrder = async (orderId, displayId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, elapsed: 0 } : o));
            toast.success(`Order #${displayId} moved to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    const kitchenQueue = useMemo(() => {
        const sorted = [...orders].filter(o => o.status === 'Accepted' || o.status === 'Preparing');
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Normal': 1 };
        return sorted.sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));
    }, [orders]);

    const [inventory, setInventory] = useState([]);
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Order Received', desc: 'Order #1087 created by John Doe (Table 3)', time: 'Just now', type: 'info' },
        { id: 2, title: 'Inventory Stock Alert', desc: 'Chocolate Ganache Premix is Out of Stock', time: '12m ago', type: 'error' }
    ]);

    const kpiSummary = useMemo(() => {
        return {
            pending: orders.filter(o => o.status === 'Pending').length,
            preparing: orders.filter(o => o.status === 'Accepted' || o.status === 'Preparing').length,
            ready: orders.filter(o => o.status === 'Ready').length,
            completed: orders.filter(o => o.status === 'Completed').length
        };
    }, [orders]);

    // Data for Revenue Chart (Mocked for staff dashboard as per image)
    const revenueData = [
        { name: 'Jan', value: 200 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 400 },
        { name: 'Apr', value: 350 },
        { name: 'May', value: 598 },
        { name: 'Jun', value: 450 },
        { name: 'Jul', value: 500 },
        { name: 'Aug', value: 600 },
        { name: 'Sep', value: 700 }
    ];

    const topDishes = [
        { name: 'Butter Croissants', value: 963, img: 'https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?w=100&h=100&fit=crop' },
        { name: 'Chocolate Ganache Cake', value: 837, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop' },
        { name: 'Strawberry Velvet Cupcake', value: 804, img: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=100&h=100&fit=crop' },
        { name: 'Hazelnut Latte', value: 760, img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=100&h=100&fit=crop' },
        { name: 'Garlic Bread', value: 645, img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=100&h=100&fit=crop' },
        { name: 'Creamy Pesto Pasta', value: 621, img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=100&h=100&fit=crop' }
    ];

    return (
        <div className="flex h-screen bg-[#F3F4F6] text-gray-800 font-sans overflow-hidden">
            
            {/* LEFT SIDEBAR */}
            <div className={`shrink-0 h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative z-30 shadow-sm ${
                isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}>
                {/* Brand */}
                <div className="h-20 flex items-center px-6 gap-3 mb-4 mt-2">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-[#C8843B]/30 flex items-center justify-center shrink-0 p-1">
                        <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-[#2E1A12] leading-tight font-serif">Smart Bake Hub</span>
                            <span className="text-[11px] text-[#C8843B] font-medium tracking-wide leading-tight mt-0.5">
                                Smarter Bakery. Better <br/>Business.
                            </span>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Store Selector */}
                    {!isSidebarCollapsed && (
                        <div className="space-y-2 relative">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Store</span>
                            <div 
                                onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                                className="flex items-center justify-between bg-[#F8F9FA] p-3 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-sm font-bold text-[#1a202c]">{selectedBranch}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                            
                            {/* Dropdown Menu */}
                            {isBranchMenuOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                    {['Main Branch', 'City Branch'].map((branch) => (
                                        <button
                                            key={branch}
                                            onClick={() => {
                                                setSelectedBranch(branch);
                                                setIsBranchMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                                                selectedBranch === branch 
                                                ? 'bg-[#C8843B]/10 text-[#C8843B]' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {branch}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        {!isSidebarCollapsed && <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-2">Menu</span>}
                        <div className="flex flex-col gap-1.5">
                            <button 
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-[#2E1A12] to-[#C8843B] text-white shadow-md shadow-[#C8843B]/20' : 'text-gray-500 hover:bg-[#C8843B]/10 hover:text-[#C8843B]'}`}>
                                <LayoutDashboard className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="font-semibold text-sm">Dashboard</span>}
                            </button>
                            {[
                                { icon: ShoppingBag, label: 'Orders', id: 'orders' },
                                { icon: ListTodo, label: 'Kitchen', id: 'kitchen' },
                                { icon: Box, label: 'Inventory', id: 'inventory' },
                                { icon: LayoutDashboard, label: 'Tables', id: 'tables' },
                                { icon: Calendar, label: 'Bookings', id: 'events' },
                                { icon: MessageSquare, label: 'Chats', id: 'chat' }
                            ].map((item, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${activeTab === item.id ? 'bg-gradient-to-r from-[#2E1A12] to-[#C8843B] text-white shadow-md shadow-[#C8843B]/20' : 'text-gray-500 hover:bg-[#C8843B]/10 hover:text-[#C8843B]'}`}>
                                    <item.icon className="w-5 h-5" />
                                    {!isSidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {!isSidebarCollapsed && <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-2">Others</span>}
                        <div className="flex flex-col gap-1.5">
                            <button 
                                onClick={() => setActiveTab('help')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${activeTab === 'help' ? 'bg-gradient-to-r from-[#2E1A12] to-[#C8843B] text-white shadow-md shadow-[#C8843B]/20' : 'text-gray-500 hover:bg-[#C8843B]/10 hover:text-[#C8843B]'}`}>
                                <HelpCircle className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="font-medium text-sm">Help</span>}
                            </button>
                            <button 
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${activeTab === 'settings' ? 'bg-gradient-to-r from-[#2E1A12] to-[#C8843B] text-white shadow-md shadow-[#C8843B]/20' : 'text-gray-500 hover:bg-[#C8843B]/10 hover:text-[#C8843B]'}`}>
                                <Settings className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Box */}
                {!isSidebarCollapsed && (
                    <div className="p-4 border-t border-gray-100">
                        <button 
                            className="flex items-center gap-3 hover:bg-[#C8843B]/10 p-2 rounded-xl transition-colors border border-gray-100 w-full"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <div className="w-9 h-9 rounded-xl bg-[#C8843B]/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-[#C8843B]" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Staff User'}</div>
                                <div className="text-xs text-green-500 font-semibold flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Online
                                </div>
                            </div>
                            <LogOut className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* HEADER */}
                <header className="h-20 bg-white/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Staff Dashboard</h1>
                        <p className="text-sm text-gray-500 font-medium">Welcome back, {user?.name || 'Staff'}!</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            <span className="cursor-pointer hover:text-[#C8843B] transition-colors">Subscription</span>
                            <div className="w-px h-4 bg-gray-200"></div>
                            <span className="cursor-pointer hover:text-[#C8843B] transition-colors">Analytics</span>
                        </div>
                        
                        <div className="relative">
                            <button className="relative p-2 text-gray-400 hover:text-[#C8843B] hover:bg-[#C8843B]/10 rounded-xl transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE MAIN AREA */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'dashboard' && (
                        <>
                            {/* TOP KPI CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* KPI 1 */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                                    <FileText className="w-4 h-4 text-[#C8843B]" /> Pending Orders
                                </div>
                                <span className="text-3xl font-black text-gray-900">{kpiSummary.pending}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
                                <span>Total {orders.length}</span>
                                <span className="text-gray-900">{Math.round((kpiSummary.pending/orders.length)*100) || 0}%</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#2E1A12] to-[#C8843B]"
                                    style={{ 
                                        width: `${Math.round((kpiSummary.pending/orders.length)*100) || 0}%`,
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 8px)'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* KPI 2 */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                                    <ListTodo className="w-4 h-4 text-[#C8843B]" /> Orders in Progress
                                </div>
                                <span className="text-3xl font-black text-gray-900">{kpiSummary.preparing}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
                                <span>Total {orders.length}</span>
                                <span className="text-gray-900">{Math.round((kpiSummary.preparing/orders.length)*100) || 0}%</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#2E1A12] to-[#C8843B]"
                                    style={{ 
                                        width: `${Math.round((kpiSummary.preparing/orders.length)*100) || 0}%`,
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 8px)'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* KPI 3 */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                                    <Box className="w-4 h-4 text-[#C8843B]" /> Inventory Alerts
                                </div>
                                <span className="text-3xl font-black text-gray-900">{inventory.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
                                <span>Action Required</span>
                                <span className="text-[#C8843B]">Critical</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#2E1A12] to-[#C8843B]"
                                    style={{ 
                                        width: '40%',
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 8px)'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN MIDDLE ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        
                        {/* High Waste Risk Alerts */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">High-Waste Risk & Discounts</h2>
                                    <p className="text-xs font-semibold text-gray-400">AI-Powered Alerts</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold">
                                    <AlertTriangle className="w-4 h-4" /> Action Required
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                {[
                                    { name: 'Butter Croissants', expiry: 'Today, 8:00 PM', stock: 15, discount: '20% OFF' },
                                    { name: 'Chicken Pastry', expiry: 'Tomorrow, 10:00 AM', stock: 22, discount: '15% OFF' },
                                    { name: 'Chocolate Donuts', expiry: 'Today, 9:00 PM', stock: 8, discount: '30% OFF' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-xs text-orange-600 font-semibold">Expiring: {item.expiry} • {item.stock} left in stock</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 font-black text-xs rounded-lg">{item.discount} Suggested</span>
                                            <button className="px-4 py-2 bg-[#C8843B] hover:bg-[#A66D31] text-white font-bold text-xs rounded-xl transition-colors">
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Operations */}
                        <div className="space-y-6">
                            
                            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Daily Operations</h2>
                                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                                        Today <ChevronDown className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {/* Stat 1 */}
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-400 mb-1">Dine-in Orders</div>
                                            <div className="flex items-center gap-2 text-xl font-black text-gray-900">
                                                <Store className="w-4 h-4 text-gray-400" /> {orders.filter(o => o.type === 'Dine-in').length || 12}
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#C8843B] shadow-sm">
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    {/* Stat 2 */}
                                    <div className="bg-[#FFF4ED] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#FFEDDF] transition-colors">
                                        <div>
                                            <div className="text-[11px] font-bold text-[#C8843B] mb-1">Takeaway Orders</div>
                                            <div className="flex items-center gap-2 text-xl font-black text-[#C8843B]">
                                                <ShoppingBag className="w-4 h-4" /> {orders.filter(o => o.type === 'Takeaway').length || 24}
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#C8843B] group-hover:text-[#C8843B] shadow-sm">
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    {/* Stat 3 */}
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-400 mb-1">Active Bookings</div>
                                            <div className="flex items-center gap-2 text-xl font-black text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" /> {bookings.length || 3}
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#C8843B] shadow-sm">
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Recent Activity</h2>
                                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500 font-medium">No pending orders right now.</div>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                            <div className="w-12 h-12 rounded-2xl bg-[#C8843B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ShoppingBag className="w-6 h-6 text-[#C8843B]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">Order #{order.id}</h4>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {order.items?.map(item => `${item.quantity}x ${item.item_name || item.product_name || item.menu_name || item.beverage_name || 'Item'}`).join(', ') || 'Various items'}
                                                </p>
                                                <div className="flex gap-2 w-full mt-4">
                                                    <button 
                                                        onClick={() => handleOrderStatus(order.id, 'accepted')}
                                                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-xl text-sm font-bold transition-colors">
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOrderStatus(order.id, 'cancelled')}
                                                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-bold transition-colors">
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400">
                                                {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top Dishes */}
                        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Top Dishes</h2>
                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <Calendar className="w-3 h-3" /> This Month <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>

                            <div className="space-y-5 flex-1">
                                {topDishes.map((dish, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <img src={dish.img} alt={dish.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm font-bold text-gray-700">{dish.name}</span>
                                                <span className="text-sm font-black text-gray-900">{dish.value}</span>
                                            </div>
                                            <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-gradient-to-r from-[#FF7A45] to-[#FF5722]"
                                                    style={{ 
                                                        width: `${(dish.value / 1000) * 100}%`,
                                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 8px)'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                        </>
                    )}

                    {activeTab === 'orders' && <Orders />}
                    {activeTab === 'kitchen' && <Orders />}
                    {activeTab === 'inventory' && <InventoryManagement />}
                    {activeTab === 'tables' && <TablesManagement />}
                    {activeTab === 'events' && <Events />}
                    {activeTab === 'chat' && <ChatSupport />}
                    {activeTab === 'settings' && <SettingsPage />}
                    {activeTab === 'help' && (
                        <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h2>
                            <p className="text-gray-500">Please contact the system administrator for assistance.</p>
                        </div>
                    )}
                </main>
            </div>
            
            <LogoutConfirmation 
                isOpen={showLogoutModal} 
                onCancel={() => setShowLogoutModal(false)} 
                onConfirm={handleConfirmLogout} 
            />
        </div>
    );
};

export default StaffDashboard;
