import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/ScrollReveal';
import { 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, PieChart, Pie
} from 'recharts';
import { 
    LayoutDashboard, ShoppingBag, ListTodo, Box, AlertTriangle, 
    Calendar, MessageSquare, Bell, User, LogOut, ChevronLeft, 
    ChevronRight, Search, Clock, ShieldCheck, Sparkles, Check, 
    Play, CheckCircle2, QrCode, Power, Printer, FileText, 
    AlertCircle, Send, Plus, Minus, Filter, Eye, Activity, RotateCcw
} from 'lucide-react';

const StaffDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    // UI state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [time, setTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [isInventoryDrawerOpen, setIsInventoryDrawerOpen] = useState(false);
    const [selectedInventoryProduct, setSelectedInventoryProduct] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [chatReplyText, setChatReplyText] = useState('');

    // Dynamic Clock Heuristic
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 1. Live Order Kanban Board State (Mock starting data, dynamic client manipulation)
    const [orders, setOrders] = useState([
        { id: '1082', customer: 'Liam Neeson', type: 'Dine-In (Table 4)', items: '2x Butter Croissants, 1x Hazelnut Latte', priority: 'High', elapsed: 8, est: '12 min', status: 'Pending' },
        { id: '1083', customer: 'Emma Watson', type: 'Takeaway', items: '1x Chocolate Ganache Cake (M)', priority: 'Medium', elapsed: 14, est: '20 min', status: 'Accepted' },
        { id: '1084', customer: 'Keanu Reeves', type: 'Delivery', items: '1x Creamy Pesto Pasta, 1x Iced Latte', priority: 'High', elapsed: 3, est: '15 min', status: 'Preparing' },
        { id: '1085', customer: 'Scarlett J.', type: 'Dine-In (Table 9)', items: '4x Strawberry Velvet Cupcakes', priority: 'Normal', elapsed: 18, est: '10 min', status: 'Ready' },
        { id: '1086', customer: 'Robert Downey', type: 'Takeaway', items: '2x Garlic Bread, 1x Vegetable Soup', priority: 'Normal', elapsed: 25, est: '25 min', status: 'Completed' }
    ]);

    // Kanban status helpers
    const moveOrder = (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, elapsed: 0 } : o));
        toast.success(`Order #${orderId} moved to ${newStatus}`);
    };

    // 2. Kitchen Queue Timeline (Ordered by Priority/Urgency)
    const kitchenQueue = useMemo(() => {
        const sorted = [...orders].filter(o => o.status === 'Accepted' || o.status === 'Preparing');
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Normal': 1 };
        return sorted.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    }, [orders]);

    // 3. Inventory Snapshots State
    const [inventory, setInventory] = useState([
        { id: 101, name: 'Premium Butter', count: 12, unit: 'kg', type: 'Low Stock', status: 'critical', trend: 'down' },
        { id: 102, name: 'Whipped Cream', count: 4, unit: 'liters', type: 'Low Stock', status: 'critical', trend: 'down' },
        { id: 103, name: 'Strawberries (Fresh)', count: 2, unit: 'kg', type: 'Near Expiry', status: 'warning', trend: 'stable' },
        { id: 104, name: 'Wheat Flour', count: 85, unit: 'kg', type: 'Recently Updated', status: 'good', trend: 'up' },
        { id: 105, name: 'Chocolate Ganache Premix', count: 0, unit: 'packs', type: 'Out of Stock', status: 'out', trend: 'down' }
    ]);

    // Open inventory edit drawer
    const openInventoryDrawer = (prod) => {
        setSelectedInventoryProduct(prod ? { ...prod } : { id: Date.now(), name: '', count: 0, unit: 'pcs', type: 'Recently Updated', status: 'good', trend: 'stable' });
        setIsInventoryDrawerOpen(true);
    };

    const handleSaveInventory = (e) => {
        e.preventDefault();
        setInventory(prev => {
            const exists = prev.some(p => p.id === selectedInventoryProduct.id);
            if (exists) {
                return prev.map(p => p.id === selectedInventoryProduct.id ? selectedInventoryProduct : p);
            }
            return [...prev, selectedInventoryProduct];
        });
        setIsInventoryDrawerOpen(false);
        toast.success('Inventory snapshot updated!');
    };

    // 4. Live Chat Pane State
    const [chats, setChats] = useState([
        { id: 1, name: 'John Wick', msg: 'Is the Sugar-Free Chocolate Cake available today?', unread: 2, messages: [{ sender: 'customer', text: 'Is the Sugar-Free Chocolate Cake available today?' }] },
        { id: 2, name: 'Thor Odinson', msg: 'Can I add extra honey to my tea order?', unread: 1, messages: [{ sender: 'customer', text: 'Can I add extra honey to my tea order?' }] },
        { id: 3, name: 'Bruce Banner', msg: 'My table is ready, thank you.', unread: 0, messages: [{ sender: 'customer', text: 'My table is ready, thank you.' }] }
    ]);

    const handleSendChatReply = (e) => {
        e.preventDefault();
        if (!chatReplyText.trim()) return;
        setChats(prev => prev.map(c => c.id === selectedChatUser.id ? {
            ...c,
            unread: 0,
            msg: chatReplyText,
            messages: [...c.messages, { sender: 'staff', text: chatReplyText }]
        } : c));
        setChatReplyText('');
        toast.success('Message sent to client!');
    };

    const applyQuickTemplate = (text) => {
        setChatReplyText(text);
    };

    // 5. Notification Panel Alerts
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Order Received', desc: 'Order #1087 created by John Doe (Table 3)', time: 'Just now', type: 'info' },
        { id: 2, title: 'Inventory Stock Alert', desc: 'Chocolate Ganache Premix is Out of Stock', time: '12m ago', type: 'error' },
        { id: 3, title: 'Event Booking Confirmed', desc: 'Wedding Cake delivery slot set for July 12', time: '1h ago', type: 'success' }
    ]);

    // 6. Analytics Visual Data
    const hourlyOrdersData = [
        { hour: '07:00 AM', orders: 12 },
        { hour: '09:00 AM', orders: 28 },
        { hour: '11:00 AM', orders: 19 },
        { hour: '01:00 PM', orders: 32 },
        { hour: '03:00 PM', orders: 15 },
        { hour: '05:00 PM', orders: 24 },
        { hour: '07:00 PM', orders: 30 }
    ];

    const popularItemsData = [
        { name: 'Croissants', value: 45, color: '#C8843B' },
        { name: 'Ganache Cake', value: 30, color: '#8B5E3C' },
        { name: 'Sandwich', value: 20, color: '#F59E0B' },
        { name: 'Latte', value: 15, color: '#10B981' }
    ];

    // Computed KPIs
    const kpiSummary = useMemo(() => {
        return {
            pending: orders.filter(o => o.status === 'Pending').length,
            preparing: orders.filter(o => o.status === 'Accepted' || o.status === 'Preparing').length,
            ready: orders.filter(o => o.status === 'Ready').length,
            completed: orders.filter(o => o.status === 'Completed').length
        };
    }, [orders]);

    return (
        <div className="flex h-screen bg-[#FFF8F0] text-[#1F2937] font-sans overflow-hidden">
            
            {/* LEFT SIDEBAR (Linear Collapsed style) */}
            <div className={`shrink-0 h-full bg-[#FAF5EE] border-r border-[#C8843B]/10 flex flex-col justify-between transition-all duration-300 relative z-30 ${
                isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}>
                <div>
                    {/* Header Brand */}
                    <div className="h-16 flex items-center justify-between px-5 border-b border-[#C8843B]/5">
                        {!isSidebarCollapsed && (
                            <div className="flex items-center gap-2">
                                <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-full bg-white border border-[#C8843B]/10" />
                                <span className="font-serif font-black text-sm text-[#2E1A12] tracking-wide">Smart Bake Staff</span>
                            </div>
                        )}
                        {isSidebarCollapsed && (
                            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-full bg-white mx-auto border border-[#C8843B]/10" />
                        )}
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-1.5 rounded-lg hover:bg-[#C8843B]/10 text-gray-400 hover:text-[#2E1A12] cursor-pointer"
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-3 space-y-1">
                        {[
                            { name: 'Dashboard', icon: LayoutDashboard, active: true },
                            { name: 'Live Orders', icon: ShoppingBag, count: kpiSummary.pending },
                            { name: 'Kitchen Queue', icon: ListTodo, count: kitchenQueue.length },
                            { name: 'Inventory', icon: Box, alert: inventory.filter(i => i.status === 'critical').length },
                            { name: 'Notifications', icon: Bell, count: notifications.length }
                        ].map((menuItem) => (
                            <button
                                key={menuItem.name}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-black cursor-pointer ${
                                    menuItem.active 
                                        ? 'bg-[#2E1A12] text-white shadow-sm' 
                                        : 'text-gray-500 hover:bg-[#C8843B]/5 hover:text-[#2E1A12]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <menuItem.icon className="w-4 h-4 shrink-0" />
                                    {!isSidebarCollapsed && <span>{menuItem.name}</span>}
                                </div>
                                {!isSidebarCollapsed && menuItem.count > 0 && (
                                    <span className="bg-[#C8843B]/20 text-[#2E1A12] px-2 py-0.5 rounded-lg text-[10px] font-black">
                                        {menuItem.count}
                                    </span>
                                )}
                                {!isSidebarCollapsed && menuItem.alert > 0 && (
                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-lg text-[10px] font-black">
                                        {menuItem.alert} Alert
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Profile Widget at Bottom */}
                <div className="p-4 border-t border-[#C8843B]/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C8843B]/20 flex items-center justify-center font-bold text-xs text-[#2E1A12] border border-[#C8843B]/30 relative">
                            {user?.name?.charAt(0) || 'S'}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <div className="font-extrabold text-[11px] truncate text-[#2E1A12]">{user?.name || 'Sarah Connor'}</div>
                                <div className="text-[9px] text-[#C8843B] font-black uppercase tracking-wider">Kitchen Staff</div>
                            </div>
                        )}
                        {!isSidebarCollapsed && (
                            <button 
                                onClick={logout}
                                className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD PANEL */}
            <div className="flex-1 h-full flex flex-col overflow-hidden relative">
                
                {/* TOP NAVIGATION */}
                <header className="sticky top-0 bg-[#FFF8F0]/90 backdrop-blur-md z-20 h-16 flex items-center justify-between px-6 border-b border-[#C8843B]/5 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search active orders, tickets..."
                            className="w-full bg-white border border-[#C8843B]/10 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C8843B]/30 transition-all text-gray-700 shadow-inner"
                        />
                    </div>

                    {/* Clock & Status Header Actions */}
                    <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/50 px-3 py-1.5 rounded-full text-[10px] font-black text-emerald-800 shadow-sm animate-pulse">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span>Kitchen Live</span>
                        </div>

                        {/* Shift details */}
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-[10px] text-[#C8843B] font-black uppercase tracking-wider flex items-center justify-end gap-1">
                                <Clock className="w-3 h-3" /> {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold">
                                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* DASHBOARD CONTENT BODY */}
                <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* WELCOME SECTION HERO */}
                    <ScrollReveal variant="fade-up" duration={700}>
                        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2E1A12] to-[#422C21] p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                            {/* Graphic elements */}
                            <div className="absolute right-0 top-0 w-80 h-full opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
                            
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#C8843B] animate-bounce" />
                                    <span className="text-[10px] font-black tracking-widest text-[#C8843B] uppercase">Smart Bake Hub Console</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold font-serif">Good Morning, {user?.name || 'Sarah'} 👋</h1>
                                <p className="text-xs text-gray-300/80 font-medium">Your Morning Shift is active. Kitchen load is steady today.</p>
                            </div>

                            {/* Shift stats */}
                            <div className="flex gap-4 relative z-10 shrink-0">
                                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 min-w-[100px] text-center shadow-inner">
                                    <div className="text-[9px] font-bold text-gray-300 uppercase">Shift Time</div>
                                    <div className="text-sm font-black mt-0.5">Morning Shift</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 min-w-[100px] text-center shadow-inner">
                                    <div className="text-[9px] font-bold text-gray-300 uppercase">Completed</div>
                                    <div className="text-sm font-black mt-0.5">18 Orders</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 min-w-[100px] text-center shadow-inner">
                                    <div className="text-[9px] font-bold text-gray-300 uppercase">In Queue</div>
                                    <div className="text-sm font-black mt-0.5">9 Active</div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* KPI CARDS SUMMARY */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: 'Pending Tickets', value: kpiSummary.pending, color: 'border-orange-200/50 bg-orange-50/30 text-orange-700', progress: 40, trend: '+4 min avg' },
                            { name: 'Preparing Queue', value: kpiSummary.preparing, color: 'border-blue-200/50 bg-blue-50/30 text-blue-700', progress: 65, trend: '8 in pipeline' },
                            { name: 'Ready for Pickup', value: kpiSummary.ready, color: 'border-emerald-200/50 bg-emerald-50/30 text-emerald-700', progress: 85, trend: 'Table 4 waiting' },
                            { name: 'Completed Today', value: kpiSummary.completed, color: 'border-teal-200/50 bg-teal-50/30 text-teal-700', progress: 100, trend: '100% fulfill' }
                        ].map((card, idx) => (
                            <ScrollReveal key={card.name} variant="fade-up" delay={idx * 50}>
                                <div className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col justify-between relative overflow-hidden h-28`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.name}</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${card.color}`}>{card.trend}</span>
                                    </div>
                                    <div className="my-2">
                                        <span className="text-3xl font-black text-[#2E1A12]">{card.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                        <div className="bg-[#C8843B] h-full rounded-full" style={{ width: `${card.progress}%` }}></div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* LIVE ORDER KANBAN BOARD */}
                    <ScrollReveal variant="fade-up" delay={200}>
                        <div className="bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-[#F7F4ED]">
                                <div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12]">Live Kanban Order Operations</h2>
                                    <p className="text-xs text-gray-400 font-medium">Quickly switch ticket statuses as orders process in the kitchen</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setOrders(prev => prev.map(o => ({ ...o, status: 'Pending' })));
                                            toast('All orders reset to Pending', { icon: '🔄' });
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-sm"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Reset Board
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'].map((column) => (
                                    <div key={column} className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex flex-col min-h-[350px]">
                                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                            <span className="text-xs font-black text-[#2E1A12] uppercase tracking-wider">{column}</span>
                                            <span className="bg-[#C8843B]/10 text-[#C8843B] text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                                                {orders.filter(o => o.status === column).length}
                                            </span>
                                        </div>

                                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                                            {orders.filter(o => o.status === column).map((order) => (
                                                <div 
                                                    key={order.id}
                                                    className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm space-y-3 hover:border-[#C8843B]/30 transition-all text-xs"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-[#2E1A12]">#{order.id}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                            order.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                            order.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {order.priority}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <div className="font-extrabold text-[#2E1A12]">{order.customer}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold">{order.type}</div>
                                                    </div>

                                                    <p className="text-[#2E1A12]/80 font-medium text-[11px] leading-relaxed border-t border-[#F7F4ED] pt-2">
                                                        {order.items}
                                                    </p>

                                                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium bg-gray-50/50 p-2 rounded-lg">
                                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#C8843B]" /> {order.elapsed}m in state</span>
                                                        <span>Est: {order.est}</span>
                                                    </div>

                                                    {/* Kanban Actions */}
                                                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#F7F4ED]">
                                                        {column === 'Pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => moveOrder(order.id, 'Accepted')}
                                                                    className="w-full bg-[#2E1A12] hover:bg-[#C8843B] text-white py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button 
                                                                    onClick={() => moveOrder(order.id, 'Completed')}
                                                                    className="w-full border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                                                                >
                                                                    Skip
                                                                </button>
                                                            </>
                                                        )}
                                                        {column === 'Accepted' && (
                                                            <button 
                                                                onClick={() => moveOrder(order.id, 'Preparing')}
                                                                className="w-full col-span-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                                            >
                                                                <Play className="w-3 h-3 text-[#C8843B]" /> Prep Order
                                                            </button>
                                                        )}
                                                        {column === 'Preparing' && (
                                                            <button 
                                                                onClick={() => moveOrder(order.id, 'Ready')}
                                                                className="w-full col-span-2 bg-[#C8843B] hover:bg-[#2E1A12] text-white py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                                            >
                                                                <Check className="w-3 h-3" /> Ready
                                                            </button>
                                                        )}
                                                        {column === 'Ready' && (
                                                            <button 
                                                                onClick={() => moveOrder(order.id, 'Completed')}
                                                                className="w-full col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" /> Complete
                                                            </button>
                                                        )}
                                                        {column === 'Completed' && (
                                                            <div className="col-span-2 text-center text-emerald-600 font-extrabold text-[10px] bg-emerald-50 border border-emerald-100 py-1 rounded-lg">
                                                                Completed ✅
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {orders.filter(o => o.status === column).length === 0 && (
                                                <div className="text-center text-gray-300 py-8 text-[11px] font-medium italic border-2 border-dashed border-gray-100 rounded-xl">
                                                    Empty
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* KITCHEN TIMELINE QUEUE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Kitchen Queue Timeline (7 columns) */}
                        <ScrollReveal variant="fade-up" className="lg:col-span-7 bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] space-y-4 flex flex-col">
                            <div>
                                <h2 className="text-lg font-bold font-serif text-[#2E1A12] flex items-center gap-2">
                                    <ListTodo className="w-5 h-5 text-[#C8843B]" />
                                    <span>Active Kitchen Prep Timeline</span>
                                </h2>
                                <p className="text-xs text-gray-400 font-medium">Prioritized sequence of items currently on grill or prep tables</p>
                            </div>

                            <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1.5 custom-scrollbar">
                                {kitchenQueue.map((item, idx) => (
                                    <div 
                                        key={item.id}
                                        className="relative pl-6 border-l-2 border-[#C8843B]/20 py-2 space-y-2"
                                    >
                                        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#C8843B]"></div>
                                        <div className="flex justify-between items-start text-xs font-semibold">
                                            <div>
                                                <span className="font-black text-[#2E1A12]">Ticket #{item.id}</span>
                                                <span className="text-gray-400 mx-2">•</span>
                                                <span className="text-gray-600 font-extrabold">{item.customer}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                item.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {item.priority} Urgency
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-600 font-medium bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                            {item.items}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 font-bold pt-1">
                                            <span>Assigned Chef: Head Baker (John)</span>
                                            <span>Prep Target: {item.est}</span>
                                            <span className="text-amber-600 animate-pulse">Est. Time Left: ~5m</span>
                                        </div>
                                    </div>
                                ))}
                                {kitchenQueue.length === 0 && (
                                    <div className="text-center text-gray-400 py-12 text-xs italic font-semibold">
                                        No active prep orders in queue
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>

                        {/* Inventory Snapshot (5 columns) */}
                        <ScrollReveal variant="fade-up" className="lg:col-span-5 bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-bold font-serif text-[#2E1A12] flex items-center gap-2">
                                            <Box className="w-5 h-5 text-[#C8843B]" />
                                            <span>Inventory Snapshot</span>
                                        </h2>
                                        <p className="text-xs text-gray-400 font-medium">Critical items requiring immediate re-stock or replacement</p>
                                    </div>
                                    <button 
                                        onClick={() => openInventoryDrawer(null)}
                                        className="p-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white rounded-xl shadow-sm cursor-pointer transition-colors"
                                        title="Scan / Update Stock"
                                    >
                                        <QrCode className="w-4 h-4 text-[#C8843B]" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {inventory.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => openInventoryDrawer(item)}
                                            className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-base">📦</span>
                                                <div>
                                                    <div className="font-extrabold text-[#2E1A12]">{item.name}</div>
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{item.type}</div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-black text-[#2E1A12]">{item.count} {item.unit}</div>
                                                <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[8px] font-black uppercase tracking-wider mt-1 ${
                                                    item.status === 'critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    item.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                    </div>

                    {/* EVENT SUPPORT & CUSTOMER CHATS */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Event Support Calendar (6 columns) */}
                        <ScrollReveal variant="fade-up" className="lg:col-span-6 bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] space-y-4">
                            <div>
                                <h2 className="text-lg font-bold font-serif text-[#2E1A12] flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#C8843B]" />
                                    <span>Event Bookings Support</span>
                                </h2>
                                <p className="text-xs text-gray-400 font-medium">Bespoke bulk orders set for delivery or pickup today</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { title: 'Sarah Birthday Tier Cake', time: '11:30 AM', status: 'Fully Paid', notes: 'Include "Happy 10th Birthday" gold topper' },
                                    { title: 'Corporate High-Tea Platter', time: '02:00 PM', status: 'Deposit Paid', notes: 'Deliver to Hatton National Bank, Colombo' },
                                    { title: 'Wedding Reception Assortments', time: '05:30 PM', status: 'Pending Balance', notes: 'Deliver direct to Kingsbury Grand Ballroom' }
                                ].map((ev, idx) => (
                                    <div 
                                        key={idx}
                                        className="p-3 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-2 text-xs font-semibold"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-extrabold text-[#2E1A12]">{ev.title}</span>
                                            <span className="text-[10px] font-black text-[#C8843B] bg-[#F7F4ED] px-2 py-0.5 rounded border border-[#C8843B]/10">{ev.time}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{ev.notes}</p>
                                        <div className="flex justify-between items-center pt-1 border-t border-[#F7F4ED]">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Payment</span>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                ev.status === 'Fully Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>{ev.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>

                        {/* Customer Chats Panel (6 columns) */}
                        <ScrollReveal variant="fade-up" className="lg:col-span-6 bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] flex flex-col justify-between gap-4">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12] flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-[#C8843B]" />
                                        <span>Customer Chats Live</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">Respond to inquiries and special instructions instantly</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* User Lists */}
                                    <div className="space-y-2 border-r border-[#F7F4ED] pr-2">
                                        {chats.map((c) => (
                                            <div 
                                                key={c.id}
                                                onClick={() => setSelectedChatUser(c)}
                                                className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                                                    selectedChatUser?.id === c.id 
                                                        ? 'bg-[#2E1A12] border-[#2E1A12] text-white' 
                                                        : 'bg-gray-50/50 border-gray-100 text-[#2E1A12] hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-extrabold">{c.name}</span>
                                                    {c.unread > 0 && (
                                                        <span className="bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                                                            {c.unread}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 truncate mt-1 font-semibold">{c.msg}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Details Box */}
                                    <div className="flex flex-col justify-between min-h-[180px] text-xs">
                                        {selectedChatUser ? (
                                            <div className="flex flex-col justify-between h-full space-y-2">
                                                <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                                                    {selectedChatUser.messages.map((m, idx) => (
                                                        <div key={idx} className={`p-2 rounded-xl max-w-[85%] font-medium ${
                                                            m.sender === 'customer' 
                                                                ? 'bg-gray-100 text-gray-800' 
                                                                : 'bg-[#C8843B]/20 text-[#2E1A12] self-end ml-auto'
                                                        }`}>
                                                            {m.text}
                                                        </div>
                                                    ))}
                                                </div>

                                                <form onSubmit={handleSendChatReply} className="space-y-2 border-t border-[#F7F4ED] pt-2">
                                                    <div className="flex gap-1">
                                                        {['Yes, available!', 'Sure!'].map(t => (
                                                            <button 
                                                                key={t}
                                                                type="button" 
                                                                onClick={() => applyQuickTemplate(t)}
                                                                className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 rounded text-[9px] font-bold cursor-pointer"
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            value={chatReplyText}
                                                            onChange={(e) => setChatReplyText(e.target.value)}
                                                            placeholder="Type reply..."
                                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2 pl-3 pr-8 text-[11px] font-semibold outline-none focus:border-[#C8843B]/40"
                                                        />
                                                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C8843B] hover:text-[#2E1A12] cursor-pointer">
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400 font-semibold italic flex items-center justify-center h-full">
                                                Select a conversation to reply
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                    </div>

                    {/* PERFORMANCE CHARTS */}
                    <ScrollReveal variant="fade-up" delay={250}>
                        <div className="bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] space-y-4">
                            <div>
                                <h2 className="text-lg font-bold font-serif text-[#2E1A12] flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[#C8843B]" />
                                    <span>Hourly Bakery Load & Metrics</span>
                                </h2>
                                <p className="text-xs text-gray-400 font-medium">Daily analytics feed showing busy slots and popular items</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Line Chart (8 cols) */}
                                <div className="md:col-span-8 h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hourlyOrdersData}>
                                            <defs>
                                                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#C8843B" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#C8843B" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F7F4ED" />
                                            <XAxis dataKey="hour" stroke="#A3A3A3" fontSize={9} />
                                            <YAxis stroke="#A3A3A3" fontSize={9} />
                                            <RechartsTooltip />
                                            <Area type="monotone" dataKey="orders" stroke="#C8843B" strokeWidth={2} fillOpacity={1} fill="url(#orderGrad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie chart summary (4 cols) */}
                                <div className="md:col-span-4 h-[250px] flex flex-col justify-between">
                                    <div className="h-[180px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={popularItemsData}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {popularItemsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-600 border-t border-[#F7F4ED] pt-2">
                                        {popularItemsData.map((item) => (
                                            <div key={item.name} className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span>{item.name} ({item.value}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* SYSTEM ALERT / LOG FEED */}
                    <ScrollReveal variant="fade-up" delay={300} className="bg-white p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)] flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg font-bold font-serif text-[#2E1A12]">Staff System Alert Ledger</h2>
                            <p className="text-xs text-gray-400 font-medium">Critical background updates regarding web shop and logistics</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id}
                                    className="p-3.5 bg-gray-50 border border-gray-200/50 rounded-2xl text-xs font-semibold relative space-y-1"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                            n.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                                            n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>{n.type}</span>
                                        <span className="text-[9px] text-gray-400 font-bold">{n.time}</span>
                                    </div>
                                    <h4 className="font-extrabold text-[#2E1A12] text-xs pt-1">{n.title}</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed font-bold">{n.desc}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* QUICK ACTIONS BAR */}
                    <ScrollReveal variant="fade-up" className="flex flex-wrap gap-3 items-center justify-between p-4 bg-[#FAF5EE] border border-[#C8843B]/10 rounded-[24px]">
                        <div className="text-xs font-bold text-gray-500">Quick Staff Operations Bar</div>
                        <div className="flex flex-wrap gap-2.5">
                            <button 
                                onClick={() => openInventoryDrawer(null)}
                                className="flex items-center gap-1.5 bg-[#2E1A12] hover:bg-[#C8843B] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-[#C8843B]" /> Update Inventory
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 bg-white border border-gray-200 text-[#2E1A12] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:border-[#C8843B]/30 shadow-sm cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> Print Kitchen Tickets
                            </button>
                            <button 
                                onClick={() => {
                                    toast.success("Shift performance summary downloaded as PDF");
                                }}
                                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                                <FileText className="w-4 h-4 text-emerald-600" /> Print Shift Report
                            </button>
                            <button 
                                onClick={() => {
                                    toast.error("Bakery technical issue reported to admin panel.");
                                }}
                                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                                <AlertCircle className="w-4 h-4 text-rose-600" /> Report Device Outage
                            </button>
                        </div>
                    </ScrollReveal>
                </main>
            </div>

            {/* INVENTORY UPDATE POPUP DRAWER */}
            {isInventoryDrawerOpen && selectedInventoryProduct && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsInventoryDrawerOpen(false)}
                        className="absolute inset-0 bg-[#2E1A12]/30 backdrop-blur-sm"
                    />
                    
                    {/* Content */}
                    <div className="relative w-full max-w-md h-full bg-[#FFF8F0] shadow-2xl p-8 overflow-y-auto flex flex-col justify-between z-10 border-l border-[#C8843B]/10">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-[#2E1A12] flex items-center gap-2">
                                    <Box className="w-6 h-6 text-[#C8843B]" />
                                    <span>Quick Inventory Manager</span>
                                </h2>
                                <p className="text-xs text-gray-400 font-medium mt-1">Scan or manually update active stock volume counts.</p>
                            </div>

                            <form onSubmit={handleSaveInventory} className="space-y-5 text-xs font-semibold">
                                {/* Search & Barcode Sim */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Product Name / Barcode</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={selectedInventoryProduct.name}
                                            onChange={(e) => setSelectedInventoryProduct({ ...selectedInventoryProduct, name: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#C8843B]/50"
                                            placeholder="Enter item name"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setSelectedInventoryProduct({ ...selectedInventoryProduct, name: 'Premium Cocoa Powder', unit: 'kg' });
                                                toast.success('Barcode scan successful!');
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-[#FAF5EE] border border-[#C8843B]/10 rounded-lg text-gray-500 hover:text-black cursor-pointer"
                                            title="Simulate Barcode Scan"
                                        >
                                            <QrCode className="w-4 h-4 text-[#C8843B]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Count Controller */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Stock Count ({selectedInventoryProduct.unit})</label>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedInventoryProduct({ ...selectedInventoryProduct, count: Math.max(0, selectedInventoryProduct.count - 1) })}
                                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg hover:border-black cursor-pointer"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input 
                                            type="number" 
                                            value={selectedInventoryProduct.count}
                                            onChange={(e) => setSelectedInventoryProduct({ ...selectedInventoryProduct, count: parseInt(e.target.value) || 0 })}
                                            className="w-20 text-center bg-white border border-gray-200 rounded-xl py-2.5 text-sm font-black focus:outline-none"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedInventoryProduct({ ...selectedInventoryProduct, count: selectedInventoryProduct.count + 1 })}
                                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg hover:border-black cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Status select */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Stock Status Level</label>
                                    <select
                                        value={selectedInventoryProduct.status}
                                        onChange={(e) => setSelectedInventoryProduct({ ...selectedInventoryProduct, status: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none"
                                    >
                                        <option value="good">good (Satisfactory)</option>
                                        <option value="warning">warning (Near Expiry/Low)</option>
                                        <option value="critical">critical (Critical Re-stock)</option>
                                        <option value="out">out (Out of Stock)</option>
                                    </select>
                                </div>

                                {/* Availability Toggle */}
                                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                                    <div>
                                        <div className="font-extrabold text-[#2E1A12]">Available to Web Shop</div>
                                        <div className="text-[10px] text-gray-400 font-bold">Display in menus and accept orders online</div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedInventoryProduct({
                                            ...selectedInventoryProduct,
                                            status: selectedInventoryProduct.status === 'out' ? 'good' : 'out'
                                        })}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                                            selectedInventoryProduct.status !== 'out' ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                            selectedInventoryProduct.status !== 'out' ? 'translate-x-4' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-[#F7F4ED] flex gap-3">
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-[#2E1A12] hover:bg-[#C8843B] text-white py-3.5 rounded-xl font-black text-xs transition-colors cursor-pointer"
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsInventoryDrawerOpen(false)}
                                        className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default StaffDashboard;
