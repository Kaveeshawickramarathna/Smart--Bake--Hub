import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, BarChart3, Clock, AlertTriangle, CheckCircle2, 
    RefreshCw, Layers, ShoppingBag, ArrowUpRight, ArrowDownRight, 
    Sparkles, Calendar, Coffee, Utensils, Package
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid 
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Module-level cache to keep forecast data alive across admin tab switching
let cachedForecastData = null;

const DemandForecasting = () => {
    const [loading, setLoading] = useState(!cachedForecastData);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(cachedForecastData);

    const fetchForecast = async (force = false) => {
        try {
            if (force) setRefreshing(true);
            else if (!cachedForecastData) setLoading(true);

            const res = await api.get(`/ai/forecast${force ? '?force=true' : ''}`);
            setData(res.data);
            cachedForecastData = res.data;
            if (force) toast.success('Forecast refreshed with real store sales!');
        } catch (error) {
            console.error('Failed to load forecast data:', error);
            toast.error(error.response?.data?.message || 'Failed to generate demand forecast');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!cachedForecastData) {
            fetchForecast();
        }
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-[#C8843B] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-[#2E1A12]/70">Analyzing store sales & computing demand forecast...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500 font-medium">Unable to load forecasting data at this moment.</p>
                <button 
                    onClick={() => fetchForecast(true)} 
                    className="mt-4 px-4 py-2 bg-[#2E1A12] text-white rounded-xl text-sm font-semibold hover:bg-[#C8843B] transition-colors"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    const {
        store,
        totalHistoricalOrders,
        totalRevenue,
        totalSoldUnits,
        projectedWeeklyUnits,
        highDemandItems = [],
        lowDemandItems = [],
        categorySales = [],
        peakHourData = [],
        dailyForecast = [],
        categoryForecast = [],
        productionPlan = [],
        aiRecommendations = [],
        lastUpdated
    } = data;

    return (
        <div className="space-y-8 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                            Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#2E1A12] font-serif mt-1">
                        AI-Based Demand Forecasting Management
                    </h1>
                    <p className="text-sm text-[#2E1A12]/70 mt-1">
                        Predict future demand for Bakery Products, Meals, Beverages, and Cake items for {store}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchForecast(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C8843B]/30 text-[#2E1A12] font-semibold text-sm shadow-sm hover:bg-[#F7F4ED] hover:border-[#C8843B] transition-all disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#C8843B] ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Re-analyzing...' : 'Refresh AI Analysis'}
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historical Orders</span>
                        <span className="p-2 rounded-xl bg-[#2E1A12]/5 text-[#2E1A12]">
                            <ShoppingBag className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-[#2E1A12] font-serif">{totalHistoricalOrders}</div>
                        <p className="text-xs text-gray-500 mt-1">Real completed store orders analyzed</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Revenue</span>
                        <span className="p-2 rounded-xl bg-[#C8843B]/10 text-[#C8843B]">
                            <TrendingUp className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-[#2E1A12] font-serif">Rs. {Number(totalRevenue).toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Real historical revenue generated</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Units Sold</span>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <BarChart3 className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-emerald-700 font-serif">{totalSoldUnits} units</div>
                        <p className="text-xs text-gray-500 mt-1">Across all menu and product items</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#C8843B]/30 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-[#FDF8F0]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C8843B] uppercase tracking-wider">Predicted Weekly Demand</span>
                        <span className="p-2 rounded-xl bg-[#C8843B]/20 text-[#C8843B]">
                            <Sparkles className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-[#C8843B] font-serif">{projectedWeeklyUnits} units</div>
                        <p className="text-xs text-[#2E1A12]/70 mt-1">Target production quota next 7 days</p>
                    </div>
                </div>
            </div>

            {/* Daily Demand Projection & Peak Hours Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Forecast Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-[#2E1A12] text-lg font-serif">7-Day Demand Projection</h3>
                            <p className="text-xs text-gray-500">Predicted daily customer orders for the upcoming week</p>
                        </div>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#C8843B]/10 text-[#C8843B]">
                            AI Forecast Model
                        </span>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C8843B" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#C8843B" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <RechartsTooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-[#2E1A12] text-white p-3 rounded-xl shadow-xl text-xs font-sans">
                                                    <div className="font-bold">{item.day} ({item.date})</div>
                                                    <div className="text-[#C8843B] font-semibold mt-1">
                                                        Predicted: {item.predictedUnits} units
                                                    </div>
                                                    <div className="text-gray-300 text-[10px]">
                                                        Range: {item.confidenceMin} - {item.confidenceMax} units
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="predictedUnits" 
                                    stroke="#C8843B" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#forecastColor)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Peak Ordering Hours */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-[#2E1A12] text-lg font-serif">Peak Order Hours</h3>
                                <p className="text-xs text-gray-500">Real customer ordering times</p>
                            </div>
                            <Clock className="w-5 h-5 text-[#C8843B]" />
                        </div>

                        <div className="h-[210px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={peakHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                                    <RechartsTooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const item = payload[0].payload;
                                                return (
                                                    <div className="bg-[#2E1A12] text-white p-2 rounded-lg text-xs">
                                                        <div>{item.time}</div>
                                                        <div className="text-[#C8843B] font-bold">{item.orders} orders</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="orders" fill="#2E1A12" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-[#F7F4ED] rounded-xl text-xs text-[#2E1A12]/80 border border-[#C8843B]/20">
                        <span className="font-bold text-[#C8843B]">Peak Velocity:</span> Customer orders peak between 14:00 and 18:00. Align kitchen prep before 1:30 PM.
                    </div>
                </div>
            </div>

            {/* Category Demand Forecasts (Bakery, Meals, Beverages, Cakes) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-[#2E1A12] text-xl font-serif">Category Demand Predictions</h3>
                        <p className="text-xs text-gray-500">Forecasting breakdown across the 4 core product categories</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
                        Real Store Portfolio
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryForecast.map((cat, idx) => {
                        const icons = {
                            'Bakery Products': Package,
                            'Meals': Utensils,
                            'Beverages': Coffee,
                            'Cakes': Sparkles
                        };
                        const IconComponent = icons[cat.category] || Layers;
                        const realSales = categorySales.find(c => c.name === cat.category);

                        return (
                            <div key={idx} className="p-5 rounded-2xl border border-gray-100 bg-[#FDFCFB] hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#C8843B]/10 text-[#C8843B] flex items-center justify-center">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#2E1A12]/5 text-[#2E1A12]">
                                            {cat.trend}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-base text-[#2E1A12]">{cat.category}</h4>
                                    
                                    <div className="mt-3 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-[#C8843B] font-serif">{cat.predictedUnits}</span>
                                        <span className="text-xs text-gray-500">units / week</span>
                                    </div>

                                    <div className="text-xs text-gray-400 mt-1">
                                        Historical Sold: <span className="font-semibold text-gray-700">{realSales?.totalSold || 0} units</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-600 leading-relaxed">
                                    <span className="font-bold text-[#2E1A12]">Planning:</span> {cat.planningAdvice}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* High Demand vs Low Demand Products (Reducing Overproduction) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* High Demand Products */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <ArrowUpRight className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="font-bold text-[#2E1A12] text-base font-serif">High-Demand Products</h3>
                                <p className="text-xs text-gray-500">Top sellers needing priority production</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            {highDemandItems.length} Products
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-gray-400 font-bold border-b border-gray-100">
                                    <th className="pb-3">Product Name</th>
                                    <th className="pb-3">Category</th>
                                    <th className="pb-3 text-right">Units Sold</th>
                                    <th className="pb-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {highDemandItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="py-3 font-semibold text-[#2E1A12]">{item.name}</td>
                                        <td className="py-3 text-gray-500">{item.category}</td>
                                        <td className="py-3 text-right font-bold text-emerald-600">
                                            {item.totalSold} sold
                                        </td>
                                        <td className="py-3 text-right font-medium text-gray-700">
                                            Rs. {Number(item.revenue).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Demand / Overproduction Risk Products */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="font-bold text-[#2E1A12] text-base font-serif">Overproduction Risk Products</h3>
                                <p className="text-xs text-gray-500">Slow movement with unsold shelf stock</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Reduce Batches
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-gray-400 font-bold border-b border-gray-100">
                                    <th className="pb-3">Product Name</th>
                                    <th className="pb-3">Category</th>
                                    <th className="pb-3 text-right">Current Stock</th>
                                    <th className="pb-3 text-right">Risk Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lowDemandItems.slice(0, 5).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="py-3 font-semibold text-[#2E1A12]">{item.name}</td>
                                        <td className="py-3 text-gray-500">{item.category}</td>
                                        <td className="py-3 text-right font-bold text-amber-700">
                                            {item.stock} in stock
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                Halt Production
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* AI Production Planning & Overproduction Prevention Quotas */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <div>
                        <h3 className="font-bold text-[#2E1A12] text-xl font-serif flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#C8843B]" />
                            Recommended Production Plan
                        </h3>
                        <p className="text-xs text-gray-500">Production quotas calculated to fulfill customer demand while eliminating overproduction waste</p>
                    </div>
                    <span className="px-3 py-1 bg-[#2E1A12] text-white text-xs font-bold rounded-xl">
                        AI Recommended Plan
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productionPlan.map((plan, idx) => {
                        const isIncrease = plan.action === 'Increase Production';
                        return (
                            <div key={idx} className="p-4 rounded-2xl border border-gray-200/80 bg-[#FDFCFB] flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{plan.category}</span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                            isIncrease 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {plan.action}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-[#2E1A12] text-sm">{plan.productName}</h4>
                                    
                                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-white border border-gray-100 text-xs">
                                        <div>
                                            <div className="text-gray-400 text-[10px]">Current Stock</div>
                                            <div className="font-bold text-[#2E1A12]">{plan.currentStock} units</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-[10px]">Target Production</div>
                                            <div className="font-bold text-[#C8843B]">{plan.recommendedProduction} units</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-600 italic border-t border-gray-100 pt-2 mt-2">
                                    "{plan.reason}"
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DemandForecasting;
