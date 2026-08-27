import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { mockMenuCategories, mockMenus } from '../../data/mockMenus';

const ProductMenuManagement = () => {
    // Menus States
    const [menus, setMenus] = useState([]);
    const [menuCategories, setMenuCategories] = useState([]);
    const [loadingMenus, setLoadingMenus] = useState(true);
    const [menusError, setMenusError] = useState(null);
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [selectedMenuCategory, setSelectedMenuCategory] = useState('all');
    const [togglingMenuId, setTogglingMenuId] = useState(null);
    const [togglingAvailabilityId, setTogglingAvailabilityId] = useState(null);
    const [editingPrice, setEditingPrice] = useState({ menuId: null, priceType: null, value: '' });

    // Fetch Menus Data
    const fetchMenusData = async () => {
        setLoadingMenus(true);
        setMenusError(null);
        try {
            const [menusRes, categoriesRes] = await Promise.all([
                api.get('/menus').catch(() => ({ data: [] })),
                api.get('/menus/categories').catch(() => ({ data: mockMenuCategories }))
            ]);

            const fetchedMenus = menusRes.data || [];
            setMenus(fetchedMenus);
            setMenuCategories(categoriesRes.data || mockMenuCategories);
        } catch (err) {
            console.error('Failed to fetch dishes:', err);
            setMenusError('Failed to load dishes');
            toast.error('Failed to load dishes');
        } finally {
            setLoadingMenus(false);
        }
    };

    useEffect(() => {
        fetchMenusData();
    }, []);

    // Menus Memoized Filter
    const filteredMenus = useMemo(() => {
        return menus.filter(menu => {
            const searchLower = menuSearchTerm.toLowerCase();
            const matchesSearch = (menu.name || '').toLowerCase().includes(searchLower) ||
                                (menu.dish_code || '').toLowerCase().includes(searchLower) ||
                                (menu.menu_category || '').toLowerCase().includes(searchLower);
            const matchesCategory = selectedMenuCategory === 'all' || menu.category_name === selectedMenuCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menus, menuSearchTerm, selectedMenuCategory]);

    // Menu Toggle Handlers
    const handleToggleMenuStatus = async (menu) => {
        setTogglingMenuId(menu.id);
        try {
            const res = await api.put(`/menus/${menu.id}/status`);
            setMenus(menus.map(m => m.id === menu.id ? { ...m, status: res.data.status } : m));
            toast.success(`Dish is now ${res.data.status}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setTogglingMenuId(null);
        }
    };

    const handleToggleMenuAvailability = async (menu) => {
        setTogglingAvailabilityId(menu.id);
        try {
            const res = await api.put(`/menus/${menu.id}/availability`);
            setMenus(menus.map(m => m.id === menu.id ? { ...m, is_available: res.data.is_available } : m));
            toast.success(`Dish is now ${res.data.is_available ? 'Available' : 'Unavailable'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update availability');
        } finally {
            setTogglingAvailabilityId(null);
        }
    };

    const handlePriceSave = async (menu) => {
        try {
            const payload = {
                ...menu,
                [editingPrice.priceType]: editingPrice.value
            };
            await api.put(`/menus/${menu.id}`, payload);
            setMenus(menus.map(m => m.id === menu.id ? { ...m, [editingPrice.priceType]: editingPrice.value } : m));
            toast.success('Price updated successfully');
            setEditingPrice({ menuId: null, priceType: null, value: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update price');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#2E1A12] font-serif">Dish Management</h1>
                    <p className="text-[#2E1A12]/60 text-sm mt-1">Create and manage dishes for your customers</p>
                </div>
                <Link
                    to="/admin/menus/add"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2E1A12] text-white rounded-xl hover:bg-[#2E1A12]/90 transition-all duration-300 shadow-md hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold text-sm">Add Dish</span>
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[#C8843B]" />
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={menuSearchTerm}
                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#C8843B]/20 rounded-xl text-[#2E1A12] placeholder-[#2E1A12]/50 focus:outline-none focus:border-[#C8843B] transition-colors font-medium text-sm"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3.5 top-3.5 w-5 h-5 text-[#C8843B]" />
                    <select
                        value={selectedMenuCategory}
                        onChange={(e) => setSelectedMenuCategory(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#C8843B]/20 rounded-xl text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-colors appearance-none font-semibold text-sm"
                    >
                        <option value="all">All Categories</option>
                        {menuCategories.map(category => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            {loadingMenus ? (
                <div className="bg-white rounded-2xl border border-[#C8843B]/20 p-12 text-center shadow-sm">
                    <p className="text-[#2E1A12]/60 font-semibold">Loading dishes...</p>
                </div>
            ) : menusError ? (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
                    <p className="text-red-700 font-semibold">{menusError}</p>
                </div>
            ) : filteredMenus.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#C8843B]/20 p-12 text-center shadow-sm">
                    <p className="text-[#2E1A12]/60 font-semibold font-serif">No dishes found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenus.map((menu) => (
                        <div
                            key={menu.id}
                            className="bg-white rounded-2xl border border-[#C8843B]/20 overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#2E1A12] to-[#C8843B] p-5 text-white flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg font-serif leading-tight">{menu.name}</h3>
                                    <p className="text-xs text-white/80 mt-2 font-semibold tracking-wide">{menu.dish_code || 'NO CODE'}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-sm">{menu.menu_category || 'N/A'}</p>
                                    <p className="text-[10px] text-white/80 mt-2 uppercase tracking-wider font-semibold">{menu.category_name || menu.category}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 flex-1 flex flex-col justify-center relative">
                                    <div className="flex justify-center items-center py-2 relative group">
                                        <div className="text-center">
                                            {editingPrice.menuId === menu.id && editingPrice.priceType === 'price' ? (
                                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-[#C8843B]/40 shadow-sm">
                                                    <span className="text-[#C8843B] font-bold">Rs.</span>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={editingPrice.value} 
                                                        onChange={(e) => setEditingPrice(prev => ({ ...prev, value: e.target.value }))}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handlePriceSave(menu); }}
                                                        className="w-20 outline-none text-[#C8843B] font-bold text-lg text-center"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handlePriceSave(menu)} className="p-1 hover:bg-green-50 text-green-600 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingPrice({ menuId: null, priceType: null, value: '' })} className="p-1 hover:bg-red-50 text-red-500 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <p className="text-2xl font-bold text-[#C8843B]">Rs. {Number(menu.price || 0).toFixed(2)}</p>
                                                    <button 
                                                        onClick={() => setEditingPrice({ menuId: menu.id, priceType: 'price', value: menu.price })}
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
                            </div>

                            {/* Footer */}
                            <div className="grid grid-cols-2 gap-3 p-4 border-t border-[#C8843B]/20 bg-gray-50/50">
                                <button
                                    onClick={() => handleToggleMenuStatus(menu)}
                                    disabled={togglingMenuId === menu.id}
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all font-bold text-[11px] font-sans cursor-pointer border whitespace-nowrap shadow-sm hover:shadow ${
                                        menu.status === 'active' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                                >
                                    <div className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${menu.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${menu.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    {menu.status === 'active' ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                    onClick={() => handleToggleMenuAvailability(menu)}
                                    disabled={togglingAvailabilityId === menu.id}
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all font-bold text-[11px] font-sans cursor-pointer border whitespace-nowrap shadow-sm hover:shadow ${
                                        menu.is_available 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-white text-orange-700 border-orange-200'
                                    }`}
                                >
                                    <div className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${menu.is_available ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                        <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${menu.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    {menu.is_available ? 'Available' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
};

export default ProductMenuManagement;
