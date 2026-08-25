import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { mockBeverageCategories, mockBeverages } from '../../data/mockBeverages';

const BeveragesManagement = () => {
    // Beverages States
    const [beverages, setBeverages] = useState([]);
    const [beverageCategories, setBeverageCategories] = useState([]);
    const [loadingBeverages, setLoadingBeverages] = useState(true);
    const [beveragesError, setBeveragesError] = useState(null);
    const [beverageSearchTerm, setBeverageSearchTerm] = useState('');
    const [selectedBeverageCategory, setSelectedBeverageCategory] = useState('all');
    const [togglingBeverageId, setTogglingBeverageId] = useState(null);
    const [togglingAvailabilityId, setTogglingAvailabilityId] = useState(null);
    const [editingPrice, setEditingPrice] = useState({ beverageId: null, priceType: null, value: '' });
    const [deletingBeverage, setDeletingBeverage] = useState(null);

    // Fetch Beverages Data
    const fetchBeveragesData = async () => {
        setLoadingBeverages(true);
        setBeveragesError(null);
        try {
            const [beveragesRes, categoriesRes] = await Promise.all([
                api.get('/beverages').catch(() => ({ data: [] })),
                api.get('/beverages/categories').catch(() => ({ data: [] }))
            ]);

            const fetchedBeverages = beveragesRes.data || [];
            setBeverages(fetchedBeverages);
            setBeverageCategories(categoriesRes.data || []);
        } catch (err) {
            console.error('Failed to fetch dishes:', err);
            setBeveragesError('Failed to load dishes');
            toast.error('Failed to load dishes');
        } finally {
            setLoadingBeverages(false);
        }
    };

    useEffect(() => {
        fetchBeveragesData();
    }, []);

    // Beverages Memoized Filter
    const filteredBeverages = useMemo(() => {
        return beverages.filter(beverage => {
            const searchLower = beverageSearchTerm.toLowerCase();
            const matchesSearch = (beverage.name || '').toLowerCase().includes(searchLower) ||
                                (beverage.beverage_code || '').toLowerCase().includes(searchLower) ||
                                (beverage.beverage_category || '').toLowerCase().includes(searchLower);
            const matchesCategory = selectedBeverageCategory === 'all' || beverage.beverage_category_name === selectedBeverageCategory;
            return matchesSearch && matchesCategory;
        });
    }, [beverages, beverageSearchTerm, selectedBeverageCategory]);

    // Beverage Toggle Handlers
    const handleToggleBeverageStatus = async (beverage) => {
        setTogglingBeverageId(beverage.id);
        try {
            const res = await api.put(`/beverages/${beverage.id}/status`);
            setBeverages(beverages.map(m => m.id === beverage.id ? { ...m, status: res.data.status } : m));
            toast.success(`Dish is now ${res.data.status}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setTogglingBeverageId(null);
        }
    };

    const handleToggleBeverageAvailability = async (beverage) => {
        setTogglingAvailabilityId(beverage.id);
        try {
            const res = await api.put(`/beverages/${beverage.id}/availability`);
            setBeverages(beverages.map(m => m.id === beverage.id ? { ...m, is_available: res.data.is_available } : m));
            toast.success(`Dish is now ${res.data.is_available ? 'Available' : 'Unavailable'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update availability');
        } finally {
            setTogglingAvailabilityId(null);
        }
    };

    const handlePriceSave = async (beverage) => {
        try {
            const payload = {
                ...beverage,
                [editingPrice.priceType]: editingPrice.value
            };
            await api.put(`/beverages/${beverage.id}`, payload);
            setBeverages(beverages.map(m => m.id === beverage.id ? { ...m, [editingPrice.priceType]: editingPrice.value } : m));
            toast.success('Price updated successfully');
            setEditingPrice({ beverageId: null, priceType: null, value: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update price');
        }
    };

    const handleDeleteBeverage = async (id) => {
        try {
            await api.delete(`/beverages/${id}`);
            setBeverages(beverages.filter(b => b.id !== id));
            toast.success('Beverage deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete beverage');
        } finally {
            setDeletingBeverage(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#2E1A12] font-serif">Beverage Management</h1>
                    <p className="text-[#2E1A12]/60 text-sm mt-1">Create and manage beverages for your customers</p>
                </div>
                <Link
                    to="/admin/beverages/add"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2E1A12] text-white rounded-xl hover:bg-[#2E1A12]/90 transition-all duration-300 shadow-md hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold text-sm">Add Beverage</span>
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[#C8843B]" />
                    <input
                        type="text"
                        placeholder="Search beverages..."
                        value={beverageSearchTerm}
                        onChange={(e) => setBeverageSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#C8843B]/20 rounded-xl text-[#2E1A12] placeholder-[#2E1A12]/50 focus:outline-none focus:border-[#C8843B] transition-colors font-medium text-sm"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3.5 top-3.5 w-5 h-5 text-[#C8843B]" />
                    <select
                        value={selectedBeverageCategory}
                        onChange={(e) => setSelectedBeverageCategory(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#C8843B]/20 rounded-xl text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-colors appearance-none font-semibold text-sm"
                    >
                        <option value="all">All Categories</option>
                        {beverageCategories.map(category => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            {loadingBeverages ? (
                <div className="bg-white rounded-2xl border border-[#C8843B]/20 p-12 text-center shadow-sm">
                    <p className="text-[#2E1A12]/60 font-semibold">Loading beverages...</p>
                </div>
            ) : beveragesError ? (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
                    <p className="text-red-500 font-semibold">{beveragesError}</p>
                </div>
            ) : filteredBeverages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#C8843B]/20 p-12 text-center shadow-sm">
                    <p className="text-[#2E1A12]/60 font-semibold font-serif">No beverages found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBeverages.map((beverage) => (
                        <div
                            key={beverage.id}
                            className="bg-white rounded-2xl border border-[#C8843B]/20 overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#2E1A12] to-[#C8843B] p-5 text-white flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg font-serif leading-tight">{beverage.name}</h3>
                                    <p className="text-xs text-white/80 mt-2 font-semibold tracking-wide">{beverage.beverage_code || 'NO CODE'}</p>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                    <p className="font-bold text-sm">{beverage.beverage_category_name || 'N/A'}</p>
                                    <button
                                        onClick={() => setDeletingBeverage(beverage)}
                                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-white rounded-lg transition-all"
                                        title="Delete Beverage"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 flex-1 flex flex-col justify-center relative">
                                {(!beverage.portion_type || beverage.portion_type === 'regular') ? (
                                    <div className="flex justify-center items-center py-2 relative group">
                                        <div className="text-center">
                                            {editingPrice.beverageId === beverage.id && editingPrice.priceType === 'price' ? (
                                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-[#C8843B]/40 shadow-sm">
                                                    <span className="text-[#C8843B] font-bold">Rs.</span>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={editingPrice.value} 
                                                        onChange={(e) => setEditingPrice(prev => ({ ...prev, value: e.target.value }))}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handlePriceSave(beverage); }}
                                                        className="w-20 outline-none text-[#C8843B] font-bold text-lg text-center"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handlePriceSave(beverage)} className="p-1 hover:bg-green-50 text-green-600 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingPrice({ beverageId: null, priceType: null, value: '' })} className="p-1 hover:bg-red-50 text-red-500 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <p className="text-2xl font-bold text-[#C8843B]">Rs. {Number(beverage.price || 0).toFixed(2)}</p>
                                                    <button 
                                                        onClick={() => setEditingPrice({ beverageId: beverage.id, priceType: 'price', value: beverage.price })}
                                                        className="p-1.5 text-[#C8843B]/60 hover:text-[#C8843B] hover:bg-[#C8843B]/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Edit Price"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <p className="text-[10px] uppercase font-bold text-[#2E1A12]/60 tracking-wider mt-1">Regular Price</p>
                                        </div>
                                    </div>
                                ) : beverage.portion_type === 'bottles' ? (
                                    <div className="py-2 px-2 max-h-32 overflow-y-auto">
                                        <div className="flex flex-col gap-2">
                                            {(() => {
                                                try {
                                                    const variants = typeof beverage.price_variants === 'string' 
                                                        ? JSON.parse(beverage.price_variants) 
                                                        : (beverage.price_variants || []);
                                                    if (!variants || variants.length === 0) return <p className="text-xs text-center text-gray-400">No variants</p>;
                                                    return variants.map((v, i) => (
                                                        <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-[#C8843B]/20">
                                                            <span className="text-xs font-bold text-gray-700">{v.size}</span>
                                                            <span className="text-sm font-bold text-[#C8843B]">Rs. {Number(v.price).toFixed(2)}</span>
                                                        </div>
                                                    ));
                                                } catch(e) {
                                                    return <p className="text-xs text-center text-red-400">Invalid variants</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Footer */}
                            <div className="grid grid-cols-3 gap-2 p-4 border-t border-[#C8843B]/20 bg-gray-50/50">
                                <button
                                    onClick={() => handleToggleBeverageStatus(beverage)}
                                    disabled={togglingBeverageId === beverage.id}
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all font-bold text-[11px] font-sans cursor-pointer border whitespace-nowrap shadow-sm hover:shadow ${
                                        beverage.status === 'active' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                                >
                                    <div className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${beverage.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${beverage.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    {beverage.status === 'active' ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                    onClick={() => handleToggleBeverageAvailability(beverage)}
                                    disabled={togglingAvailabilityId === beverage.id}
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all font-bold text-[11px] font-sans cursor-pointer border whitespace-nowrap shadow-sm hover:shadow ${
                                        beverage.is_available 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-white text-orange-700 border-orange-200'
                                    }`}
                                >
                                    <div className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${beverage.is_available ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                        <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${beverage.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    {beverage.is_available ? 'Available' : 'Unavailable'}
                                </button>
                                
                                {/* Discount Percent */}
                                <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl px-1 py-1 shadow-sm">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Discount %</span>
                                    {editingPrice.beverageId === beverage.id && editingPrice.priceType === 'discount_percentage' ? (
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="number" 
                                                min="0" max="100"
                                                value={editingPrice.value} 
                                                onChange={(e) => setEditingPrice(prev => ({ ...prev, value: e.target.value }))}
                                                className="w-10 outline-none text-[#C8843B] font-bold text-xs text-center border-b border-[#C8843B]"
                                                autoFocus
                                            />
                                            <button onClick={() => handlePriceSave(beverage)} className="p-0.5 hover:bg-green-50 text-green-600 rounded">
                                                <Check className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setEditingPrice({ beverageId: null, priceType: null, value: '' })} className="p-0.5 hover:bg-red-50 text-red-500 rounded">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => setEditingPrice({ beverageId: beverage.id, priceType: 'discount_percentage', value: beverage.discount_percentage || 0 })}
                                            className="flex items-center justify-center gap-1 cursor-pointer group w-full hover:bg-gray-50 py-1 rounded"
                                        >
                                            <span className={`text-sm font-bold ${Number(beverage.discount_percentage) > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                                                {beverage.discount_percentage || 0}%
                                            </span>
                                            <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-[#C8843B] transition-colors" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deletingBeverage && (
                <DeleteConfirmation
                    isOpen={!!deletingBeverage}
                    onClose={() => setDeletingBeverage(null)}
                    onConfirm={() => handleDeleteBeverage(deletingBeverage.id)}
                    title="Delete Beverage"
                    message={`Are you sure you want to delete "${deletingBeverage.name}"? This action cannot be undone.`}
                    itemName={deletingBeverage.name}
                />
            )}

        </div>
    );
};

export default BeveragesManagement;
