import React, { useEffect, useState } from 'react';
import { getCart, addToCart, clearCart } from '../../services/cart';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import toast from 'react-hot-toast';
import { ShoppingBag, CreditCard, Trash2, ArrowRight, Utensils, Package } from 'lucide-react';
import api from '../../services/api';

const Order = () => {
    const [items, setItems] = useState([]);
    const [orderType, setOrderType] = useState('takeaway'); // 'dine-in' or 'takeaway'
    const [tableNumber, setTableNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // If navigated with a menu in state, add to cart
        if (location.state && location.state.menu) {
            const menu = location.state.menu;
            addToCart({
                id: menu.id,
                name: menu.name,
                price: menu.price,
                quantity: 1,
                menuId: menu.menuId || null,
                beverageId: menu.beverageId || null
            });
        }
        setItems(getCart());
        
        // Check for scanned table number
        const scanned = localStorage.getItem('scannedTableNumber');
        if (scanned) {
            setTableNumber(scanned);
            setOrderType('dine-in'); // Default to dine-in if scanned QR
        }
    }, [location.state]);

    const handleCheckout = async () => {
        if (!items || items.length === 0) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to place an order.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const formattedItems = items.map(item => {
                let productId = item.productId || null;
                let menuId = item.menuId || null;
                let beverageId = item.beverageId || null;

                // Legacy items (added before explicit ids existed) fall back to inferring from the string id
                if (!productId && !menuId && !beverageId && typeof item.id === 'string') {
                    if (item.id.includes('-B') && !item.id.includes('-M')) {
                        const match = item.id.match(/B(\d+)/);
                        if (match) beverageId = parseInt(match[1]);
                    } else if (item.id.includes('-M') || item.id.includes('menu-')) {
                        const match = item.id.match(/M(\d+)/) || item.id.match(/menu-(\d+)/);
                        if (match) menuId = parseInt(match[1]);
                    } else if (item.id.includes('product-')) {
                        const match = item.id.match(/product-(\d+)/);
                        if (match) productId = parseInt(match[1]);
                    }
                }

                return {
                    productId,
                    menuId,
                    beverageId,
                    quantity: item.quantity || 1,
                    price: item.price
                };
            });
            
            const { data: order } = await api.post('/orders', {
                items: formattedItems,
                order_type: orderType,
                table_number: orderType === 'dine-in' ? tableNumber : null
            });

            const { data: checkout } = await api.post('/payments/create-checkout-session', {
                orderId: order.orderId
            });

            clearCart();
            setItems([]);
            window.location.href = checkout.url;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
            setLoading(false);
        }
    };

    const handleClearCart = () => {
        clearCart();
        setItems([]);
        toast.success('Your cart has been cleared.');
    };

    const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />

                <main className="max-w-4xl mx-auto px-6 py-16">
                    <ScrollReveal variant="fade-up" duration={900}>
                        <div className="flex flex-col items-center text-center mb-12">
                            <span className="text-[#C8843B] text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5 block">Review Your Order</span>
                            <h2 className="text-4xl font-bold text-[#2c1d11] font-serif">Smart Cart Checkout</h2>
                        </div>
                    </ScrollReveal>

                    {!items || items.length === 0 ? (
                        <ScrollReveal variant="fade-up" duration={800} delay={150}>
                            <div className="bg-white rounded-3xl p-12 text-center shadow-[0_15px_30px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 flex flex-col items-center gap-6">
                                <ShoppingBag className="w-16 h-16 text-[#e6dfd5] animate-pulse" />
                                <div>
                                    <h3 className="text-xl font-bold font-serif mb-2">Your Cart is Empty</h3>
                                    <p className="text-xs text-gray-400">Explore our delicious menus or daily deals to add fresh items.</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/menus')} 
                                    className="bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-xs py-3.5 px-8 rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                    Go To Menu
                                </button>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Items List */}
                            <div className="w-full lg:w-2/3 space-y-4">
                                {items.map((it, idx) => (
                                    <ScrollReveal 
                                        key={idx} 
                                        variant="fade-up" 
                                        duration={800} 
                                        delay={idx * 100}
                                    >
                                        <div className="bg-white rounded-2xl p-5 shadow-[0_8px_20px_rgba(46,26,18,0.02)] border border-[#f0e6d8]/40 flex items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                            <div>
                                                <h4 className="font-bold text-[#2E1A12] text-sm font-serif">{it.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Quantity: {it.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-extrabold text-[#C8843B] text-base">Rs. {(it.price || 0) * (it.quantity || 1)}</div>
                                                <div className="text-[9px] text-gray-400 font-medium">Rs. {it.price} each</div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>

                            {/* Summary panel */}
                            <div className="w-full lg:w-1/3">
                                <ScrollReveal variant="fade-up" duration={800} delay={200}>
                                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_15px_30px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 space-y-6">
                                        <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-[#C8843B]" /> Summary
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Order Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button 
                                                    onClick={() => setOrderType('takeaway')}
                                                    className={`py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border ${orderType === 'takeaway' ? 'bg-[#2E1A12] text-white border-[#2E1A12]' : 'bg-transparent text-gray-400 border-gray-200 hover:border-[#2E1A12] hover:text-[#2E1A12]'}`}
                                                >
                                                    <Package className="w-4 h-4" /> Takeaway
                                                </button>
                                                <button 
                                                    onClick={() => setOrderType('dine-in')}
                                                    className={`py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border ${orderType === 'dine-in' ? 'bg-[#2E1A12] text-white border-[#2E1A12]' : 'bg-transparent text-gray-400 border-gray-200 hover:border-[#2E1A12] hover:text-[#2E1A12]'}`}
                                                >
                                                    <Utensils className="w-4 h-4" /> Dine-in
                                                </button>
                                            </div>
                                        </div>

                                        {orderType === 'dine-in' && (
                                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Table Number (Optional)</label>
                                                <input 
                                                    type="text"
                                                    placeholder="e.g. 5"
                                                    value={tableNumber}
                                                    onChange={(e) => setTableNumber(e.target.value)}
                                                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-3.5 border-t border-b border-gray-100 py-4 mt-4 text-xs font-semibold text-gray-500">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span className="text-[#2E1A12]">Rs. {total}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Smart QR Discount</span>
                                                <span className="text-green-600 font-bold">Rs. 0 (Free)</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between font-bold text-lg text-[#2E1A12] font-serif">
                                            <span>Total</span>
                                            <span className="text-[#C8843B]">Rs. {total}</span>
                                        </div>

                                        <div className="pt-2 flex flex-col gap-3 font-sans">
                                            <button 
                                                onClick={handleCheckout} 
                                                disabled={loading}
                                                className="w-full bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                            >
                                                {loading ? 'Redirecting to payment...' : 'Proceed to Payment'} <ArrowRight className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={handleClearCart} 
                                                disabled={loading}
                                                className="w-full border border-[#e6dfd5] hover:border-red-500 hover:text-red-500 text-gray-400 font-semibold text-xs py-3 px-4 rounded-xl transition-all duration-300 bg-transparent flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" /> Clear Cart
                                            </button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Order;
