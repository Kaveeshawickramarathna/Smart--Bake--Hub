import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking'); // 'checking' | 'paid' | 'unpaid' | 'error'
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const confirm = async () => {
            if (!sessionId) {
                setStatus('error');
                return;
            }
            try {
                const { data } = await api.get(`/payments/confirm/${sessionId}`);
                setStatus(data.paid ? 'paid' : 'unpaid');
            } catch (error) {
                console.error('Payment confirmation failed:', error);
                setStatus('error');
            }
        };
        confirm();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />
                <main className="max-w-lg mx-auto px-6 py-24 text-center">
                    <ScrollReveal variant="fade-up" duration={800}>
                        <div className="bg-white rounded-3xl p-12 shadow-[0_15px_30px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 flex flex-col items-center gap-6">
                            {status === 'checking' && (
                                <>
                                    <Loader2 className="w-16 h-16 text-[#C8843B] animate-spin" />
                                    <h2 className="text-xl font-bold font-serif">Confirming your payment...</h2>
                                </>
                            )}
                            {status === 'paid' && (
                                <>
                                    <CheckCircle className="w-16 h-16 text-emerald-500" />
                                    <h2 className="text-xl font-bold font-serif">Payment successful!</h2>
                                    <p className="text-xs text-gray-400">Order #{orderId} has been paid and sent to the kitchen.</p>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-xs py-3.5 px-8 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                    >
                                        View My Orders <ArrowRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            {status === 'unpaid' && (
                                <>
                                    <XCircle className="w-16 h-16 text-amber-500" />
                                    <h2 className="text-xl font-bold font-serif">Payment not completed</h2>
                                    <p className="text-xs text-gray-400">Order #{orderId} is still awaiting payment. Contact staff if this seems wrong.</p>
                                    <Link to="/profile" className="text-[#C8843B] text-xs font-bold hover:underline">Check My Orders</Link>
                                </>
                            )}
                            {status === 'error' && (
                                <>
                                    <XCircle className="w-16 h-16 text-rose-500" />
                                    <h2 className="text-xl font-bold font-serif">Couldn't confirm payment</h2>
                                    <p className="text-xs text-gray-400">Something went wrong verifying this payment. Check My Orders or contact staff.</p>
                                    <Link to="/profile" className="text-[#C8843B] text-xs font-bold hover:underline">Check My Orders</Link>
                                </>
                            )}
                        </div>
                    </ScrollReveal>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default OrderSuccess;
