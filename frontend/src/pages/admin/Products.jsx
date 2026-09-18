import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Check, X, Search, Filter, Cookie, Sparkles } from 'lucide-react';
import DeleteConfirmation from '../../components/DeleteConfirmation';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingDiscount, setEditingDiscount] = useState({ id: null, value: '' });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [deletingProduct, setDeletingProduct] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/products/categories')
            ]);
            setProducts(productsRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch bakery products:', error);
            toast.error('Failed to load bakery products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDiscountSave = async (product) => {
        try {
            const val = parseFloat(editingDiscount.value) || 0;
            await api.put(`/products/${product.id}/discount`, {
                discount_percentage: val
            });
            setProducts(products.map(p => p.id === product.id ? { ...p, discount_percentage: val } : p));
            toast.success('Discount updated successfully');
            setEditingDiscount({ id: null, value: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update discount');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            toast.success('Bakery item deleted successfully');
            setProducts(products.filter(p => p.id !== id));
            setDeletingProduct(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete bakery item');
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const name = (p.name || '').toLowerCase();
            const cat = (p.category_name || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || cat.includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category_name === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        <Cookie className="w-6 h-6 text-[#C8843B]" /> Bakery Items Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage artisan breads, pastries, buns, and fresh bakery products</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products/add')}
                    className="flex items-center gap-2 bg-[#C8843B] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#A66D31] transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Bakery Item</span>
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white rounded-2xl border border-[#C8843B]/20 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search bakery items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C8843B] focus:bg-white transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8843B] focus:bg-white"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8843B]"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#C8843B]/20 p-12 text-center shadow-sm">
                    <Cookie className="w-12 h-12 text-[#C8843B]/20 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-[#2E1A12]">No Bakery Items Found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search query or add a new bakery product.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl border border-[#C8843B]/20 overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
                        >
                            {/* Product Image */}
                            <div className="h-44 w-full overflow-hidden bg-[#FDF6ED] relative">
                                <img
                                    src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
                                    }}
                                />
                                {Number(product.discount_percentage) > 0 && (
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> {product.discount_percentage}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#2E1A12] to-[#C8843B] p-5 text-white flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg font-serif leading-tight">{product.name}</h3>
                                    <p className="text-xs text-white/80 mt-1 font-semibold">{product.category_name || 'Bakery Products'}</p>
                                </div>
                                <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                                    <button
                                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                        className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                                        title="Edit Bakery Item"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setDeletingProduct(product)}
                                        className="p-1.5 bg-red-500/30 hover:bg-red-500/50 text-white rounded-lg transition-all"
                                        title="Delete Bakery Item"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                {product.description && (
                                    <p className="text-xs text-[#2E1A12]/70 line-clamp-2 mb-4 leading-relaxed">
                                        {product.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-[#C8843B]/10">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-[#2E1A12]/50 tracking-wider block">Price</span>
                                        <span className="text-xl font-bold text-[#C8843B]">
                                            Rs. {Number(product.price || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Inline Discount edit */}
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] uppercase font-bold text-gray-400">Discount %</span>
                                        {editingDiscount.id === product.id ? (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={editingDiscount.value}
                                                    onChange={(e) => setEditingDiscount({ ...editingDiscount, value: e.target.value })}
                                                    className="w-12 px-1.5 py-0.5 border border-[#C8843B] rounded text-xs font-bold text-center outline-none"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleDiscountSave(product)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingDiscount({ id: null, value: '' })} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setEditingDiscount({ id: product.id, value: product.discount_percentage || 0 })}
                                                className="flex items-center gap-1 cursor-pointer group hover:opacity-80 mt-0.5"
                                                title="Click to change discount"
                                            >
                                                <span className={`text-sm font-bold ${Number(product.discount_percentage) > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                                                    {product.discount_percentage || 0}%
                                                </span>
                                                <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-[#C8843B]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProduct && (
                <DeleteConfirmation
                    isOpen={!!deletingProduct}
                    onClose={() => setDeletingProduct(null)}
                    onConfirm={() => handleDelete(deletingProduct.id)}
                    title="Delete Bakery Item"
                    message={`Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`}
                />
            )}
        </div>
    );
};

export default Products;
