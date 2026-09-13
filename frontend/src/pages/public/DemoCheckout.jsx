import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import toast from 'react-hot-toast';
import { CreditCard, Lock, ShieldCheck, Loader2, ArrowLeft, CheckCircle2, Wifi, Zap } from 'lucide-react';
import api from '../../services/api';

const DemoCheckout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');

    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Card Form State
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get('/orders/my-orders');
                const matched = data.find(o => String(o.id) === String(orderId));
                if (matched) {
                    setOrder(matched);
                }
            } catch (err) {
                console.error('Failed to fetch order details', err);
            } finally {
                setLoadingOrder(false);
            }
        };
        if (orderId) {
            fetchOrder();
        } else {
            setLoadingOrder(false);
        }
    }, [orderId]);

    const handleAutofill = () => {
        setCardName('Wijayasiri Fresh Food');
        setCardNumber('4242 4242 4242 4242');
        setExpiry('12/28');
        setCvc('424');
        toast.success('Test Card details auto-filled', { icon: '💳' });
    };

    const handleFormatCardNumber = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        setCardNumber(formatted);
    };

    const handleFormatExpiry = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 3) {
            setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
        } else {
            setExpiry(value);
        }
    };

    const handlePay = (e) => {
        e.preventDefault();

        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            toast.error('Please enter a valid 16-digit card number.');
            return;
        }

        if (!expiry || expiry.length < 5) {
            toast.error('Please enter a valid expiry date (MM/YY).');
            return;
        }

        if (!cvc || cvc.length < 3) {
            toast.error('Please enter a valid CVC.');
            return;
        }

        setProcessing(true);

        // Simulate real payment processing time
        setTimeout(() => {
            toast.success('Payment Processed Successfully!', { icon: '✅' });
            navigate(`/order/success?session_id=${sessionId}&orderId=${orderId}`);
        }, 1500);
    };

    const totalAmount = order ? Number(order.total_amount).toFixed(2) : '0.00';
    const displayCardNumber = cardNumber ? cardNumber : '•••• •••• •••• ••••';
    const displayCardName = cardName ? cardName.toUpperCase() : 'YOUR NAME HERE';
    const displayExpiry = expiry ? expiry : 'MM/YY';

    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />

                <main className="max-w-xl mx-auto px-6 py-10 lg:py-14">
                    <ScrollReveal variant="fade-up" duration={800}>
                        <div className="mb-6 flex items-center justify-between">
                            <Link to="/order" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#C8843B] transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Return to Cart
                            </Link>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> PCI-DSS Secure Checkout
                            </div>
                        </div>

                        {/* Payment Box Form */}
                        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_20px_40px_rgba(46,26,18,0.05)] border border-[#f0e6d8]/60 space-y-6">
                            
                            {/* Header Summary */}
                            <div className="border-b border-gray-100 pb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold font-serif text-[#2E1A12]">Pay with Card</h2>
                                    {orderId && <p className="text-xs text-gray-400 mt-0.5">Order #{orderId}</p>}
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
                                    <div className="text-2xl font-extrabold text-[#C8843B]">Rs. {totalAmount}</div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handlePay} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Cardholder Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Full name as shown on card"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-bold text-gray-600 uppercase">Card Number</label>
                                        <button 
                                            type="button" 
                                            onClick={handleAutofill} 
                                            className="text-[10px] font-bold text-[#C8843B] hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <Zap className="w-3 h-3" /> Auto-fill Test Card
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            placeholder="1234  5678  9012  3456"
                                            value={cardNumber}
                                            onChange={handleFormatCardNumber}
                                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm font-mono font-semibold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all tracking-wider"
                                            required
                                        />
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
                                            <CreditCard className="w-5 h-5 text-[#C8843B]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Expiry Date</label>
                                        <input 
                                            type="text"
                                            placeholder="MM / YY"
                                            value={expiry}
                                            onChange={handleFormatExpiry}
                                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-3 px-4 text-sm font-mono font-semibold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all text-center tracking-widest"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">CVC / CVV</label>
                                        <input 
                                            type="password"
                                            placeholder="123"
                                            maxLength={4}
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-3 px-4 text-sm font-mono font-semibold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all text-center tracking-widest"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-sm py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin text-[#C8843B]" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 text-[#C8843B]" />
                                                Pay Rs. {totalAmount}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </ScrollReveal>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default DemoCheckout;
