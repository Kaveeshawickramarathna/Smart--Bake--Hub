import React, { useState, useEffect } from 'react';
import { 
    Leaf, AlertTriangle, Clock, CheckCircle, Tag, QrCode, 
    RefreshCw, ShieldAlert, Sparkles, ExternalLink, ArrowRight,
    TrendingDown, Percent, Info, Check, X, Box, Coins
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Module-level cache to keep data alive across admin tab switching
let cachedWasteData = null;

const FoodWasteReduction = () => {
    const [loading, setLoading] = useState(!cachedWasteData);
    const [refreshing, setRefreshing] = useState(false);
    const [applyingId, setApplyingId] = useState(null);
    const [items, setItems] = useState(cachedWasteData?.items || []);
    const [summary, setSummary] = useState(cachedWasteData?.summary || null);
    const [storeName, setStoreName] = useState(cachedWasteData?.storeName || 'Wijayasiri Fresh Food (Pvt) Ltd.');
    const [filterRisk, setFilterRisk] = useState('all'); // 'all', 'High', 'Medium', 'Low', 'active'
    const [customDiscounts, setCustomDiscounts] = useState({});

    const fetchWasteData = async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            else if (!cachedWasteData) setLoading(true);

            const res = await api.get(`/ai/waste-suggestions${isManual ? '?force=true' : ''}`);
            const fetchedItems = res.data.items || [];
            const fetchedSummary = res.data.summary || null;
            const fetchedStore = res.data.store || 'Wijayasiri Fresh Food (Pvt) Ltd.';

            setItems(fetchedItems);
            setSummary(fetchedSummary);
            if (res.data.store) setStoreName(fetchedStore);

            cachedWasteData = {
                items: fetchedItems,
                summary: fetchedSummary,
                storeName: fetchedStore
            };

            if (isManual) toast.success('Food waste analysis updated from live inventory!');
        } catch (error) {
            console.error('Failed to load waste data:', error);
            toast.error(error.response?.data?.message || 'Failed to analyze food waste risks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!cachedWasteData) {
            fetchWasteData();
        }
    }, []);

    const handleApplyDiscount = async (item, discountRate) => {
        const discountVal = Number(discountRate);
        setApplyingId(item.id);
        try {
            await api.put(`/products/${item.id}/discount`, {
                discount_percentage: discountVal,
                item_type: item.item_type
            });

            // Update local state to reflect the applied discount
            setItems(prevItems => {
                const nextItems = prevItems.map(p => {
                    if (p.id === item.id && p.item_type === item.item_type) {
                        return {
                            ...p,
                            discount_percentage: discountVal,
                            applied: discountVal > 0,
                            suggestedDiscount: discountVal > 0 ? discountVal : p.suggestedDiscount
                        };
                    }
                    return p;
                });
                if (cachedWasteData) cachedWasteData.items = nextItems;
                return nextItems;
            });

            // Recompute active deals count in summary
            setSummary(prev => {
                if (!prev) return prev;
                const newActive = discountVal > 0 
                    ? (item.discount_percentage > 0 ? prev.activeDealsCount : prev.activeDealsCount + 1)
                    : (item.discount_percentage > 0 ? Math.max(0, prev.activeDealsCount - 1) : prev.activeDealsCount);
                const nextSummary = { ...prev, activeDealsCount: newActive };
                if (cachedWasteData) cachedWasteData.summary = nextSummary;
                return nextSummary;
            });

            if (discountVal > 0) {
                toast.success(
                    `Applied ${discountVal}% discount to ${item.name}! Now live on customer QR Menu.`,
                    { icon: '🏷️', duration: 4000 }
                );
            } else {
                toast.success(`Removed discount from ${item.name}.`, { icon: '🔄' });
            }
        } catch (error) {
            console.error('Failed to update discount:', error);
            toast.error(error.response?.data?.message || 'Failed to update discount on product');
        } finally {
            setApplyingId(null);
        }
    };

    const handleDiscountChange = (itemId, val) => {
        setCustomDiscounts(prev => ({ ...prev, [itemId]: val }));
    };

    // Filter items according to tab
    const filteredItems = items.filter(item => {
        if (filterRisk === 'all') return true;
        if (filterRisk === 'active') return item.applied || item.discount_percentage > 0;
        return item.risk === filterRisk;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans">
                <div className="w-12 h-12 border-4 border-[#C8843B] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-[#2E1A12]/70">Scanning live inventory & shelf life for waste risks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Feature 9 • AI-Powered Management
                        </span>
                        <span className="text-xs text-gray-400">
                            Live Store Inventory
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#2E1A12] font-serif mt-1">
                        AI-Powered Food Waste Reduction Management
                    </h1>
                    <p className="text-sm text-[#2E1A12]/70 mt-1">
                        Identify slow-moving, near-expiry, and high waste risk items for {storeName}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchWasteData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C8843B]/30 text-[#2E1A12] font-semibold text-sm shadow-sm hover:bg-[#F7F4ED] hover:border-[#C8843B] transition-all disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#C8843B] ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Re-evaluating...' : 'Re-evaluate Stock Risks'}
                    </button>
                    <a
                        href="/smart-deals"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E1A12] text-white font-semibold text-sm shadow-sm hover:bg-[#C8843B] transition-colors"
                    >
                        <QrCode className="w-4 h-4 text-[#C8843B]" />
                        <span>View Customer QR Menu</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Items Analyzed</span>
                        <span className="p-2 rounded-xl bg-[#2E1A12]/5 text-[#2E1A12]">
                            <Box className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-[#2E1A12] font-serif">{summary?.totalAnalyzed || items.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Live products, meals & beverages</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-red-50/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">High Waste Risk</span>
                        <span className="p-2 rounded-xl bg-red-100 text-red-600">
                            <ShieldAlert className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-red-600 font-serif">{summary?.highRiskCount || 0} items</div>
                        <p className="text-xs text-red-700/80 mt-1">Immediate markdown clearance needed</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Medium Waste Risk</span>
                        <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                            <Clock className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-amber-700 font-serif">{summary?.mediumRiskCount || 0} items</div>
                        <p className="text-xs text-amber-800/80 mt-1">Expiring in 3-5 days or slow movement</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active QR Menu Deals</span>
                        <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                            <Tag className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-emerald-700 font-serif">{summary?.activeDealsCount || 0} active</div>
                        <p className="text-xs text-emerald-800/80 mt-1">Live customer discounts driving sales</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 w-fit shadow-sm">
                <button
                    onClick={() => setFilterRisk('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        filterRisk === 'all' 
                            ? 'bg-[#2E1A12] text-white shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    All Items ({items.length})
                </button>
                <button
                    onClick={() => setFilterRisk('High')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        filterRisk === 'High' 
                            ? 'bg-red-600 text-white shadow-sm' 
                            : 'text-red-600 hover:bg-red-50'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    High Risk ({items.filter(i => i.risk === 'High').length})
                </button>
                <button
                    onClick={() => setFilterRisk('Medium')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        filterRisk === 'Medium' 
                            ? 'bg-amber-600 text-white shadow-sm' 
                            : 'text-amber-700 hover:bg-amber-50'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Medium Risk ({items.filter(i => i.risk === 'Medium').length})
                </button>
                <button
                    onClick={() => setFilterRisk('Low')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        filterRisk === 'Low' 
                            ? 'bg-emerald-700 text-white shadow-sm' 
                            : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Low Risk ({items.filter(i => i.risk === 'Low').length})
                </button>
                <button
                    onClick={() => setFilterRisk('active')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        filterRisk === 'active' 
                            ? 'bg-[#C8843B] text-white shadow-sm' 
                            : 'text-[#C8843B] hover:bg-amber-50'
                    }`}
                >
                    <Tag className="w-3.5 h-3.5" />
                    Active on QR Menu ({items.filter(i => i.applied || i.discount_percentage > 0).length})
                </button>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h3 className="font-bold text-[#2E1A12] text-lg font-serif">
                            Store Inventory Waste Risk Classification & Discount Engine
                        </h3>
                        <p className="text-xs text-gray-500">
                            Apply AI-recommended discounts to immediately broadcast deals to the Customer QR Menu
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">
                        Showing {filteredItems.length} items
                    </span>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm font-medium">
                        No food items match the selected filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F7F4ED]/60 text-[#2E1A12] font-bold border-b border-gray-200">
                                <tr>
                                    <th className="py-3.5 px-6">Product / Food Item</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Price</th>
                                    <th className="py-3.5 px-4">Stock</th>
                                    <th className="py-3.5 px-4">Expiry / Days Left</th>
                                    <th className="py-3.5 px-4">Waste Risk Level</th>
                                    <th className="py-3.5 px-4">AI Suggested Discount</th>
                                    <th className="py-3.5 px-6 text-right">QR Menu Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredItems.map((item) => {
                                    const isApplying = applyingId === item.id;
                                    const hasDiscount = Number(item.discount_percentage) > 0;
                                    const selectedDiscount = customDiscounts[item.id] !== undefined 
                                        ? customDiscounts[item.id] 
                                        : (hasDiscount ? item.discount_percentage : item.suggestedDiscount);

                                    const discountedPrice = Math.round(item.price * (1 - Number(selectedDiscount) / 100));

                                    return (
                                        <tr key={`${item.item_type}_${item.id}`} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Item Name & Rationale */}
                                            <td className="py-4 px-6 max-w-xs">
                                                <div className="font-bold text-[#2E1A12] text-sm">{item.name}</div>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                                    {item.rationale}
                                                </p>
                                            </td>

                                            {/* Category */}
                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                                                    {item.category}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-[#2E1A12]">Rs. {Number(item.price).toLocaleString()}</div>
                                                {hasDiscount && (
                                                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                                        QR: Rs. {discountedPrice.toLocaleString()}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Stock */}
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-gray-800">{item.stock} units</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {item.totalSold} sold recently
                                                </div>
                                            </td>

                                            {/* Expiry / Days Left */}
                                            <td className="py-4 px-4">
                                                {item.daysLeft !== null ? (
                                                    <div>
                                                        <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                                                            item.daysLeft <= 0 
                                                                ? 'text-red-600 font-extrabold' 
                                                                : item.daysLeft <= 3 
                                                                    ? 'text-amber-600 font-bold' 
                                                                    : 'text-gray-700 font-medium'
                                                        }`}>
                                                            {item.daysLeft < 0 ? (
                                                                <span className="inline-flex items-center gap-1 text-red-700 font-bold">
                                                                    <span>Past Expiry</span>
                                                                    <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                                                                        ({Math.abs(item.daysLeft)}d ago)
                                                                    </span>
                                                                </span>
                                                            ) : item.daysLeft === 0 ? (
                                                                <span className="text-red-600 font-extrabold">Expires Today!</span>
                                                            ) : item.daysLeft === 1 ? (
                                                                <span className="text-amber-700 font-bold">Expires Tomorrow</span>
                                                            ) : (
                                                                `${item.daysLeft} days left`
                                                            )}
                                                        </span>
                                                        <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                                                            {item.expiry_date}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Fresh Kitchen Prep</span>
                                                )}
                                            </td>

                                            {/* Risk Level Badge */}
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.risk === 'High'
                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                        : item.risk === 'Medium'
                                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        item.risk === 'High' ? 'bg-red-500' : item.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`} />
                                                    {item.risk} Risk
                                                </span>
                                            </td>

                                            {/* AI Suggested Discount */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <select
                                                        value={selectedDiscount}
                                                        onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold text-xs text-[#2E1A12] bg-white focus:outline-none focus:border-[#C8843B]"
                                                    >
                                                        <option value="10">10% Off</option>
                                                        <option value="15">15% Off</option>
                                                        <option value="20">20% Off</option>
                                                        <option value="25">25% Off</option>
                                                        <option value="30">30% Off</option>
                                                        <option value="35">35% Off</option>
                                                        <option value="50">50% Off</option>
                                                    </select>
                                                </div>
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                {hasDiscount ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <Check className="w-3.5 h-3.5" />
                                                            Live ({item.discount_percentage}%)
                                                        </span>
                                                        <button
                                                            onClick={() => handleApplyDiscount(item, 0)}
                                                            disabled={isApplying}
                                                            title="Remove from QR deals"
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApplyDiscount(item, selectedDiscount)}
                                                        disabled={isApplying}
                                                        className="px-4 py-2 rounded-xl bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-60 flex items-center gap-1.5 ml-auto"
                                                    >
                                                        {isApplying ? (
                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Tag className="w-3.5 h-3.5 text-[#C8843B]" />
                                                        )}
                                                        <span>Apply to QR Menu</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodWasteReduction;
