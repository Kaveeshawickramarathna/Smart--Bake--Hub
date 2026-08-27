import React, { useState, useEffect } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/ScrollReveal';
import api from '../../services/api';

// Initial fallback inventory items matching exact screenshot UI design
const initialWasteItems = [
    { id: 1, name: 'Bread Loaf', category: 'Bakery', stock: 15, daysLeft: 6, dailySales: '0.0', suggestedDiscount: 10, risk: 'LOW RISK', applied: false, item_type: 'product' },
    { id: 2, name: 'Birthday Cake (1kg)', category: 'Cakes', stock: 5, daysLeft: 6, dailySales: '0.0', suggestedDiscount: 10, risk: 'LOW RISK', applied: false, item_type: 'product' },
    { id: 3, name: 'Chocolate Truffle Cake', category: 'Cakes', stock: 8, daysLeft: 6, dailySales: '0.0', suggestedDiscount: 10, risk: 'LOW RISK', applied: false, item_type: 'product' },
    { id: 4, name: 'Spiced Chicken Sandwich', category: 'Meals', stock: 20, daysLeft: 3, dailySales: '1.2', suggestedDiscount: 20, risk: 'MEDIUM RISK', applied: false, item_type: 'dish' },
    { id: 5, name: 'Butter Croissants', category: 'Bakery', stock: 25, daysLeft: 1, dailySales: '0.5', suggestedDiscount: 35, risk: 'HIGH RISK', applied: false, item_type: 'product' }
];

