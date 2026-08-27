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
    ChevronRight, Compass, ShieldCheck, HelpCircle, Leaf, QrCode, X
} from 'lucide-react';
import { wijayasiriMenuData, mockMenuCategories } from '../../data/mockMenus';

const Menus = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [scannedTable, setScannedTable] = useState(null);
    const [sizeSelectModal, setSizeSelectModal] = useState({ isOpen: false, item: null, action: null });

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

    // Fetch dynamic menus from admin page database api
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                let allItems = [];
                
                // Fetch Food Menus
                try {
                    const { data } = await api.get('/menus');
                    if (data && data.length > 0) {
                        const activeMenus = data.filter(item => (item.status || '').toLowerCase() === 'active');
                        const mappedMenus = activeMenus.map(item => ({
                            code: `M${item.id}`,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category_name || 'General',
                            image_url: item.image_url,
                            is_available: item.is_available,
                            status: item.status,
                            portion_type: item.portion_type,
                            price_small: item.price_small,
                            price_large: item.price_large,
                            discount_percentage: item.discount_percentage
                        }));
                        allItems = [...allItems, ...mappedMenus];
                    }
                } catch (err) {
                    console.error("Failed to fetch menus from API", err);
                }

                // Fetch Beverages
                try {
                    const { data: bevData } = await api.get('/beverages');
                    if (bevData && bevData.length > 0) {
                        const activeBevs = bevData.filter(item => (item.status || '').toLowerCase() === 'active');
                        const mappedBevs = activeBevs.map(item => ({
                            code: `B${item.id}`,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category_name || 'Beverages',
                            image_url: item.image_url,
                            is_available: item.is_available,
                            status: item.status,
                            portion_type: item.portion_type || 'standard',
                            price_small: item.price_small,
                            price_large: item.price_large,
                            price_variants: typeof item.price_variants === 'string' ? JSON.parse(item.price_variants) : item.price_variants,
                            discount_percentage: item.discount_percentage
                        }));
                        allItems = [...allItems, ...mappedBevs];
                    }
                } catch (err) {
                    console.error("Failed to fetch beverages from API", err);
                }

                setMenuItems(allItems);
            } catch (err) {
                console.error("Failed to fetch data", err);
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
        if (!user) {
            toast.error('Please log in to add items to your cart');
            navigate('/secure-login');
            return;
        }

        if (item.portion_type === 'varied' || item.portion_type === 'bottles') {
            setSizeSelectModal({ isOpen: true, item, action: 'cart' });
            return;
        }

        const itemId = `wijayasiri-${item.code}`;
        const finalName = item.name;
        const finalPrice = item.price || 0;

        const cartItem = { 
            id: itemId, 
            name: finalName, 
            price: finalPrice, 
            quantity: 1 
        };

        addToCart(cartItem);
        toast.success(`Added ${finalName} to cart!`, { icon: '🛒' });
    };

    // Direct Buy
    const handleBuyItem = (item) => {
        if (!user) {
            toast.error('Please log in to place an order');
            navigate('/secure-login');
            return;
        }

        if (item.portion_type === 'varied' || item.portion_type === 'bottles') {
            setSizeSelectModal({ isOpen: true, item, action: 'buy' });
            return;
        }

        const itemId = `wijayasiri-${item.code}`;
        const finalName = item.name;
        const discount = Number(item.discount_percentage) || 0;
        const discountedPrice = discount > 0 ? (item.price * (1 - discount / 100)) : item.price;
        const finalPrice = discountedPrice || 0;

        const orderItem = { 
            id: itemId, 
            name: finalName, 
            price: finalPrice, 
            quantity: 1 
        };

        navigate('/order', { state: { menu: orderItem } });
    };

    // Handle size selection from modal
    const handleSizeSelection = (variant) => {
        const { item, action } = sizeSelectModal;
        let sizeId = '';
        let sizeName = '';
        let finalPrice = 0;

        if (typeof variant === 'string') {
            sizeId = variant;
            sizeName = variant === 'small' ? 'Small' : 'Large';
            finalPrice = variant === 'small' ? item.price_small : item.price_large;
        } else {
            sizeId = variant.size.replace(/\s+/g, '-').toLowerCase();
            sizeName = variant.size;
            finalPrice = variant.price;
        }

        const discount = Number(item.discount_percentage) || 0;
        const discountedPrice = discount > 0 ? (finalPrice * (1 - discount / 100)) : finalPrice;

        const itemId = `wijayasiri-${item.code}-${sizeId}`;
        const finalName = `${item.name} (${sizeName})`;

        const payloadItem = {
            id: itemId,
            name: finalName,
            price: discountedPrice || 0,
            quantity: 1
        };

        if (action === 'cart') {
            addToCart(payloadItem);
            toast.success(`Added ${finalName} to cart!`, { icon: '🛒' });
        } else {
            navigate('/order', { state: { menu: payloadItem } });
        }
        setSizeSelectModal({ isOpen: false, item: null, action: null });
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
            'Seafood Dishes': '🦀'
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
                                        <div className="bg-white rounded-[32px] shadow-[0_15px_30px_rgba(46,26,18,0.02)] border border-[#C8843B]/10 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full group">
                                            
                                            {/* Top Card Area */}
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {Number(item.discount_percentage) > 0 && (
                                                            <span className="text-[10px] font-black text-white bg-red-500 px-2.5 py-1 rounded-xl border border-red-600 shadow-sm animate-pulse">
                                                                {Number(item.discount_percentage)}% OFF
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-black text-[#C8843B] bg-[#FDF6ED] px-2.5 py-1 rounded-xl border border-[#C8843B]/10 shadow-sm">
                                                            Code: {item.code}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                            {item.category}
                                                        </span>
                                                        {(!item.is_available || item.status !== 'active') && (
                                                            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100 uppercase tracking-wider">
                                                                Out of Stock
                                                            </span>
                                                        )}
                                                    </div>
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
                                                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{item.portion_type === 'varied' ? 'Small / Large' : 'Price'}</div>
                                                        <div className="text-xl font-black text-[#C8843B] transition-all duration-300">
                                                            {item.portion_type === 'varied' ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-gray-700 text-sm">
                                                                        <span className="text-[10px] text-gray-400 font-bold mr-1">S:</span> 
                                                                        {Number(item.discount_percentage) > 0 ? (
                                                                            <>
                                                                                <span className="line-through text-gray-400 text-xs mr-2">Rs. {(item.price_small || 0).toLocaleString()}</span>
                                                                                <span className="text-[#C8843B]">Rs. {((item.price_small || 0) * (1 - item.discount_percentage/100)).toLocaleString()}</span>
                                                                            </>
                                                                        ) : `Rs. ${(item.price_small || 0).toLocaleString()}`}
                                                                    </span>
                                                                    <span className="text-gray-700 text-sm">
                                                                        <span className="text-[10px] text-gray-400 font-bold mr-1">L:</span> 
                                                                        {Number(item.discount_percentage) > 0 ? (
                                                                            <>
                                                                                <span className="line-through text-gray-400 text-xs mr-2">Rs. {(item.price_large || 0).toLocaleString()}</span>
                                                                                <span className="text-[#C8843B]">Rs. {((item.price_large || 0) * (1 - item.discount_percentage/100)).toLocaleString()}</span>
                                                                            </>
                                                                        ) : `Rs. ${(item.price_large || 0).toLocaleString()}`}
                                                                    </span>
                                                                </div>
                                                            ) : item.portion_type === 'bottles' && item.price_variants && item.price_variants.length > 0 ? (
                                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] leading-tight">
                                                                    {item.price_variants.map((v, i) => (
                                                                        <span key={i} className="text-gray-700 whitespace-nowrap">
                                                                            <span className="text-gray-400 font-bold mr-1">{v.size}:</span> 
                                                                            {Number(item.discount_percentage) > 0 ? (
                                                                                <>
                                                                                    <span className="line-through text-gray-400 mr-1">Rs. {(Number(v.price) || 0).toLocaleString()}</span>
                                                                                    <span className="text-[#C8843B]">Rs. {((Number(v.price) || 0) * (1 - item.discount_percentage/100)).toLocaleString()}</span>
                                                                                </>
                                                                            ) : `Rs. ${(Number(v.price) || 0).toLocaleString()}`}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                Number(item.discount_percentage) > 0 ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="line-through text-gray-400 text-sm">Rs. {(item.price || 0).toLocaleString()}</span>
                                                                        <span>Rs. {((item.price || 0) * (1 - item.discount_percentage/100)).toLocaleString()}</span>
                                                                    </div>
                                                                ) : `Rs. ${(item.price || 0).toLocaleString()}`
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            disabled={!item.is_available || item.status !== 'active'}
                                                            className={`p-3 rounded-2xl shadow-sm transition-all duration-300 ${(!item.is_available || item.status !== 'active') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#F7F4ED] text-[#C8843B] hover:bg-[#C8843B] hover:text-white cursor-pointer'}`}
                                                            title={(!item.is_available || item.status !== 'active') ? "Currently Unavailable" : "Add to Cart"}
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBuyItem(item)}
                                                            disabled={!item.is_available || item.status !== 'active'}
                                                            className={`flex items-center gap-1.5 font-black text-xs px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${(!item.is_available || item.status !== 'active') ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#2E1A12] hover:bg-[#C8843B] text-white hover:shadow-md cursor-pointer'}`}
                                                        >
                                                            <ShoppingBag className={`w-3.5 h-3.5 ${(!item.is_available || item.status !== 'active') ? 'text-gray-400' : 'text-[#C8843B]'}`} />
                                                            <span>{(!item.is_available || item.status !== 'active') ? 'Unavailable' : 'Order'}</span>
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

            {/* Size Selection Modal */}
            {sizeSelectModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1A12]/60 backdrop-blur-sm p-4">
                    <ScrollReveal variant="fade-up" duration={400} className="w-full max-w-sm">
                        <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-[#C8843B]/20 w-full relative">
                            <button 
                                onClick={() => setSizeSelectModal({ isOpen: false, item: null, action: null })}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <h3 className="text-xl font-extrabold text-[#2E1A12] font-serif mb-1 pr-8">Select Portion Size</h3>
                            <p className="text-sm font-semibold text-gray-500 mb-6">{sizeSelectModal.item?.name}</p>
                            
                            <div className="space-y-3">
                                                                {sizeSelectModal.item?.portion_type === 'bottles' && sizeSelectModal.item?.price_variants ? (
                                                                    sizeSelectModal.item.price_variants.map((variant, idx) => (
                                                                        <button 
                                                                            key={idx}
                                                                            onClick={() => handleSizeSelection(variant)}
                                                                            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#C8843B]/10 hover:border-[#C8843B] hover:bg-[#C8843B]/5 transition-all text-left group"
                                                                        >
                                                                            <span className="font-extrabold text-[#2E1A12] group-hover:text-[#C8843B] transition-colors">{variant.size}</span>
                                                                            <span className="font-black text-[#C8843B] bg-[#C8843B]/10 px-3 py-1 rounded-xl">Rs. {(Number(variant.price) || 0).toLocaleString()}</span>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handleSizeSelection('small')}
                                                                            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#C8843B]/10 hover:border-[#C8843B] hover:bg-[#C8843B]/5 transition-all text-left group"
                                                                        >
                                                                            <span className="font-extrabold text-[#2E1A12] group-hover:text-[#C8843B] transition-colors">Small Portion</span>
                                                                            <span className="font-black text-[#C8843B] bg-[#C8843B]/10 px-3 py-1 rounded-xl">Rs. {(sizeSelectModal.item?.price_small || 0).toLocaleString()}</span>
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleSizeSelection('large')}
                                                                            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#C8843B]/10 hover:border-[#C8843B] hover:bg-[#C8843B]/5 transition-all text-left group"
                                                                        >
                                                                            <span className="font-extrabold text-[#2E1A12] group-hover:text-[#C8843B] transition-colors">Large Portion</span>
                                                                            <span className="font-black text-[#C8843B] bg-[#C8843B]/10 px-3 py-1 rounded-xl">Rs. {(sizeSelectModal.item?.price_large || 0).toLocaleString()}</span>
                                                                        </button>
                                                                    </>
                                                                )}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            )}
        </div>
    );
};

export default Menus;
