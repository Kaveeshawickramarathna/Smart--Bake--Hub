import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Tag, Sparkles } from 'lucide-react';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { addToCart } from '../../services/cart';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SmartDeals = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                // Fetch from all sources
                const [productsRes, menusRes, beveragesRes] = await Promise.all([
                    api.get('/products?discounted=true').catch(() => ({ data: [] })),
                    api.get('/menus?discounted=true').catch(() => ({ data: [] })),
                    api.get('/beverages?discounted=true').catch(() => ({ data: [] }))
                ]);
                
                const products = productsRes.data || [];
                const menus = menusRes.data || [];
                const beverages = beveragesRes.data || [];
                
                // Format menus to match deal structure
                const formattedMenus = menus.map(m => ({
                    ...m,
                    item_type: 'menu',
                    deal_id: `menu-${m.id}`,
                    price: m.portion_type === 'varied' ? m.price_small : m.price
                }));
                
                // Format beverages to match deal structure
                const formattedBeverages = beverages.map(b => ({
                    ...b,
                    item_type: 'beverage',
                    deal_id: `beverage-${b.id}`,
                    price: b.portion_type === 'bottles' && b.price_variants ? (typeof b.price_variants === 'string' ? JSON.parse(b.price_variants)[0]?.price : b.price_variants[0]?.price) : b.price
                }));
                
                // Format products
                const formattedProducts = products.map(p => ({
                    ...p,
                    item_type: 'product',
                    deal_id: `product-${p.id}`
                }));

                // Merge and filter
                const allDeals = [...formattedProducts, ...formattedMenus, ...formattedBeverages];
                const activeDeals = allDeals.filter(d => Number(d.discount_percentage) > 0);
                
                setDeals(activeDeals);
            } catch (error) {
                console.error("Failed to fetch deals", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleAddToCart = (deal) => {
        if (!user) {
            toast.error('Please log in to add items to your cart');
            navigate('/secure-login');
            return;
        }
        const item = { 
            id: deal.deal_id, 
            productId: deal.item_type === 'product' ? deal.id : null, 
            menuId: deal.item_type === 'menu' ? deal.id : null,
            beverageId: deal.item_type === 'beverage' ? deal.id : null,
            name: deal.name, 
            price: Number(deal.price) * (1 - deal.discount_percentage / 100), 
            quantity: 1 
        };
        addToCart(item);
        toast.success('Added to cart');
    };

    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />

                <main className="max-w-[1400px] mx-auto px-6 py-12">
                    
                    {/* Header Reveal */}
                    <ScrollReveal variant="fade-up" duration={900}>
                        <div className="flex flex-col items-center justify-center text-center mb-16">
                            <div className="inline-flex items-center gap-1.5 bg-[#d68b3b]/10 text-[#d68b3b] px-3.5 py-1.5 rounded-full mb-4 font-semibold text-xs">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Exclusive Savings</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#2c1d11] font-serif flex flex-col items-center">
                                Smart Deals
                                <svg width="80" height="20" viewBox="0 0 80 20" fill="none" className="mt-4 text-[#d68b3b]">
                                    <path d="M40 10c-5-2-10-5-20-5S5 8 5 8m35 2c5-2 10-5 20-5s15 3 15 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                </svg>
                            </h1>
                            <p className="text-[#888] mt-4 max-w-xl mx-auto font-sans text-sm font-medium">
                                Discover our chef's hand-picked selection of discounted pastries, cakes, and treats. These special prices won't last forever!
                            </p>
                        </div>
                    </ScrollReveal>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d68b3b] border-t-transparent"></div>
                        </div>
                    ) : deals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {deals.map((deal, idx) => (
                                <ScrollReveal 
                                    key={deal.deal_id} 
                                    variant="fade-up" 
                                    duration={800} 
                                    delay={idx * 120}
                                    className="h-full"
                                >
                                    <div className="group bg-white rounded-3xl p-4 shadow-[0_15px_30px_rgba(46,26,18,0.03)] border border-[#e6dfd5]/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-full">
                                        
                                        {/* Discount Badge */}
                                        <div className="absolute top-4 right-4 bg-[#d68b3b] text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 shadow-md flex items-center gap-1">
                                            <Tag className="w-3.5 h-3.5" />
                                            {deal.discount_percentage}% OFF
                                        </div>
                                        
                                        {/* Image */}
                                        <div className="w-full h-[220px] rounded-2xl overflow-hidden bg-[#fef9e1] mb-4 relative">
                                            <img 
                                                src={deal.image_url ? deal.image_url : 'https://images.unsplash.com/photo-1557142046-c704a3adf364?q=80&w=400&auto=format&fit=crop'} 
                                                alt={deal.name} 
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex flex-col flex-1">
                                            <h3 className="font-bold text-[#2E1A12] font-serif text-lg leading-tight line-clamp-1 mb-1 group-hover:text-[#C8843B] transition-colors">{deal.name}</h3>
                                            <p className="text-gray-400 text-xs line-clamp-2 mb-4 font-sans font-medium">{deal.description}</p>
                                            
                                            <div className="mt-auto flex items-end justify-between">
                                                <div>
                                                    <div className="text-gray-400 text-[10px] line-through font-sans">Rs. {Number(deal.price).toFixed(2)}</div>
                                                    <div className="text-[#d68b3b] font-bold text-lg font-serif">
                                                        Rs. {(Number(deal.price) * (1 - deal.discount_percentage / 100)).toFixed(2)}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleAddToCart(deal)}
                                                    className="bg-[#2E1A12] hover:bg-[#d68b3b] text-white p-3 rounded-full transition-colors shadow-md cursor-pointer"
                                                >
                                                    <ShoppingCart className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <ScrollReveal variant="fade-up" duration={800}>
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <Tag className="w-16 h-16 text-[#e6dfd5] mb-4 animate-[bounce_3s_infinite]" />
                                <h2 className="text-2xl font-bold text-[#2E1A12] font-serif mb-2">No Active Deals Right Now</h2>
                                <p className="text-gray-500 font-sans text-sm">Check back later for exclusive discounts and offers!</p>
                            </div>
                        </ScrollReveal>
                    )}
                </main>
            </div>
            
            <Footer />
        </div>
    );
};

export default SmartDeals;
