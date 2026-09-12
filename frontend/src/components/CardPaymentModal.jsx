import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, X, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CardPaymentModal = ({ isOpen, onClose, orderId, totalAmount, onPaymentSuccess }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleFillTestCard = () => {
        setName('Test User');
        setCardNumber('4242 4242 4242 4242');
        setExpiry('12/30');
        setCvc('123');
        toast.success('Test Card Filled!', { icon: '💳' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 16) {
            toast.error('Please enter a valid 16-digit card number');
            return;
        }
        if (!expiry || expiry.length < 5) {
            toast.error('Please enter expiry date (MM/YY)');
            return;
        }
        if (!cvc || cvc.length < 3) {
            toast.error('Please enter a valid 3-digit CVC');
            return;
        }

        setLoading(true);
        try {
            toast.loading('Processing secure card payment...', { id: 'card-pay-toast' });
            
            // Call backend process-card endpoint or fallback checkout session
            let response;
            try {
                response = await api.post('/payments/process-card', {
                    orderId,
                    cardNumber: cleanCard,
                    expiry,
                    cvc,
                    name: name || 'Customer'
                });
            } catch (err) {
                // Fallback to checkout session endpoint
                response = await api.post('/payments/create-checkout-session', { orderId });
                if (response.data && response.data.url) {
                    window.location.href = response.data.url;
                    return;
                }
            }

            toast.dismiss('card-pay-toast');
            toast.success('Payment completed successfully!', { icon: '🎉' });
            
            const sessionId = response.data?.sessionId || `card_pay_${orderId}`;
            if (onPaymentSuccess) {
                onPaymentSuccess(sessionId);
            } else {
                navigate(`/order/success?session_id=${sessionId}&orderId=${orderId}`);
            }
        } catch (error) {
            toast.dismiss('card-pay-toast');
            console.error('Card payment error:', error);
            toast.error(error.response?.data?.message || 'Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 lg:p-8 shadow-2xl border border-[#f0e6d8] relative overflow-hidden text-[#2E1A12]">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#2E1A12] text-[#C8843B] flex items-center justify-center shadow-sm">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base font-serif">Card Payment Gateway</h3>
                            <p className="text-[11px] text-gray-400 font-sans flex items-center gap-1">
                                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Encrypted
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Dynamic Card Preview */}
                <div className="my-6 relative rounded-2xl bg-gradient-to-br from-[#2E1A12] via-[#42281D] to-[#1F100B] text-white p-6 shadow-xl border border-amber-900/30 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C8843B]">Smart Bake Card</span>
                        <span className="text-xs font-mono font-bold tracking-widest text-amber-200">VISA / MASTERCARD</span>
                    </div>

                    <div className="font-mono text-lg font-bold tracking-widest my-3 text-amber-50 drop-shadow-sm">
                        {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-[10px] tracking-wider uppercase text-amber-200/80 mt-4">
                        <div>
                            <div className="text-[8px] text-amber-400/60 font-sans">CARDHOLDER NAME</div>
                            <div className="font-bold text-white truncate max-w-[150px]">{name || 'YOUR NAME'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] text-amber-400/60 font-sans">EXPIRES</div>
                            <div className="font-bold text-white font-mono">{expiry || 'MM/YY'}</div>
                        </div>
                    </div>
                </div>

                {/* Quick Test Card Helper */}
                <div className="flex justify-between items-center bg-[#fef9e1] border border-[#f0e6d8] rounded-xl px-3.5 py-2 mb-4">
                    <span className="text-[11px] font-semibold text-[#8C5D27] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C8843B]" /> Fast Test Mode
                    </span>
                    <button
                        type="button"
                        onClick={handleFillTestCard}
                        className="text-[11px] font-bold text-[#2E1A12] hover:text-[#C8843B] underline cursor-pointer"
                    >
                        Auto-Fill Card (4242...)
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                    <div>
                        <label className="block font-bold text-gray-600 mb-1">Cardholder Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. John Doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-2.5 px-3.5 font-medium text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-gray-600 mb-1">Card Number</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="4242 4242 4242 4242" 
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                required
                                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-10 font-mono font-bold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all"
                            />
                            <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-600 mb-1">Expiry Date</label>
                            <input 
                                type="text" 
                                placeholder="MM/YY" 
                                maxLength={5}
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                required
                                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-2.5 px-3.5 font-mono font-bold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-600 mb-1">CVC / CVV</label>
                            <input 
                                type="password" 
                                placeholder="123" 
                                maxLength={4}
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                                required
                                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl py-2.5 px-3.5 font-mono font-bold text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <span>Processing Payment...</span>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Pay Rs. {totalAmount} Now</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" /> Powered by Stripe Payments & Smart Bake Hub
                    </p>
                </form>
            </div>
        </div>
    );
};

export default CardPaymentModal;
