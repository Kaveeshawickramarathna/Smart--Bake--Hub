import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addToCart } from '../../services/cart';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { 
    Search, Info, ShoppingCart, ShoppingBag, 
    ChevronRight, Compass, ShieldCheck, HelpCircle, Leaf, QrCode
} from 'lucide-react';
import { wijayasiriMenuData, mockMenuCategories } from '../../data/mockMenus';

const Menus = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [scannedTable, setScannedTable] = useState(null);

    // Capture table number from URL on load
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const table = queryParams.get('table');
        if (table) {
            setScannedTable(table);
            localStorage.setItem('scannedTableNumber', table);
        } else {
            const savedTable = localStorage.getItem('scannedTableNumber');
            if (savedTable) {
                setScannedTable(savedTable);
            }
        }
    }, [location]);

    // Lowest price out of a beverage's variant list (e.g. different bottle sizes)
    const getBeverageDisplayPrice = (item) => {
        if (item.price && Number(item.price) > 0) return Number(item.price);
        let variants = item.price_variants;
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch { variants = []; }
        }
        if (Array.isArray(variants) && variants.length > 0) {
            const prices = variants.map(v => Number(v.price) || 0).filter(p => p > 0);
            if (prices.length > 0) return Math.min(...prices);
        }
        return 0;
    };

    // Fetch dynamic menus and beverages from admin page database api
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const [menusRes, beveragesRes] = await Promise.all([
                    api.get('/menus'),
                    api.get('/beverages').catch(() => ({ data: [] }))
                ]);

                const activeMenus = (menusRes.data || []).filter(item => (item.status || '').toLowerCase() === 'active');
                const mappedDishes = activeMenus.map(item => ({
                    id: item.id,
                    type: 'dish',
                    code: `M${item.id}`,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category_name || 'General',
                    image_url: item.image_url, // Assuming it has image
                    isAvailable: item.is_available === 0 || item.is_available === false ? false : true
                }));

                const activeBeverages = (beveragesRes.data || []).filter(item => (item.status || '').toLowerCase() === 'active');
                const mappedBeverages = activeBeverages.map(item => ({
                    id: item.id,
                    type: 'beverage',
                    code: `B${item.id}`,
                    name: item.name,
                    description: item.description,
                    price: getBeverageDisplayPrice(item),
                    category: item.beverage_category_name || 'Beverages',
                    image_url: item.image_url,
                    isAvailable: item.is_available === 0 || item.is_available === false ? false : true
                }));

                const combined = [...mappedDishes, ...mappedBeverages];
                // Available items first, out-of-stock items pushed to the end
                combined.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
                setMenuItems(combined);
            } catch (err) {
                console.error("Failed to fetch menus from API", err);
            }
        };
        fetchMenus();
    }, []);

    // Dynamically calculate category list based on existing items
    const categories = useMemo(() => {
        const uniqueCategories = ['All', ...new Set(menuItems.map(item => item.category))];
        return uniqueCategories.map((name, idx) => ({ id: idx + 1, name }));
    }, [menuItems]);

    // Filter and search menus
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch = 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [menuItems, selectedCategory, searchQuery]);

    const { user } = useAuthStore();

    // Add item to cart
    const handleAddToCart = (item) => {
        if (!item.isAvailable) {
            toast.error(`${item.name} is currently out of stock`);
            return;
        }
        if (!user) {
            toast.error('Please log in to add items to your cart');
            navigate('/login');
            return;
        }

        const itemId = `wijayasiri-${item.code}`;
        const finalName = item.name;
        const finalPrice = item.price || 0;

        const cartItem = {
            id: itemId,
            name: finalName,
            price: finalPrice,
            quantity: 1,
            menuId: item.type === 'dish' ? item.id : null,
            beverageId: item.type === 'beverage' ? item.id : null
        };

        addToCart(cartItem);
        toast.success(`Added ${finalName} to cart!`, { icon: '🛒' });
    };

    // Direct Buy
    const handleBuyItem = (item) => {
        if (!item.isAvailable) {
            toast.error(`${item.name} is currently out of stock`);
            return;
        }
        if (!user) {
            toast.error('Please log in to place an order');
            navigate('/login');
            return;
        }

        const itemId = `wijayasiri-${item.code}`;
        const finalName = item.name;
        const finalPrice = item.price || 0;

        const orderItem = {
            id: itemId,
            name: finalName,
            price: finalPrice,
            quantity: 1,
            menuId: item.type === 'dish' ? item.id : null,
            beverageId: item.type === 'beverage' ? item.id : null
        };

        navigate('/order', { state: { menu: orderItem } });
    };

    // Category count helper
    const getCategoryCount = (catName) => {
        if (catName === 'All') return menuItems.length;
        return menuItems.filter(item => item.category === catName).length;
    };

    // Emoji mapper for categories to add visual premium flair
    const getCategoryEmoji = (catName) => {
        const emojis = {
            'All': '🍽️',
            'Soups': '🥣',
            'Salads': '🥗',
            'Fried Rice': '🍚',
            'Noodles': '🍝',
            'Chop Suey': '🍱',
            'Kottu': '🫓',
            'String Hopper Kottu': '🥞',
            'Pasta & Spaghetti': '🍝',
            'Vegetable Dishes': '🥦',
            'Egg Dishes': '🍳',
            'Meat Dishes': '🍗',
            'Seafood Dishes': '🦀',
            'Beverages': '🥤',
            'Hot Beverages': '☕',
            'Cold Beverages': '🥤',
            'Fresh Juice': '🧃'
        };
        return emojis[catName] || '🍔';
    };

    return (
        <div className="min-h-screen bg-[#F7F4ED] font-sans selection:bg-[#C8843B] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />
                {/* 2. DYNAMIC CONTROLLER HUB */}
                <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
                    
                    {scannedTable && (
                        <ScrollReveal variant="fade-down" duration={500}>
                            <div className="bg-[#2E1A12] text-white p-4 rounded-[20px] flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#C8843B] p-2 rounded-xl text-white">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-wide">You are ordering for Table {scannedTable}</h3>
                                        <p className="text-[10px] text-gray-300 font-medium">Your items will be delivered directly to this table.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('scannedTableNumber');
                                        setScannedTable(null);
                                    }}
                                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    Change
                                </button>
                            </div>
                        </ScrollReveal>
                    )}

                    {/* Search & Overview Stats */}
                    <ScrollReveal variant="fade-up" duration={600}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/70 backdrop-blur-md p-6 rounded-[28px] border border-[#C8843B]/10 shadow-[0_10px_20px_rgba(46,26,18,0.01)]">
                            <div className="w-full md:w-96 relative">
                                <input 
                                    type="text"
                                    placeholder="Search by name, category, or code (e.g. 4001)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F7F4ED]/80 border border-[#C8843B]/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
                                />
                                <Search className="w-4 h-4 text-[#C8843B] absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
                                <span className="bg-[#2E1A12] text-white px-3.5 py-1.5 rounded-full shadow-sm">
                                    {filteredItems.length} items found
                                </span>
                                {selectedCategory !== 'All' && (
                                    <button 
                                        onClick={() => setSelectedCategory('All')}
                                        className="text-[#C8843B] hover:underline cursor-pointer"
                                    >
                                        Clear category filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Horizontal scrollable category list */}
                    <ScrollReveal variant="fade-up" duration={700} delay={100}>
                        <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-thin scrollbar-thumb-[#C8843B]/20 scrollbar-track-transparent custom-scrollbar">
                            {categories.map(cat => {
                                const isActive = selectedCategory === cat.name;
                                const count = getCategoryCount(cat.name);
                                if (count === 0) return null;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-300 border cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md ${
                                            isActive 
                                                ? 'bg-[#C8843B] border-[#C8843B] text-white' 
                                                : 'bg-white border-[#C8843B]/10 hover:border-[#C8843B]/30 text-[#2E1A12]/80 hover:text-[#2E1A12]'
                                        }`}
                                    >
                                        <span>{getCategoryEmoji(cat.name)}</span>
                                        <span>{cat.name}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollReveal>



                    {/* 3. MENU STAGGERED LIST */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm max-w-md mx-auto">
                            <Compass className="w-12 h-12 text-[#C8843B]/30 mx-auto mb-4 animate-bounce" />
                            <h3 className="text-lg font-bold text-[#2E1A12] font-serif">No dishes found</h3>
                            <p className="text-xs text-gray-400 mt-2 font-semibold">Try modifying your search or select a different category filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredItems.map((item, idx) => {
                                const finalPrice = item.price;
                                
                                return (
                                    <ScrollReveal 
                                        key={item.code} 
                                        variant="fade-up" 
                                        duration={800} 
                                        delay={(idx % 6) * 100}
                                        className="h-full"
                                    >
                                        <div className={`bg-white rounded-[32px] shadow-[0_15px_30px_rgba(46,26,18,0.02)] border overflow-hidden transition-all duration-500 flex flex-col justify-between h-full group ${
                                            item.isAvailable
                                                ? 'border-[#C8843B]/10 hover:shadow-2xl hover:-translate-y-1.5'
                                                : 'border-gray-200 opacity-70 grayscale-[35%]'
                                        }`}>

                                            {/* Top Card Area */}
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-[#C8843B] bg-[#FDF6ED] px-2.5 py-1 rounded-xl border border-[#C8843B]/10 shadow-sm">
                                                            Code: {item.code}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                    {item.isAvailable ? (
                                                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-wide shrink-0">
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg uppercase tracking-wide shrink-0">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-extrabold text-[#2E1A12] font-serif group-hover:text-[#C8843B] transition-colors leading-tight">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Interactive Selector / Bottom Pricing Area */}
                                            <div className="p-6 pt-0 space-y-4">

                                                {/* Price & Action Row */}
                                                <div className="flex items-center justify-between border-t border-[#F7F4ED] pt-4 mt-2">
                                                    <div>
                                                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Price</div>
                                                        <div className="text-xl font-black text-[#C8843B] transition-all duration-300">
                                                            Rs. {(finalPrice || 0).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            disabled={!item.isAvailable}
                                                            className={`p-3 rounded-2xl shadow-sm transition-all duration-300 ${
                                                                item.isAvailable
                                                                    ? 'bg-[#F7F4ED] text-[#C8843B] hover:bg-[#C8843B] hover:text-white cursor-pointer'
                                                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                            }`}
                                                            title={item.isAvailable ? 'Add to Cart' : 'Out of stock'}
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBuyItem(item)}
                                                            disabled={!item.isAvailable}
                                                            className={`flex items-center gap-1.5 font-black text-xs px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                                                                item.isAvailable
                                                                    ? 'bg-[#2E1A12] hover:bg-[#C8843B] text-white hover:shadow-md cursor-pointer'
                                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <ShoppingBag className={`w-3.5 h-3.5 ${item.isAvailable ? 'text-[#C8843B]' : 'text-gray-400'}`} />
                                                            <span>{item.isAvailable ? 'Order' : 'Unavailable'}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </ScrollReveal>
                                );
                            })}
                        </div>
                    )}

                    {/* Service Charge / Policy notes */}
                    <ScrollReveal variant="fade-up" duration={800} delay={100}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e6dfd5] pt-8 text-center text-xs font-extrabold text-gray-400 max-w-4xl mx-auto">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Prepared fresh in a clean, state-of-the-art kitchen environment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-[#C8843B]" />
                                <span className="uppercase tracking-wider">All items are subject to a 10% service charge</span>
                            </div>
                        </div>
                    </ScrollReveal>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Menus;
