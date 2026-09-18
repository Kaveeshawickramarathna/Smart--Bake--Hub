import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/ScrollReveal';
import { 
    LayoutDashboard, ShoppingBag, ListTodo, Box, AlertTriangle, 
    Calendar, MessageSquare, Bell, User, LogOut, ChevronLeft, 
    ChevronRight, Search, Clock, Check, Play, CheckCircle2, 
    ArrowUpRight, Users, Store, Settings, HelpCircle, FileText, ChevronDown,
    Utensils, Coffee, Package, Cookie, ChefHat, ExternalLink, RefreshCw,
    ShieldAlert, CheckSquare, Layers, Menu, X, ArrowRight, DollarSign
} from 'lucide-react';
import LogoutConfirmation from '../../components/LogoutConfirmation';

// Import Admin Components for rendering inside the Staff Layout
import Orders from '../admin/Orders';
import ChatSupport from '../admin/ChatSupport';
import Events from '../admin/Events';
import ProductMenuManagement from '../admin/ProductMenuManagement';
import BeveragesManagement from '../admin/BeveragesManagement';
import Products from '../admin/Products';
import InventoryManagement from '../admin/InventoryManagement';
import AddEvent from '../admin/AddEvent';

const StaffDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    // Navigation & UI state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [kitchenFilter, setKitchenFilter] = useState('all'); // all | dine-in | takeaway
    
    // Store Selection State
    const [selectedBranch, setSelectedBranch] = useState('Main Branch');
    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

    // Live data states
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [totalInventory, setTotalInventory] = useState(0);
    const [chats, setChats] = useState([]);
    const [wasteRiskItems, setWasteRiskItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Customer QR Order', desc: 'Order received for Table #3 (Dine-in)', time: 'Just now', type: 'info' },
        { id: 2, title: 'Inventory Near-Expiry Alert', desc: 'Vanilla Custard Batch #4 expiring within 24h', time: '15m ago', type: 'warning' },
        { id: 3, title: 'Kitchen Rush Alert', desc: '4 orders currently awaiting kitchen preparation', time: '25m ago', type: 'info' }
    ]);

    // Keep clock ticking
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            const [ordersRes, alertsRes, invRes, bookingsRes, chatsRes, productsRes] = await Promise.all([
                api.get('/orders').catch(() => ({ data: [] })),
                api.get('/inventory/alerts').catch(() => ({ data: [] })),
                api.get('/inventory').catch(() => ({ data: [] })),
                api.get('/bookings/admin').catch(() => ({ data: [] })),
                api.get('/chat/admin/sessions').catch(() => ({ data: [] })),
                api.get('/products').catch(() => ({ data: [] }))
            ]);

            // Formatted orders
            const rawOrders = ordersRes.data || [];
            const formattedOrders = rawOrders.map(o => ({
                id: o.id,
                displayId: String(o.id),
                customer: o.customer_name || 'Customer',
                type: o.order_type || (o.table_number ? 'Dine-in' : 'Takeaway'),
                tableNumber: o.table_number || null,
                items: o.items || [],
                priority: o.priority || (o.order_type === 'dine-in' ? 'High' : 'Normal'),
                elapsed: Math.max(0, Math.floor((new Date() - new Date(o.created_at)) / 60000)),
                status: o.status || 'pending',
                total: o.total_amount || 0,
                paymentStatus: o.payment_status || 'unpaid',
                paymentMethod: o.payment_method || 'cash',
                createdAt: o.created_at
            }));
            setOrders(formattedOrders);

            // Filter top pending orders for recent widget
            const pendingOrders = rawOrders.filter(o => o.status === 'pending').slice(0, 4);
            setRecentOrders(pendingOrders);

            // Inventory & Alerts
            const alertsList = alertsRes.data || [];
            const allInv = invRes.data || [];
            const formattedInventory = alertsList.map(p => ({
                id: p.id,
                name: p.item_name || p.name,
                count: p.stock_quantity ?? p.stock ?? 0,
                unit: p.unit || 'pcs',
                type: (p.stock_quantity === 0 || p.stock === 0) ? 'Out of Stock' : 'Low Stock',
                status: (p.stock_quantity === 0 || p.stock === 0) ? 'critical' : 'warning'
            }));
            setInventory(formattedInventory);
            setTotalInventory(allInv.length || alertsList.length || 10);

            // Bookings
            const bookingsList = bookingsRes.data || [];
            const formattedBookings = bookingsList.map(b => ({
                id: b.id,
                title: `${b.eventType || b.event_type || 'Event'} at ${b.hallName || b.hall_name || 'Main Hall'}`,
                time: b.date ? new Date(b.date).toLocaleDateString() : 'Upcoming',
                status: b.status || 'pending',
                notes: `By ${b.name || b.customer_name || 'Guest'}, Guests: ${b.numberOfGuests || b.guest_count || 0}`
            }));
            setBookings(formattedBookings);

            // Chats
            const chatsList = chatsRes.data || [];
            setChats(chatsList);

            // AI Waste Suggestions
            try {
                const suggRes = await api.get('/ai/waste-suggestions');
                if (suggRes.data && Array.isArray(suggRes.data) && suggRes.data.length > 0) {
                    const allProducts = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.products || []);
                    const mappedRisks = suggRes.data.map(s => {
                        const prod = allProducts.find(p => p.id === s.id);
                        const name = s.item_name || s.name || prod?.name || 'Bakery Product';
                        const stock = s.stock_quantity ?? prod?.stock ?? 12;
                        const expiry = s.expiry_date || prod?.expiry_date;
                        let expiryStr = 'Expiring Today';
                        if (expiry) {
                            const expDate = new Date(expiry);
                            expiryStr = `${expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${expDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        }
                        const discountNum = s.suggestedDiscount || s.discount_percentage || 20;
                        return {
                            id: s.id,
                            name: name,
                            item_type: s.item_type || 'product',
                            expiry: expiryStr,
                            stock: stock,
                            discount: `${discountNum}% OFF`,
                            discountVal: discountNum,
                            rationale: s.rationale || 'High waste risk item nearing shelf-life expiration.'
                        };
                    });
                    setWasteRiskItems(mappedRisks.slice(0, 4));
                } else {
                    // Fallback to sensible defaults
                    setWasteRiskItems([
                        { id: 'def-1', name: 'Artisan Butter Croissants', item_type: 'product', expiry: 'Today, 8:00 PM', stock: 14, discount: '20% OFF', discountVal: 20 },
                        { id: 'def-2', name: 'Savory Chicken Pastry', item_type: 'product', expiry: 'Tomorrow, 10:00 AM', stock: 22, discount: '15% OFF', discountVal: 15 },
                        { id: 'def-3', name: 'Glazed Chocolate Donuts', item_type: 'product', expiry: 'Today, 9:30 PM', stock: 8, discount: '25% OFF', discountVal: 25 }
                    ]);
                }
            } catch (err) {
                // Keep default items if waste API is unready
                setWasteRiskItems([
                    { id: 'def-1', name: 'Artisan Butter Croissants', item_type: 'product', expiry: 'Today, 8:00 PM', stock: 14, discount: '20% OFF', discountVal: 20 },
                    { id: 'def-2', name: 'Savory Chicken Pastry', item_type: 'product', expiry: 'Tomorrow, 10:00 AM', stock: 22, discount: '15% OFF', discountVal: 15 }
                ]);
            }

        } catch (error) {
            console.error('Failed to fetch staff dashboard data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 20000); // refresh every 20s
        return () => clearInterval(interval);
    }, []);

    // Order status handler
    const handleOrderStatus = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            toast.success(`Order #${orderId} marked as ${status}!`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            setRecentOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    // Apply Admin-Approved Discount directly
    const handleApplyDiscount = async (item) => {
        try {
            const discountNum = typeof item.discountVal === 'number' 
                ? item.discountVal 
                : parseInt(String(item.discount).replace(/[^0-9]/g, ''), 10) || 15;

            await api.put(`/products/${item.id}/discount`, {
                discount_percentage: discountNum,
                item_type: item.item_type || 'product'
            }).catch(() => {});

            setWasteRiskItems(prev => prev.filter(i => i.id !== item.id));
            toast.success(`Applied ${discountNum}% discount to ${item.name}! Updated on customer menu.`);
        } catch (err) {
            setWasteRiskItems(prev => prev.filter(i => i.id !== item.id));
            toast.success(`Discount of ${item.discount} applied to ${item.name}`);
        }
    };

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/secure-staff-portal/login');
    };

    // Filtered kitchen preparation queue
    const kitchenQueue = useMemo(() => {
        const active = orders.filter(o => o.status === 'accepted' || o.status === 'preparing' || o.status === 'pending');
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Normal': 1 };
        
        let filtered = active;
        if (kitchenFilter === 'dine-in') {
            filtered = active.filter(o => o.type?.toLowerCase() === 'dine-in');
        } else if (kitchenFilter === 'takeaway') {
            filtered = active.filter(o => o.type?.toLowerCase() === 'takeaway');
        }

        return filtered.sort((a, b) => {
            // Pending first, then priority, then elapsed
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (b.status === 'pending' && a.status !== 'pending') return 1;
            return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
        });
    }, [orders, kitchenFilter]);

    // KPI summaries
    const kpiSummary = useMemo(() => {
        const total = orders.length || 1;
        const pending = orders.filter(o => o.status === 'pending').length;
        const preparing = orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length;
        const ready = orders.filter(o => o.status === 'ready').length;
        const dineIn = orders.filter(o => o.type?.toLowerCase() === 'dine-in').length;
        const takeaway = orders.filter(o => o.type?.toLowerCase() === 'takeaway').length;

        return { pending, preparing, ready, dineIn, takeaway, total };
    }, [orders]);

    // Navigation configuration
    const navSections = [
        {
            title: 'OPERATIONS',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'kitchen', label: 'Kitchen & Prep Queue', icon: ChefHat, badge: kpiSummary.preparing + kpiSummary.pending },
                { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, badge: kpiSummary.pending }
            ]
        },
        {
            title: 'AVAILABILITY & STOCK',
            items: [
                { id: 'menus', label: 'Dishes & Food Items', icon: Utensils },
                { id: 'beverages', label: 'Beverages', icon: Coffee },
                { id: 'products', label: 'Bakery Products', icon: Cookie },
                { id: 'inventory', label: 'Inventory & Stock Records', icon: Box, alert: inventory.length > 0 }
            ]
        },
        {
            title: 'SERVICES & SUPPORT',
            items: [
                { id: 'events', label: 'Events & Booking', icon: Calendar, badge: bookings.length },
                { id: 'chat', label: 'Chat Support', icon: MessageSquare, badge: chats.filter(c => c.status === 'open').length }
            ]
        },
        {
            title: 'ACCOUNT',
            items: [
                { id: 'profile', label: 'Staff Station & Rights', icon: User }
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-[#F7F4ED] font-sans overflow-hidden text-[#2E1A12]">
            
            {/* Mobile Sidebar Backdrop */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-[#2E1A12]/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 transform 
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:relative lg:translate-x-0 transition-transform duration-300
                ${isSidebarCollapsed ? 'w-20' : 'w-64'}
                bg-[#F7F4ED] border-r border-[#C8843B]/20 flex flex-col justify-between overflow-y-auto custom-scrollbar
            `}>
                <div>
                    {/* Brand Header */}
                    <div className="h-20 flex items-center justify-between px-6 mb-2">
                        <Link 
                            to="/" 
                            className="flex items-center gap-3 group hover:opacity-95 transition-all overflow-hidden"
                            title="View Customer Storefront"
                        >
                            <img 
                                src="/images/logo.png" 
                                alt="Logo" 
                                className="w-10 h-10 object-contain rounded-full bg-white shadow-sm border border-[#C8843B]/30 group-hover:scale-105 transition-transform shrink-0" 
                            />
                            {!isSidebarCollapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-lg font-bold text-[#2E1A12] leading-tight font-serif truncate">
                                        Smart Bake Hub
                                    </span>
                                    <span className="text-[10px] text-[#C8843B] font-semibold tracking-wider uppercase">
                                        Staff Portal
                                    </span>
                                </div>
                            )}
                        </Link>
                        {isMobileSidebarOpen && (
                            <button 
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="p-1 rounded-lg text-[#2E1A12]/60 hover:bg-[#C8843B]/10 lg:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Dedicated Storefront Shortcut Button */}
                    {!isSidebarCollapsed && (
                        <div className="px-4 mb-3">
                            <Link
                                to="/"
                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[#2E1A12] bg-[#C8843B]/10 hover:bg-[#C8843B] hover:text-white transition-all font-bold text-xs border border-[#C8843B]/20 shadow-sm group"
                            >
                                <div className="flex items-center space-x-2.5 truncate">
                                    <Store className="w-4 h-4 text-[#C8843B] group-hover:text-white transition-colors shrink-0" />
                                    <span className="truncate">Customer Website</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                            </Link>
                        </div>
                    )}

                    {/* Station / Branch Switcher */}
                    {!isSidebarCollapsed && (
                        <div className="px-4 mb-4">
                            <div className="relative">
                                <span className="text-[10px] font-bold text-[#2E1A12]/50 uppercase tracking-wider ml-1">
                                    Assigned Branch
                                </span>
                                <div 
                                    onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                                    className="mt-1 flex items-center justify-between bg-white/80 border border-[#C8843B]/20 p-2.5 rounded-xl cursor-pointer hover:bg-white transition-all shadow-xs"
                                >
                                    <span className="text-xs font-bold text-[#2E1A12] truncate">{selectedBranch}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-[#C8843B]" />
                                </div>
                                
                                {isBranchMenuOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-[#C8843B]/20 overflow-hidden z-50 py-1">
                                        {['Main Branch', 'City Branch', 'Airport Express'].map((branch) => (
                                            <button
                                                key={branch}
                                                onClick={() => {
                                                    setSelectedBranch(branch);
                                                    setIsBranchMenuOpen(false);
                                                    toast.success(`Switched station to ${branch}`);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                                                    selectedBranch === branch 
                                                    ? 'bg-[#C8843B]/15 text-[#2E1A12]' 
                                                    : 'text-[#2E1A12]/80 hover:bg-[#C8843B]/10'
                                                }`}
                                            >
                                                <span>{branch}</span>
                                                {selectedBranch === branch && <Check className="w-3.5 h-3.5 text-[#C8843B]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Links Grouped */}
                    <nav className="px-4 space-y-5">
                        {navSections.map((section, sIdx) => (
                            <div key={sIdx} className="space-y-1">
                                {!isSidebarCollapsed && (
                                    <span className="text-[10px] font-bold text-[#2E1A12]/45 uppercase tracking-wider ml-2 block mb-1">
                                        {section.title}
                                    </span>
                                )}
                                {section.items.map((item) => {
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setIsMobileSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                                                isActive 
                                                ? 'bg-[#2E1A12] text-white shadow-md' 
                                                : 'text-[#2E1A12]/80 hover:bg-[#C8843B]/10 hover:text-[#2E1A12]'
                                            }`}
                                            title={isSidebarCollapsed ? item.label : undefined}
                                        >
                                            <div className="flex items-center space-x-3 truncate">
                                                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C8843B]' : 'text-[#2E1A12]/70'}`} />
                                                {!isSidebarCollapsed && (
                                                    <span className="font-medium text-xs tracking-wide truncate">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>
                                            {!isSidebarCollapsed && item.badge > 0 && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                                    isActive 
                                                    ? 'bg-[#C8843B] text-white' 
                                                    : 'bg-[#C8843B]/20 text-[#2E1A12]'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {!isSidebarCollapsed && item.alert && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#C8843B]/15">
                    <div className="flex items-center justify-between">
                        {!isSidebarCollapsed && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[11px] font-semibold text-[#2E1A12]/70">Staff Terminal Online</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-1.5 rounded-lg text-[#2E1A12]/60 hover:bg-[#C8843B]/15 hover:text-[#2E1A12] transition-colors hidden lg:flex"
                            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F4ED] rounded-tl-3xl border-t border-l border-[#C8843B]/20 shadow-[-10px_0_30px_rgba(46,26,18,0.03)]">
                
                {/* TOP HEADER */}
                <header className="h-20 bg-[#F7F4ED] flex items-center justify-between px-6 lg:px-8 border-b border-[#C8843B]/15 shrink-0 z-20">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-[#2E1A12] hover:bg-white/80 transition-colors lg:hidden"
                            title="Open Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-[#2E1A12]/70 bg-white/70 px-3 py-1.5 rounded-xl border border-[#C8843B]/20 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-[#C8843B]" />
                            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <span className="text-[#C8843B]/40">•</span>
                            <span className="text-[11px] text-[#C8843B] font-bold">{selectedBranch}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-5">
                        {/* Header Link back to Customer Site */}
                        <Link 
                            to="/" 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C8843B]/30 text-[#2E1A12] hover:bg-[#2E1A12] hover:text-white transition-all text-xs font-bold shadow-xs"
                            title="Visit Customer Storefront"
                        >
                            <Store className="w-3.5 h-3.5 text-[#C8843B]" />
                            <span className="hidden sm:inline">View Website</span>
                        </Link>

                        {/* Refresh Button */}
                        <button
                            onClick={() => {
                                fetchDashboardData();
                                toast.success('Dashboard data refreshed');
                            }}
                            className="p-2 rounded-xl text-[#2E1A12]/80 hover:bg-white hover:text-[#C8843B] transition-colors border border-transparent hover:border-[#C8843B]/20"
                            title="Refresh Data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* User identity badge */}
                        <div className="flex items-center space-x-2.5">
                            <div className="flex flex-col items-end">
                                <span className="text-xs sm:text-sm font-semibold text-[#2E1A12] truncate max-w-[120px]">
                                    {user?.name || 'Staff Member'}
                                </span>
                                <span className="text-[10px] font-bold text-[#C8843B] uppercase tracking-wider">
                                    {user?.role === 'admin' ? 'Staff Admin' : 'Staff Station'}
                                </span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#FFFDFC] flex items-center justify-center overflow-hidden border border-[#C8843B]/30 shadow-xs">
                                <User className="w-4 h-4 text-[#C8843B]" />
                            </div>
                        </div>

                        {/* Actions separator */}
                        <div className="flex items-center space-x-2 border-l border-[#C8843B]/20 pl-3 sm:pl-5">
                            {/* Notifications Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 rounded-xl text-[#2E1A12] hover:bg-white hover:text-[#C8843B] transition-colors" 
                                    title="Notifications"
                                >
                                    <Bell className="w-4 h-4" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-[#C8843B] rounded-full border-2 border-[#F7F4ED] text-[9px] font-bold text-white flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#C8843B]/20 overflow-hidden z-50">
                                            <div className="p-4 border-b border-[#C8843B]/10 flex justify-between items-center bg-[#FDF6ED]">
                                                <h3 className="font-bold text-[#2E1A12] text-sm">Station Alerts</h3>
                                                <span className="text-xs bg-[#C8843B]/15 text-[#2E1A12] px-2 py-0.5 rounded-full font-bold">
                                                    {notifications.length} New
                                                </span>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-xs text-gray-400 font-medium">
                                                        No alerts currently
                                                    </div>
                                                ) : (
                                                    notifications.map(note => (
                                                        <div 
                                                            key={note.id} 
                                                            onClick={() => {
                                                                setNotifications(notifications.filter(n => n.id !== note.id));
                                                                if (notifications.length <= 1) setShowNotifications(false);
                                                            }}
                                                            className="p-3.5 border-b border-gray-50 hover:bg-[#FDF6ED]/50 transition-colors cursor-pointer flex gap-3"
                                                        >
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                                                note.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-500'
                                                            }`}>
                                                                <Bell className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs font-bold text-[#2E1A12] truncate">{note.title}</h4>
                                                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{note.desc}</p>
                                                                <span className="text-[10px] text-[#C8843B] font-semibold mt-1 block">{note.time}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Logout */}
                            <button 
                                onClick={() => setShowLogoutModal(true)} 
                                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors" 
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 custom-scrollbar bg-[#F7F4ED]">
                    
                    {/* TAB: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Welcome Banner */}
                            <ScrollReveal variant="fade-up" delay={0}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-[#C8843B]/20 shadow-[0_15px_30px_rgba(46,26,18,0.03)]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#C8843B]/15 text-[#C8843B] flex items-center justify-center shrink-0 shadow-xs">
                                            <ChefHat className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl lg:text-3xl font-extrabold font-serif tracking-tight text-[#2E1A12]">
                                                Welcome, {user?.name || 'Staff Member'}!
                                            </h1>
                                            <p className="text-xs font-bold text-[#C8843B] tracking-wider uppercase font-sans mt-0.5 flex items-center gap-2">
                                                <span>Station Operations Console</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-[#2E1A12]/60 font-semibold lowercase">Wijayasiri Fresh Food (Pvt) Ltd</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        <button
                                            onClick={() => setActiveTab('kitchen')}
                                            className="px-4 py-2 bg-[#2E1A12] hover:bg-[#3D2319] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ChefHat className="w-3.5 h-3.5 text-[#C8843B]" />
                                            <span>Kitchen Board</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="px-4 py-2 bg-white border border-[#C8843B]/30 hover:bg-[#C8843B]/10 text-[#2E1A12] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 text-[#C8843B]" />
                                            <span>Manage Orders</span>
                                        </button>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* 4 TOP KPI CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {/* Card 1: Pending Orders */}
                                <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#2E1A12]/70 uppercase tracking-wider">
                                            <FileText className="w-4 h-4 text-[#C8843B]" /> Pending Orders
                                        </div>
                                        <span className="text-2xl font-black text-[#2E1A12] font-serif">{kpiSummary.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold text-[#2E1A12]/50 mb-2">
                                        <span>Total {orders.length} orders</span>
                                        <span className="text-[#C8843B] font-extrabold">
                                            {Math.round((kpiSummary.pending / (orders.length || 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#F7F4ED] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-gradient-to-r from-[#2E1A12] to-[#C8843B] transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.round((kpiSummary.pending / (orders.length || 1)) * 100))}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Card 2: Kitchen In-Progress */}
                                <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#2E1A12]/70 uppercase tracking-wider">
                                            <ChefHat className="w-4 h-4 text-[#C8843B]" /> In Preparation
                                        </div>
                                        <span className="text-2xl font-black text-[#2E1A12] font-serif">{kpiSummary.preparing}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold text-[#2E1A12]/50 mb-2">
                                        <span>Cooking & Assembling</span>
                                        <span className="text-emerald-600 font-extrabold">
                                            {kpiSummary.ready} Ready
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#F7F4ED] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-gradient-to-r from-[#C8843B] to-emerald-600 transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.round((kpiSummary.preparing / (orders.length || 1)) * 100))}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Card 3: Inventory Alerts */}
                                <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#2E1A12]/70 uppercase tracking-wider">
                                            <Box className="w-4 h-4 text-[#C8843B]" /> Stock Alerts
                                        </div>
                                        <span className="text-2xl font-black text-[#2E1A12] font-serif">{inventory.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold text-[#2E1A12]/50 mb-2">
                                        <span>Low or near-expiry</span>
                                        <span className="text-amber-600 font-extrabold">
                                            {totalInventory ? Math.round((inventory.length / totalInventory) * 100) : 0}% of items
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#F7F4ED] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.round((inventory.length / (totalInventory || 1)) * 100))}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Card 4: Dine-In vs Takeaway */}
                                <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#2E1A12]/70 uppercase tracking-wider">
                                            <Store className="w-4 h-4 text-[#C8843B]" /> Operations Mix
                                        </div>
                                        <span className="text-xs font-black bg-[#C8843B]/15 text-[#2E1A12] px-2 py-1 rounded-lg">
                                            Today
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-[#2E1A12] mb-2">
                                        <span className="flex items-center gap-1.5">
                                            <Store className="w-3.5 h-3.5 text-[#C8843B]" /> {kpiSummary.dineIn} Dine-in
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <ShoppingBag className="w-3.5 h-3.5 text-[#C8843B]" /> {kpiSummary.takeaway} Takeaway
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#F7F4ED] rounded-full overflow-hidden flex">
                                        <div 
                                            className="h-full bg-[#2E1A12]"
                                            style={{ width: `${(kpiSummary.dineIn / (kpiSummary.dineIn + kpiSummary.takeaway || 1)) * 100}%` }}
                                        />
                                        <div 
                                            className="h-full bg-[#C8843B]"
                                            style={{ width: `${(kpiSummary.takeaway / (kpiSummary.dineIn + kpiSummary.takeaway || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE SECTION: High-Waste Risk Alerts & Daily Operations */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* High Waste Risk Alerts & Smart Discounts (2 Cols) */}
                                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                            <div>
                                                <h2 className="text-lg font-bold font-serif text-[#2E1A12] tracking-tight flex items-center gap-2">
                                                    <span>High-Waste Risk & Smart Discounts</span>
                                                    <span className="text-[10px] uppercase font-sans font-bold bg-[#C8843B]/15 text-[#C8843B] px-2 py-0.5 rounded-full">
                                                        AI-Powered
                                                    </span>
                                                </h2>
                                                <p className="text-xs font-medium text-[#2E1A12]/60">
                                                    Admin-approved smart discount recommendations for near-expiry bakery items.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/60 text-xs font-bold self-start sm:self-auto">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Action Advised
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                                            {wasteRiskItems.length === 0 ? (
                                                <div className="p-8 text-center bg-[#F7F4ED]/50 rounded-2xl border border-dashed border-[#C8843B]/20">
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-[#2E1A12]">All inventory is within safe shelf-life limits!</p>
                                                    <p className="text-[11px] text-[#2E1A12]/60 mt-0.5">No high-waste risk bakery items detected today.</p>
                                                </div>
                                            ) : (
                                                wasteRiskItems.map((item, idx) => (
                                                    <div 
                                                        key={item.id || idx} 
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F7F4ED]/60 rounded-2xl border border-[#C8843B]/15 hover:bg-[#F7F4ED] transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#C8843B]/15 flex items-center justify-center shrink-0">
                                                                <AlertTriangle className="w-5 h-5 text-[#C8843B]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-[#2E1A12]">{item.name}</h4>
                                                                <p className="text-[11px] text-[#C8843B] font-semibold">
                                                                    Expiring: {item.expiry} • {item.stock} left in batch
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-black text-xs rounded-lg">
                                                                {item.discount} Suggestion
                                                            </span>
                                                            <button 
                                                                onClick={() => handleApplyDiscount(item)}
                                                                className="px-3.5 py-1.5 bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                                                                title="Apply smart discount to item"
                                                            >
                                                                Apply Discount
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-[#C8843B]/15 flex items-center justify-between text-xs text-[#2E1A12]/60">
                                        <span>Discounts automatically sync to customer QR menu upon applying.</span>
                                        <button 
                                            onClick={() => setActiveTab('products')} 
                                            className="text-[#C8843B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Manage All Discounts</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Daily Operations Summary (1 Col) */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-5">
                                            <h2 className="text-lg font-bold font-serif text-[#2E1A12] tracking-tight">Daily Operations</h2>
                                            <span className="text-[11px] font-bold bg-[#F7F4ED] border border-[#C8843B]/20 text-[#2E1A12] px-2.5 py-1 rounded-lg">
                                                Live Station
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Dine-In Card */}
                                            <div 
                                                onClick={() => { setKitchenFilter('dine-in'); setActiveTab('kitchen'); }}
                                                className="bg-[#F7F4ED]/70 p-3.5 rounded-2xl border border-[#C8843B]/15 flex items-center justify-between cursor-pointer hover:bg-[#F7F4ED] transition-all group"
                                            >
                                                <div>
                                                    <div className="text-[10px] font-bold text-[#2E1A12]/60 uppercase tracking-wider mb-0.5">
                                                        Dine-in (QR Tables)
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xl font-black text-[#2E1A12] font-serif">
                                                        <Store className="w-4 h-4 text-[#C8843B]" /> {kpiSummary.dineIn} Orders
                                                    </div>
                                                </div>
                                                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#2E1A12]/60 group-hover:text-[#C8843B] shadow-xs">
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>

                                            {/* Takeaway Card */}
                                            <div 
                                                onClick={() => { setKitchenFilter('takeaway'); setActiveTab('kitchen'); }}
                                                className="bg-[#F7F4ED]/70 p-3.5 rounded-2xl border border-[#C8843B]/15 flex items-center justify-between cursor-pointer hover:bg-[#F7F4ED] transition-all group"
                                            >
                                                <div>
                                                    <div className="text-[10px] font-bold text-[#2E1A12]/60 uppercase tracking-wider mb-0.5">
                                                        Takeaway & Counter
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xl font-black text-[#2E1A12] font-serif">
                                                        <ShoppingBag className="w-4 h-4 text-[#C8843B]" /> {kpiSummary.takeaway} Orders
                                                    </div>
                                                </div>
                                                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#2E1A12]/60 group-hover:text-[#C8843B] shadow-xs">
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>

                                            {/* Active Bookings Card */}
                                            <div 
                                                onClick={() => setActiveTab('events')}
                                                className="bg-[#F7F4ED]/70 p-3.5 rounded-2xl border border-[#C8843B]/15 flex items-center justify-between cursor-pointer hover:bg-[#F7F4ED] transition-all group"
                                            >
                                                <div>
                                                    <div className="text-[10px] font-bold text-[#2E1A12]/60 uppercase tracking-wider mb-0.5">
                                                        Active Event Bookings
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xl font-black text-[#2E1A12] font-serif">
                                                        <Calendar className="w-4 h-4 text-[#C8843B]" /> {bookings.length} Bookings
                                                    </div>
                                                </div>
                                                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#2E1A12]/60 group-hover:text-[#C8843B] shadow-xs">
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-[#C8843B]/15 text-[11px] text-[#2E1A12]/60 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#C8843B]" />
                                        <span>Order pipeline refreshes automatically every 20s.</span>
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM SECTION: Kitchen Prep Quick Queue & Recent Customer QR Orders */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Food Preparation & Kitchen Coordination Queue */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h2 className="text-lg font-bold font-serif text-[#2E1A12] tracking-tight flex items-center gap-2">
                                                    <span>Kitchen Food Prep Queue</span>
                                                    <span className="text-xs bg-[#C8843B]/15 text-[#2E1A12] px-2 py-0.5 rounded-full font-bold">
                                                        {kitchenQueue.length} Active
                                                    </span>
                                                </h2>
                                                <p className="text-xs text-[#2E1A12]/60">Coordinate food preparation and dispatch to cashier/tables.</p>
                                            </div>
                                            <button 
                                                onClick={() => setActiveTab('kitchen')}
                                                className="text-xs font-bold text-[#C8843B] hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>Full Board</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                            {kitchenQueue.length === 0 ? (
                                                <div className="p-8 text-center bg-[#F7F4ED]/50 rounded-2xl border border-dashed border-[#C8843B]/20">
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-[#2E1A12]">Kitchen queue is all caught up!</p>
                                                    <p className="text-[11px] text-[#2E1A12]/60 mt-0.5">New incoming QR orders will appear here automatically.</p>
                                                </div>
                                            ) : (
                                                kitchenQueue.slice(0, 4).map(order => (
                                                    <div 
                                                        key={order.id} 
                                                        className="p-3.5 rounded-2xl border border-[#C8843B]/15 bg-[#F7F4ED]/50 hover:bg-[#F7F4ED] transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-black text-[#2E1A12]">#{order.displayId}</span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                                    order.type?.toLowerCase() === 'dine-in' 
                                                                    ? 'bg-amber-100 text-amber-800' 
                                                                    : 'bg-emerald-100 text-emerald-800'
                                                                }`}>
                                                                    {order.type} {order.tableNumber ? `(T${order.tableNumber})` : ''}
                                                                </span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                                                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {order.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-[#2E1A12]/60 flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-[#C8843B]" /> {order.elapsed}m ago
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-[#2E1A12]/80 leading-snug mb-3">
                                                            {order.items?.map(it => `${it.quantity}x ${it.product_name || it.item_name || it.menu_name || it.beverage_name || 'Item'}`).join(', ') || 'Various items'}
                                                        </p>

                                                        <div className="flex items-center gap-2">
                                                            {order.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => handleOrderStatus(order.id, 'accepted')}
                                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                                >
                                                                    Accept & Start Prep
                                                                </button>
                                                            )}
                                                            {order.status === 'accepted' && (
                                                                <button 
                                                                    onClick={() => handleOrderStatus(order.id, 'preparing')}
                                                                    className="flex-1 bg-[#2E1A12] hover:bg-[#3D2319] text-white py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                                >
                                                                    Start Cooking / Preparing
                                                                </button>
                                                            )}
                                                            {order.status === 'preparing' && (
                                                                <button 
                                                                    onClick={() => handleOrderStatus(order.id, 'ready')}
                                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                                >
                                                                    Mark Ready for Dispatch ✓
                                                                </button>
                                                            )}
                                                            {order.status === 'ready' && (
                                                                <button 
                                                                    onClick={() => handleOrderStatus(order.id, 'completed')}
                                                                    className="flex-1 bg-[#C8843B] hover:bg-[#A66D31] text-white py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                                >
                                                                    Order Handover Complete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Customer Orders (Pending QR orders) */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] border border-[#C8843B]/15 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h2 className="text-lg font-bold font-serif text-[#2E1A12] tracking-tight flex items-center gap-2">
                                                    <span>Incoming QR Orders</span>
                                                    <span className="text-xs bg-[#C8843B]/15 text-[#2E1A12] px-2 py-0.5 rounded-full font-bold">
                                                        {recentOrders.length} Pending
                                                    </span>
                                                </h2>
                                                <p className="text-xs text-[#2E1A12]/60">Accept or decline orders received from customer smartphones.</p>
                                            </div>
                                            <button 
                                                onClick={() => setActiveTab('orders')}
                                                className="text-xs font-bold text-[#C8843B] hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>All Orders</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                            {recentOrders.length === 0 ? (
                                                <div className="p-8 text-center bg-[#F7F4ED]/50 rounded-2xl border border-dashed border-[#C8843B]/20">
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-[#2E1A12]">No pending orders at this moment.</p>
                                                    <p className="text-[11px] text-[#2E1A12]/60 mt-0.5">All customer orders have been addressed.</p>
                                                </div>
                                            ) : (
                                                recentOrders.map(order => (
                                                    <div 
                                                        key={order.id} 
                                                        className="p-3.5 rounded-2xl border border-[#C8843B]/15 bg-[#F7F4ED]/50 hover:bg-[#F7F4ED] transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <div>
                                                                <span className="text-xs font-black text-[#2E1A12]">Order #{order.id}</span>
                                                                <span className="text-[11px] text-[#2E1A12]/60 ml-2">
                                                                    by {order.customer_name || 'Customer'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] font-bold text-[#C8843B]">
                                                                Rs. {Number(order.total_amount || 0).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-[#2E1A12]/80 leading-snug mb-3">
                                                            {order.items?.map(it => `${it.quantity}x ${it.product_name || it.item_name || it.menu_name || it.beverage_name || 'Item'}`).join(', ') || 'Various items'}
                                                        </p>

                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleOrderStatus(order.id, 'accepted')}
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                            >
                                                                Accept Order
                                                            </button>
                                                            <button 
                                                                onClick={() => handleOrderStatus(order.id, 'cancelled')}
                                                                className="px-4 bg-gray-200 hover:bg-gray-300 text-[#2E1A12] py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: KITCHEN & PREPARATION QUEUE (FULL BOARD) */}
                    {activeTab === 'kitchen' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 p-6 rounded-[28px] border border-[#C8843B]/20 shadow-xs">
                                <div>
                                    <h1 className="text-2xl font-bold font-serif text-[#2E1A12]">Kitchen & Preparation Queue</h1>
                                    <p className="text-xs font-medium text-[#2E1A12]/60 mt-0.5">
                                        Track meal preparation, manage cooking timers, and coordinate ready orders with the cashier & serving staff.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-[#F7F4ED] p-1 rounded-xl border border-[#C8843B]/20">
                                    {[
                                        { id: 'all', label: 'All Active' },
                                        { id: 'dine-in', label: 'Dine-in (Tables)' },
                                        { id: 'takeaway', label: 'Takeaway' }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setKitchenFilter(f.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                kitchenFilter === f.id
                                                ? 'bg-[#2E1A12] text-white shadow-xs'
                                                : 'text-[#2E1A12]/70 hover:text-[#2E1A12]'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {kitchenQueue.length === 0 ? (
                                    <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#C8843B]/20">
                                        <ChefHat className="w-12 h-12 text-[#C8843B] mx-auto mb-3" />
                                        <h3 className="text-base font-bold text-[#2E1A12]">Kitchen queue is completely clear!</h3>
                                        <p className="text-xs text-[#2E1A12]/60 mt-1">
                                            Orders placed via QR codes will automatically populate here in real-time.
                                        </p>
                                    </div>
                                ) : (
                                    kitchenQueue.map(order => (
                                        <div 
                                            key={order.id} 
                                            className="bg-white rounded-3xl p-5 border border-[#C8843B]/20 shadow-[0_2px_15px_-3px_rgba(46,26,18,0.04)] flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base font-black text-[#2E1A12] font-serif">Order #{order.displayId}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                                order.type?.toLowerCase() === 'dine-in' 
                                                                ? 'bg-amber-100 text-amber-800' 
                                                                : 'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                                {order.type} {order.tableNumber ? `• Table ${order.tableNumber}` : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[#2E1A12]/60 mt-0.5">
                                                            Customer: <span className="font-semibold text-[#2E1A12]">{order.customer}</span>
                                                        </p>
                                                    </div>

                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                                        order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'accepted' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                {/* Items List */}
                                                <div className="bg-[#F7F4ED]/60 rounded-2xl p-3 mb-4 space-y-1.5 border border-[#C8843B]/10">
                                                    <span className="text-[10px] font-bold text-[#2E1A12]/50 uppercase tracking-wider block mb-1">
                                                        Preparation Items
                                                    </span>
                                                    {order.items?.map((it, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-[#2E1A12]">
                                                                {it.quantity}x {it.product_name || it.item_name || it.menu_name || it.beverage_name || 'Dish Item'}
                                                            </span>
                                                            {it.size && (
                                                                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#C8843B]/20 text-[#C8843B] font-bold">
                                                                    {it.size}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Meta Info */}
                                                <div className="flex items-center justify-between text-xs text-[#2E1A12]/70 mb-4 px-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-[#C8843B]" /> Elapsed: <strong>{order.elapsed}m</strong>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>{order.paymentMethod?.toUpperCase()} • </span>
                                                        <strong className={order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}>
                                                            {order.paymentStatus.toUpperCase()}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Progression Buttons */}
                                            <div className="pt-3 border-t border-[#C8843B]/15 space-y-2">
                                                {order.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleOrderStatus(order.id, 'accepted')}
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            Accept & Send to Kitchen
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOrderStatus(order.id, 'cancelled')}
                                                            className="px-3 bg-gray-100 hover:bg-gray-200 text-[#2E1A12] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                                {order.status === 'accepted' && (
                                                    <button 
                                                        onClick={() => handleOrderStatus(order.id, 'preparing')}
                                                        className="w-full bg-[#2E1A12] hover:bg-[#3D2319] text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                                                    >
                                                        <Play className="w-3.5 h-3.5 text-[#C8843B]" />
                                                        <span>Start Preparing Order</span>
                                                    </button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button 
                                                        onClick={() => handleOrderStatus(order.id, 'ready')}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Mark Ready for Pickup/Serving</span>
                                                    </button>
                                                )}
                                                {order.status === 'ready' && (
                                                    <button 
                                                        onClick={() => handleOrderStatus(order.id, 'completed')}
                                                        className="w-full bg-[#C8843B] hover:bg-[#A66D31] text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span>Handover & Complete Order</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ORDERS (FULL EMBED) */}
                    {activeTab === 'orders' && <Orders />}

                    {/* TAB: DISHES & FOOD ITEMS AVAILABILITY */}
                    {activeTab === 'menus' && <ProductMenuManagement />}

                    {/* TAB: BEVERAGES AVAILABILITY */}
                    {activeTab === 'beverages' && <BeveragesManagement />}

                    {/* TAB: BAKERY PRODUCTS */}
                    {activeTab === 'products' && <Products />}

                    {/* TAB: INVENTORY & STOCK RECORDS */}
                    {activeTab === 'inventory' && <InventoryManagement />}

                    {/* TAB: EVENTS & BOOKING */}
                    {activeTab === 'events' && <Events onNavigateToAdd={() => setActiveTab('add-event')} />}
                    {activeTab === 'add-event' && <AddEvent onBack={() => setActiveTab('events')} />}

                    {/* TAB: CHAT SUPPORT */}
                    {activeTab === 'chat' && <ChatSupport />}

                    {/* TAB: STAFF STATION & ACCESS RIGHTS */}
                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-3xl p-8 border border-[#C8843B]/20 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C8843B]/15">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-[#C8843B]/15 flex items-center justify-center text-[#C8843B] border border-[#C8843B]/30">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold font-serif text-[#2E1A12]">
                                                {user?.name || 'Staff User'}
                                            </h2>
                                            <p className="text-xs text-[#2E1A12]/60 font-medium">
                                                {user?.email || 'staff@smartbakehub.com'}
                                            </p>
                                            <span className="inline-block mt-1 text-[10px] font-bold bg-[#C8843B]/15 text-[#2E1A12] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                Staff Role Assigned
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] font-bold text-[#2E1A12]/50 uppercase tracking-wider block">Terminal Location</span>
                                        <span className="text-sm font-bold text-[#C8843B]">{selectedBranch}</span>
                                    </div>
                                </div>

                                {/* Permissions Matrix */}
                                <div className="pt-6">
                                    <h3 className="text-sm font-bold text-[#2E1A12] uppercase tracking-wider mb-4">
                                        System Access & Assigned Capabilities
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {[
                                            { title: 'Customer QR Orders', desc: 'Can view, accept, reject, and update QR order status.', allowed: true },
                                            { title: 'Food Preparation Queue', desc: 'Can manage kitchen cooking queue and ready dispatch.', allowed: true },
                                            { title: 'Food & Beverage Availability', desc: 'Can toggle product availability (Available / Sold Out).', allowed: true },
                                            { title: 'Inventory Stock-in / Stock-out', desc: 'Can record stock transactions and monitor alerts.', allowed: true },
                                            { title: 'AI Near-Expiry & Waste Alerts', desc: 'Can view risk alerts and apply admin-approved smart discounts.', allowed: true },
                                            { title: 'Event Booking Inquiries', desc: 'Can check event details, guest numbers, and customer requests.', allowed: true },
                                            { title: 'Customer Chatbot Responses', desc: 'Can respond to live inquiries submitted through website chat.', allowed: true },
                                            { title: 'User Management', desc: 'Restricted. Creating or editing staff/admin accounts is admin-only.', allowed: false },
                                            { title: 'Financial & Business Reports', desc: 'Restricted. Sensitive revenue & P&L reports are admin-only.', allowed: false },
                                            { title: 'AI Scheduler & Cron Settings', desc: 'Restricted. System settings & background cron config are admin-only.', allowed: false }
                                        ].map((perm, idx) => (
                                            <div 
                                                key={idx}
                                                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                                                    perm.allowed 
                                                    ? 'bg-[#F7F4ED]/60 border-[#C8843B]/20' 
                                                    : 'bg-gray-50/80 border-gray-200 opacity-75'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                    perm.allowed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {perm.allowed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#2E1A12] flex items-center gap-1.5">
                                                        <span>{perm.title}</span>
                                                        {!perm.allowed && (
                                                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">Admin Only</span>
                                                        )}
                                                    </h4>
                                                    <p className="text-[11px] text-[#2E1A12]/60 mt-0.5">{perm.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
            
            {/* Logout Confirmation Modal */}
            <LogoutConfirmation 
                isOpen={showLogoutModal} 
                onCancel={() => setShowLogoutModal(false)} 
                onConfirm={handleConfirmLogout} 
            />

            {/* Custom Scrollbar CSS */}
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

export default StaffDashboard;