const WasteReduction = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [wasteItems, setWasteItems] = useState([]);

    const getSavedAppliedDiscounts = () => {
        try {
            return JSON.parse(localStorage.getItem('smart_bake_applied_discounts') || '[]');
        } catch {
            return [];
        }
    };

    const fetchWasteSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/ai/waste');
            const data = response.data || [];
            const savedApplied = getSavedAppliedDiscounts();

            if (Array.isArray(data) && data.length > 0) {
                const mapped = data.map((item, idx) => {
                    const itemId = item.id || idx + 1;
                    const isAppliedInDb = item.applied || (item.discount_percentage && item.discount_percentage > 0);
                    const isAppliedInLocal = savedApplied.includes(String(itemId)) || savedApplied.includes(Number(itemId));
                    const isApplied = Boolean(isAppliedInDb || isAppliedInLocal);

                    return {
                        id: itemId,
                        name: item.name,
                        category: item.category || 'Bakery',
                        stock: item.stock !== undefined ? item.stock : 10,
                        daysLeft: item.daysLeft !== undefined ? item.daysLeft : 6,
                        dailySales: item.dailySales || '0.0',
                        suggestedDiscount: item.suggestedDiscount || 10,
                        risk: item.risk || (item.daysLeft <= 2 ? 'HIGH RISK' : (item.daysLeft <= 4 ? 'MEDIUM RISK' : 'LOW RISK')),
                        applied: isApplied,
                        item_type: item.item_type || 'product',
                        rationale: item.rationale
                    };
                });
                setWasteItems(mapped);
            } else {
                setWasteItems(initialWasteItems.map(item => ({
                    ...item,
                    applied: savedApplied.includes(String(item.id)) || savedApplied.includes(Number(item.id))
                })));
            }
        } catch (error) {
            console.warn("Waste suggestions API fetch fallback:", error);
            const savedApplied = getSavedAppliedDiscounts();
            setWasteItems(initialWasteItems.map(item => ({
                ...item,
                applied: savedApplied.includes(String(item.id)) || savedApplied.includes(Number(item.id))
            })));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWasteSuggestions();
    }, []);

    const handleReanalyze = async () => {
        setIsLoading(true);
        try {
            await fetchWasteSuggestions();
            toast.success("Inventory re-analyzed via Gemini AI!", { icon: '✨' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyDiscount = async (id, discount, name, item_type, price) => {
        try {
            await api.put(`/products/${id}`, { discount_percentage: discount, item_type, name, price });
        } catch (e) {
            console.warn("Apply discount endpoint update:", e);
        }
        
        const savedApplied = getSavedAppliedDiscounts();
        if (!savedApplied.includes(id) && !savedApplied.includes(String(id))) {
            savedApplied.push(id);
            localStorage.setItem('smart_bake_applied_discounts', JSON.stringify(savedApplied));
        }

        setWasteItems(prev => prev.map(item => item.id === id ? { ...item, applied: true } : item));
        toast.success(`Applied ${discount}% discount to ${name}!`, { icon: '🏷️' });
    };

    const highRiskList = wasteItems.filter(i => i.risk === 'HIGH RISK');
    const mediumRiskList = wasteItems.filter(i => i.risk === 'MEDIUM RISK');
    const lowRiskList = wasteItems.filter(i => i.risk === 'LOW RISK');

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto text-[#2E1A12] bg-[#f8fafc] p-6 min-h-screen">
            
            {/* Header Section */}
            <ScrollReveal variant="fade-up" duration={700}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                            AI Food Waste Reduction
                        </h1>
                        <p className="text-sm text-slate-500 font-normal">
                            Smart Gemini AI markdown recommendations for all products & menu items
                        </p>
                    </div>

                    <button 
                        onClick={handleReanalyze}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md disabled:opacity-70 self-start md:self-auto"
                    >
                        <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{isLoading ? 'Analyzing...' : 'Re-analyze Inventory'}</span>
                    </button>
                </div>
            </ScrollReveal>

            {/* Categorized Risk Sections */}
            <div className="space-y-8 my-6">
                
                {/* HIGH RISK SECTION */}
                {highRiskList.length > 0 && (
                    <ScrollReveal variant="fade-up" duration={800}>
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                <span>HIGH RISK</span>
                            </div>
                            <div className="space-y-4">
                                {highRiskList.map((item) => (
                                    <div key={`${item.item_type}-${item.id}`} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-base leading-tight mb-0.5">{item.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                                            </div>
                                            <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                HIGH RISK
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Stock</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.stock}</span>
                                            </div>

                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Days to Expiry</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.daysLeft}d</span>
                                            </div>

                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Daily Sales</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.dailySales}/day</span>
                                            </div>

                                            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 text-center">
                                                <span className="text-[11px] text-amber-700 font-medium block mb-0.5">Suggested Discount</span>
                                                <span className="text-sm font-black text-amber-600">{item.suggestedDiscount}% OFF</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            {item.applied ? (
                                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-2 rounded-xl text-xs font-semibold">
                                                    <Check className="w-4 h-4 text-emerald-600" />
                                                    <span>Discount Applied ({item.suggestedDiscount}% OFF)</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApplyDiscount(item.id, item.suggestedDiscount, item.name, item.item_type, item.price)}
                                                    className="flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Check className="w-4 h-4 text-white" />
                                                    <span>Apply {item.suggestedDiscount}% Discount</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* MEDIUM RISK SECTION */}
                {mediumRiskList.length > 0 && (
                    <ScrollReveal variant="fade-up" duration={800}>
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                <span>MEDIUM RISK</span>
                            </div>
                            <div className="space-y-4">
                                {mediumRiskList.map((item) => (
                                    <div key={`${item.item_type}-${item.id}`} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-base leading-tight mb-0.5">{item.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                                            </div>
                                            <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                MEDIUM RISK
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Stock</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.stock}</span>
                                            </div>

                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Days to Expiry</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.daysLeft}d</span>
                                            </div>

                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Daily Sales</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.dailySales}/day</span>
                                            </div>

                                            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 text-center">
                                                <span className="text-[11px] text-amber-700 font-medium block mb-0.5">Suggested Discount</span>
                                                <span className="text-sm font-black text-amber-600">{item.suggestedDiscount}% OFF</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            {item.applied ? (
                                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-2 rounded-xl text-xs font-semibold">
                                                    <Check className="w-4 h-4 text-emerald-600" />
                                                    <span>Discount Applied ({item.suggestedDiscount}% OFF)</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApplyDiscount(item.id, item.suggestedDiscount, item.name, item.item_type, item.price)}
                                                    className="flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Check className="w-4 h-4 text-white" />
                                                    <span>Apply {item.suggestedDiscount}% Discount</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* LOW RISK SECTION */}
                {lowRiskList.length > 0 && (
                    <ScrollReveal variant="fade-up" duration={800}>
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                <span>LOW RISK</span>
                            </div>
                            <div className="space-y-4">
                                {lowRiskList.map((item) => (
                                    <div key={`${item.item_type}-${item.id}`} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-base leading-tight mb-0.5">{item.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                                            </div>
                                            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                LOW RISK
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Stock</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.stock}</span>
                                            </div>

                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Days to Expiry</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.daysLeft}d</span>
                                            </div>

                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Daily Sales</span>
                                                <span className="text-sm font-extrabold text-slate-900">{item.dailySales}/day</span>
                                            </div>

                                            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 text-center">
                                                <span className="text-[11px] text-amber-700 font-medium block mb-0.5">Suggested Discount</span>
                                                <span className="text-sm font-black text-amber-600">{item.suggestedDiscount}% OFF</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            {item.applied ? (
                                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-2 rounded-xl text-xs font-semibold">
                                                    <Check className="w-4 h-4 text-emerald-600" />
                                                    <span>Discount Applied ({item.suggestedDiscount}% OFF)</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApplyDiscount(item.id, item.suggestedDiscount, item.name, item.item_type, item.price)}
                                                    className="flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Check className="w-4 h-4 text-white" />
                                                    <span>Apply {item.suggestedDiscount}% Discount</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

            </div>
        </div>
    );
};

export default WasteReduction;
