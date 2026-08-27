import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { mockBeverageCategories } from '../../data/mockBeverages';

import CreatableSelect from 'react-select/creatable';

const AddBeverage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [formData, setFormData] = useState({
        beverage_code: '',
        name: '',
        beverage_category_id: '',
        portion_type: 'regular',
        price: '',
        price_small: '',
        price_large: '',
        price_variants: []
    });

    const [pendingBeverageCategory, setPendingBeverageCategory] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [bevCatRes, codeRes] = await Promise.all([
                    api.get('/beverages/categories').catch(() => ({ data: [] })),
                    api.get('/beverages/next-code').catch(() => ({ data: { nextCode: 'WBB0001' } }))
                ]);
                setCategoriesList(bevCatRes.data || []);
                setFormData(prev => ({ ...prev, beverage_code: codeRes.data.nextCode || 'WBB0001' }));
            } catch (err) {
                setCategoriesList([]);
            }
        };
        load();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.price_variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, price_variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({ ...prev, price_variants: [...prev.price_variants, { size_amount: '', size_unit: 'ml', price: '' }] }));
    };

    const removeVariant = (index) => {
        const newVariants = formData.price_variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, price_variants: newVariants }));
    };

    const handleBeverageCategoryCreateRequest = (inputValue) => {
        setPendingBeverageCategory({ name: inputValue, description: '' });
    };

    const confirmCreateBeverageCategory = async () => {
        if (!pendingBeverageCategory?.description?.trim()) {
            toast.error('Description is required');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/beverages/categories', pendingBeverageCategory);
            const newCat = { id: res.data.id, name: res.data.name };
            setCategoriesList(prev => [...prev, newCat]);
            setFormData(prev => ({ ...prev, beverage_category_id: newCat.id }));
            setPendingBeverageCategory(null);
            toast.success('Beverage category added successfully');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add beverage category');
        } finally {
            setLoading(false);
        }
    };

    const beverageCategoryOptions = categoriesList.map(cat => ({
        value: cat.id,
        label: cat.name
    }));



    const validateForm = () => {
        if (!formData.beverage_code.trim()) { toast.error('Beverage code is required'); return false; }
        if (!formData.name.trim()) { toast.error('Beverage name is required'); return false; }
        if (!formData.beverage_category_id) { toast.error('Beverage category is required'); return false; }
        
        if (formData.portion_type === 'regular') {
            if (!formData.price || parseFloat(formData.price) <= 0) { toast.error('Valid price is required'); return false; }
        } else if (formData.portion_type === 'bottles') {
            if (formData.price_variants.length === 0) {
                toast.error('At least one size variant is required');
                return false;
            }
            for (const v of formData.price_variants) {
                if (!v.size_amount || parseFloat(v.size_amount) <= 0 || !v.price || parseFloat(v.price) <= 0) {
                    toast.error('All variants must have a valid size amount and price');
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                beverage_code: formData.beverage_code,
                name: formData.name,
                beverage_category_id: formData.beverage_category_id || null,
                portion_type: formData.portion_type,
                price: formData.portion_type === 'regular' ? (parseFloat(formData.price) || 0) : 0,
                price_variants: formData.portion_type === 'bottles' ? formData.price_variants.map(v => ({ size: `${v.size_amount}${v.size_unit}`, price: parseFloat(v.price) })) : null
            };

            await api.post('/beverages', payload);
            toast.success('Beverage created successfully');
            navigate('/admin/beverages');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to create beverage');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin/beverages')} className="p-2 hover:bg-[#C8843B]/10 rounded-lg">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Create New Beverage</h1>
                    <p className="text-sm mt-1">Add details for the new beverage</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Beverage Code <span className="text-red-500">*</span></label>
                                <input name="beverage_code" value={formData.beverage_code} readOnly className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500" />
                            </div>

                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Beverage Name <span className="text-red-500">*</span></label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border p-6">
                            <label className="block text-sm font-semibold mb-2">Beverage Category <span className="text-red-500">*</span></label>
                            <CreatableSelect
                                isClearable
                                isLoading={loading}
                                options={beverageCategoryOptions}
                                value={beverageCategoryOptions.find(c => c.value === formData.beverage_category_id) || null}
                                onChange={(selected) => setFormData(prev => ({ ...prev, beverage_category_id: selected ? selected.value : '' }))}
                                onCreateOption={handleBeverageCategoryCreateRequest}
                                placeholder="Select or type to create new..."
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        padding: '2px',
                                        boxShadow: 'none',
                                        '&:hover': { border: '1px solid #e5e7eb' }
                                    })
                                }}
                            />
                            {pendingBeverageCategory && (
                                <div className="mt-4 p-4 border border-[#C8843B]/30 rounded-xl bg-[#C8843B]/5">
                                    <h4 className="text-sm font-bold text-[#2E1A12] mb-3">Add Category Description</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold mb-1 text-[#2E1A12]/70">Name</label>
                                            <input 
                                                value={pendingBeverageCategory.name} 
                                                readOnly
                                                className="w-full px-3 py-2 border rounded-lg bg-white/50 text-[#2E1A12]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold mb-1 text-[#2E1A12]/70">Description <span className="text-red-500">*</span></label>
                                            <textarea 
                                                value={pendingBeverageCategory.description}
                                                onChange={(e) => setPendingBeverageCategory({ ...pendingBeverageCategory, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-[#C8843B]/20 rounded-lg focus:outline-none focus:border-[#C8843B]"
                                                rows="2"
                                                placeholder="Enter category description..."
                                            ></textarea>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="button" onClick={confirmCreateBeverageCategory} className="px-4 py-2 bg-[#C8843B] text-white rounded-lg text-sm font-bold hover:bg-[#A66D31] transition-colors">Save</button>
                                            <button type="button" onClick={() => setPendingBeverageCategory(null)} className="px-4 py-2 bg-white border border-[#C8843B]/20 text-[#2E1A12] rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border p-6">
                            <label className="block text-sm font-semibold mb-4">Pricing Type <span className="text-red-500">*</span></label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="portion_type" value="regular" checked={formData.portion_type === 'regular'} onChange={handleInputChange} className="w-4 h-4 text-[#C8843B] focus:ring-[#C8843B]" />
                                    <span className="text-sm font-medium text-[#2E1A12]">Regular Price</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="portion_type" value="bottles" checked={formData.portion_type === 'bottles'} onChange={handleInputChange} className="w-4 h-4 text-[#C8843B] focus:ring-[#C8843B]" />
                                    <span className="text-sm font-medium text-[#2E1A12]">Bottled (ml variations)</span>
                                </label>
                            </div>
                        </div>

                        {formData.portion_type === 'regular' ? (
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Price (Rs.) <span className="text-red-500">*</span></label>
                                <input name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg" />
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border p-6 space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-semibold">Size Variations <span className="text-red-500">*</span></label>
                                    <button type="button" onClick={addVariant} className="text-sm text-[#C8843B] font-bold hover:underline">+ Add Size</button>
                                </div>
                                {formData.price_variants.map((variant, index) => (
                                    <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold mb-1 text-gray-600">Size Amount & Unit</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" min="0" step="0.1"
                                                    value={variant.size_amount} 
                                                    onChange={(e) => handleVariantChange(index, 'size_amount', e.target.value)} 
                                                    className="w-2/3 px-3 py-2 border rounded-lg" 
                                                    placeholder="Amount..." 
                                                />
                                                <select
                                                    value={variant.size_unit}
                                                    onChange={(e) => handleVariantChange(index, 'size_unit', e.target.value)}
                                                    className="w-1/3 px-3 py-2 border rounded-lg bg-white"
                                                >
                                                    <option value="ml">ml</option>
                                                    <option value="l">L</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold mb-1 text-gray-600">Price (Rs.)</label>
                                            <input 
                                                type="number" step="0.01" min="0" 
                                                value={variant.price} 
                                                onChange={(e) => handleVariantChange(index, 'price', e.target.value)} 
                                                className="w-full px-3 py-2 border rounded-lg" 
                                                placeholder="Enter price..." 
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-1">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {formData.price_variants.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No size variations added. Click '+ Add Size' to create one.</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => navigate('/admin/beverages')} className="flex-1 px-4 py-2.5 border rounded-lg">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-[#2E1A12] text-white rounded-lg">{loading ? 'Creating...' : 'Create Beverage'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBeverage;
