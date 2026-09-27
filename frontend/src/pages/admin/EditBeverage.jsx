import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CreatableSelect from 'react-select/creatable';

const EditBeverage = ({ onBack }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const handleBack = () => {
        if (onBack) onBack();
        else navigate('/admin/beverages');
    };

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        beverage_code: '',
        name: '',
        beverage_category_id: '',
        portion_type: 'regular',
        price: '',
        price_variants: [],
        discount_percentage: 0,
        status: 'active',
        is_available: 1,
        image: null
    });

    const [pendingBeverageCategory, setPendingBeverageCategory] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [bevCatRes, bevRes] = await Promise.all([
                    api.get('/beverages/categories').catch(() => ({ data: [] })),
                    api.get(`/beverages/${id}`)
                ]);

                setCategoriesList(bevCatRes.data || []);
                const bev = bevRes.data;

                let parsedVariants = [];
                if (bev.price_variants) {
                    try {
                        const raw = typeof bev.price_variants === 'string' ? JSON.parse(bev.price_variants) : bev.price_variants;
                        if (Array.isArray(raw)) {
                            parsedVariants = raw.map(v => {
                                const sizeStr = String(v.size || '');
                                const unitMatch = sizeStr.match(/(ml|l|can|bottle)$/i);
                                const unit = unitMatch ? unitMatch[0].toLowerCase() : 'ml';
                                const amount = sizeStr.replace(new RegExp(unit + '$', 'i'), '').trim();
                                return {
                                    size_amount: amount || sizeStr,
                                    size_unit: unit,
                                    price: v.price || ''
                                };
                            });
                        }
                    } catch (e) {
                        console.error('Failed to parse price variants', e);
                    }
                }

                setFormData({
                    beverage_code: bev.beverage_code || '',
                    name: bev.name || '',
                    beverage_category_id: bev.beverage_category_id || '',
                    portion_type: bev.portion_type || 'regular',
                    price: bev.price || '',
                    price_variants: parsedVariants,
                    discount_percentage: bev.discount_percentage || 0,
                    status: bev.status || 'active',
                    is_available: bev.is_available ?? 1,
                    image: null
                });

                if (bev.image_url) {
                    setPreview(bev.image_url);
                }
            } catch (err) {
                console.error('Failed to fetch beverage details:', err);
                toast.error('Failed to load beverage details');
                navigate('/admin/beverages');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

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
        setFormData(prev => ({
            ...prev,
            price_variants: [...prev.price_variants, { size_amount: '', size_unit: 'ml', price: '' }]
        }));
    };

    const removeVariant = (index) => {
        const newVariants = formData.price_variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, price_variants: newVariants }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBeverageCategoryCreateRequest = (inputValue) => {
        setPendingBeverageCategory({ name: inputValue, description: '' });
    };

    const confirmCreateBeverageCategory = async () => {
        if (!pendingBeverageCategory?.description?.trim()) {
            toast.error('Description is required');
            return;
        }
        setSubmitting(true);
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
            setSubmitting(false);
        }
    };

    const categoryOptions = categoriesList.map(cat => ({
        value: cat.id,
        label: cat.name
    }));

    const validateForm = () => {
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
                if (!v.size_amount || !v.price || parseFloat(v.price) <= 0) {
                    toast.error('All variants must have a valid size and price');
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('beverage_code', formData.beverage_code);
            formDataToSend.append('name', formData.name);
            if (formData.beverage_category_id) formDataToSend.append('beverage_category_id', formData.beverage_category_id);
            formDataToSend.append('portion_type', formData.portion_type);
            formDataToSend.append('price', formData.portion_type === 'regular' ? (parseFloat(formData.price) || 0) : 0);
            if (formData.portion_type === 'bottles') {
                formDataToSend.append('price_variants', JSON.stringify(formData.price_variants.map(v => ({ size: `${v.size_amount}${v.size_unit}`, price: parseFloat(v.price) }))));
            }
            formDataToSend.append('discount_percentage', parseFloat(formData.discount_percentage) || 0);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('is_available', formData.is_available ? 1 : 0);

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            await api.put(`/beverages/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Beverage updated successfully');
            handleBack();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update beverage');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-[#2E1A12]/60 font-medium">
                Loading beverage details...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-[#C8843B]/10 rounded-lg">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Beverage</h1>
                    <p className="text-sm mt-1">Modify beverage details, sizes, and pricing</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Beverage Code</label>
                                <input name="beverage_code" value={formData.beverage_code} readOnly className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 font-mono" />
                            </div>

                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Beverage Name <span className="text-red-500">*</span></label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border p-6">
                            <label className="block text-sm font-semibold mb-2">Beverage Category <span className="text-red-500">*</span></label>
                            <CreatableSelect
                                isClearable
                                isLoading={submitting}
                                options={categoryOptions}
                                value={categoryOptions.find(c => c.value === formData.beverage_category_id) || null}
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
                            <label className="block text-sm font-semibold mb-4">Pricing Type</label>
                            
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="portion_type" 
                                        value="regular" 
                                        checked={formData.portion_type === 'regular'} 
                                        onChange={handleInputChange} 
                                        className="text-[#C8843B]" 
                                    />
                                    <span className="text-sm font-medium">Regular Single Price</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="portion_type" 
                                        value="bottles" 
                                        checked={formData.portion_type === 'bottles'} 
                                        onChange={handleInputChange} 
                                        className="text-[#C8843B]" 
                                    />
                                    <span className="text-sm font-medium">Multiple Sizes / Bottles</span>
                                </label>
                            </div>

                            {formData.portion_type === 'regular' ? (
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Price (Rs.) <span className="text-red-500">*</span></label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold">Size Variants</label>
                                        <button 
                                            type="button" 
                                            onClick={addVariant}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8843B]/10 text-[#C8843B] hover:bg-[#C8843B]/20 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Size
                                        </button>
                                    </div>
                                    {formData.price_variants.map((variant, index) => (
                                        <div key={index} className="flex gap-3 items-center bg-gray-50/70 p-3 rounded-xl border">
                                            <div className="w-1/3">
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. 250" 
                                                    value={variant.size_amount} 
                                                    onChange={(e) => handleVariantChange(index, 'size_amount', e.target.value)} 
                                                    className="w-full px-3 py-2 border rounded-lg bg-white"
                                                />
                                            </div>
                                            <div className="w-1/4">
                                                <select 
                                                    value={variant.size_unit} 
                                                    onChange={(e) => handleVariantChange(index, 'size_unit', e.target.value)} 
                                                    className="w-full px-3 py-2 border rounded-lg bg-white"
                                                >
                                                    <option value="ml">ml</option>
                                                    <option value="l">L</option>
                                                    <option value="can">Can</option>
                                                    <option value="bottle">Bottle</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <input 
                                                    type="number" 
                                                    placeholder="Price Rs." 
                                                    value={variant.price} 
                                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)} 
                                                    className="w-full px-3 py-2 border rounded-lg bg-white"
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeVariant(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="block text-sm font-semibold mb-2">Discount Percentage (%)</label>
                                <input type="number" min="0" max="100" name="discount_percentage" value={formData.discount_percentage} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border p-6 text-center">
                            <label className="block text-sm font-semibold mb-4 text-left">Beverage Image</label>
                            
                            {preview ? (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-4 h-52 bg-gray-50 flex items-center justify-center">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setFormData(prev => ({ ...prev, image: null })); setPreview(null); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-4 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm">Upload beverage photo</span>
                                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</span>
                                </div>
                            )}

                            <label className="inline-block px-4 py-2 border border-[#C8843B] text-[#C8843B] rounded-lg cursor-pointer hover:bg-[#C8843B]/10 transition-colors font-medium text-sm">
                                Choose New Image
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>

                        <div className="bg-white rounded-xl border p-6 space-y-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#C8843B] text-white rounded-xl font-bold shadow hover:bg-[#A66D31] transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBeverage;
