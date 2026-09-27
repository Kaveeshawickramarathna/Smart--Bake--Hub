import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { mockMenuCategories } from '../../data/mockMenus';
import CreatableSelect from 'react-select/creatable';

const EditMenu = ({ onBack }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const handleBack = () => {
        if (onBack) onBack();
        else navigate('/admin/menus');
    };

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        dish_code: '',
        name: '',
        menu_category: '',
        category: '',
        portion_type: 'regular',
        price: '',
        price_small: '',
        price_large: '',
        discount_percentage: 0,
        status: 'active',
        is_available: 1,
        image: null
    });

    const [pendingCategory, setPendingCategory] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [catRes, menuRes] = await Promise.all([
                    api.get('/menus/categories').catch(() => ({ data: mockMenuCategories })),
                    api.get(`/menus/${id}`)
                ]);

                const fetchedCats = catRes.data || mockMenuCategories;
                setCategoriesList(fetchedCats);

                const menu = menuRes.data;
                setFormData({
                    dish_code: menu.dish_code || '',
                    name: menu.name || '',
                    menu_category: menu.menu_category || '',
                    category: menu.category_id || '',
                    portion_type: menu.portion_type || 'regular',
                    price: menu.price || '',
                    price_small: menu.price_small || '',
                    price_large: menu.price_large || '',
                    discount_percentage: menu.discount_percentage || 0,
                    status: menu.status || 'active',
                    is_available: menu.is_available ?? 1,
                    image: null
                });
                if (menu.image_url) {
                    setPreview(menu.image_url);
                }
            } catch (err) {
                console.error('Failed to load dish details:', err);
                toast.error('Failed to load dish details');
                navigate('/admin/menus');
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

    const handleCategoryCreateRequest = (inputValue) => {
        setPendingCategory({ name: inputValue, description: '' });
    };

    const confirmCreateCategory = async () => {
        if (!pendingCategory?.description?.trim()) {
            toast.error('Description is required');
            return;
        }
        setSubmitting(true);
        try {
            const res = await api.post('/menus/categories', pendingCategory);
            const newCat = { id: res.data.id, name: res.data.name };
            setCategoriesList(prev => [...prev, newCat]);
            setFormData(prev => ({ ...prev, category: newCat.id }));
            setPendingCategory(null);
            toast.success('Category added successfully');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add category');
        } finally {
            setSubmitting(false);
        }
    };

    const categoryOptions = (categoriesList.length ? categoriesList : mockMenuCategories).map(cat => ({
        value: cat.id,
        label: cat.name
    }));

    const validateForm = () => {
        if (!formData.name.trim()) { toast.error('Dish name is required'); return false; }
        if (!formData.menu_category) { toast.error('Menu category is required'); return false; }
        if (!formData.category) { toast.error('Category is required'); return false; }
        
        if (formData.portion_type === 'regular') {
            if (!formData.price || parseFloat(formData.price) <= 0) { toast.error('Valid price is required'); return false; }
        } else {
            if (!formData.price_small || parseFloat(formData.price_small) <= 0) { toast.error('Valid small price is required'); return false; }
            if (!formData.price_large || parseFloat(formData.price_large) <= 0) { toast.error('Valid large price is required'); return false; }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('dish_code', formData.dish_code);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('menu_category', formData.menu_category);
            if (formData.category) formDataToSend.append('category_id', formData.category);
            formDataToSend.append('portion_type', formData.portion_type);
            formDataToSend.append('price', formData.portion_type === 'regular' ? (parseFloat(formData.price) || 0) : 0);
            formDataToSend.append('price_small', formData.portion_type === 'varied' ? (parseFloat(formData.price_small) || 0) : 0);
            formDataToSend.append('price_large', formData.portion_type === 'varied' ? (parseFloat(formData.price_large) || 0) : 0);
            formDataToSend.append('discount_percentage', parseFloat(formData.discount_percentage) || 0);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('is_available', formData.is_available ? 1 : 0);

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            await api.put(`/menus/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Dish updated successfully');
            handleBack();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update dish');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-[#2E1A12]/60 font-medium">
                Loading dish details...
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
                    <h1 className="text-3xl font-bold">Edit Dish</h1>
                    <p className="text-sm mt-1">Modify dish details, pricing, and image</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Dish Code</label>
                                <input name="dish_code" value={formData.dish_code} readOnly className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 font-mono" />
                            </div>

                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Dish Name <span className="text-red-500">*</span></label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                                <CreatableSelect
                                    isClearable
                                    isLoading={submitting}
                                    options={categoryOptions}
                                    value={categoryOptions.find(c => c.value === formData.category) || null}
                                    onChange={(selected) => setFormData(prev => ({ ...prev, category: selected ? selected.value : '' }))}
                                    onCreateOption={handleCategoryCreateRequest}
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
                                {pendingCategory && (
                                    <div className="mt-4 p-4 border border-[#C8843B]/30 rounded-xl bg-[#C8843B]/5">
                                        <h4 className="text-sm font-bold text-[#2E1A12] mb-3">Add Category Description</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold mb-1 text-[#2E1A12]/70">Name</label>
                                                <input 
                                                    value={pendingCategory.name} 
                                                    readOnly
                                                    className="w-full px-3 py-2 border rounded-lg bg-white/50 text-[#2E1A12]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1 text-[#2E1A12]/70">Description <span className="text-red-500">*</span></label>
                                                <textarea 
                                                    value={pendingCategory.description}
                                                    onChange={(e) => setPendingCategory({ ...pendingCategory, description: e.target.value })}
                                                    className="w-full px-3 py-2 border border-[#C8843B]/20 rounded-lg focus:outline-none focus:border-[#C8843B]"
                                                    rows="2"
                                                    placeholder="Enter category description..."
                                                ></textarea>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button type="button" onClick={confirmCreateCategory} className="px-4 py-2 bg-[#C8843B] text-white rounded-lg text-sm font-bold hover:bg-[#A66D31] transition-colors">Save</button>
                                                <button type="button" onClick={() => setPendingCategory(null)} className="px-4 py-2 bg-white border border-[#C8843B]/20 text-[#2E1A12] rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Menu Group / Type <span className="text-red-500">*</span></label>
                                <select name="menu_category" value={formData.menu_category} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]">
                                    <option value="">Select Group</option>
                                    <option value="Main Course">Main Course</option>
                                    <option value="Appetizer">Appetizer</option>
                                    <option value="Dessert">Dessert</option>
                                    <option value="Side Dish">Side Dish</option>
                                    <option value="Bakery">Bakery</option>
                                </select>
                            </div>
                        </div>

                        {/* Pricing Configuration */}
                        <div className="bg-white rounded-xl border p-6">
                            <label className="block text-sm font-semibold mb-4">Portion & Pricing Type</label>
                            
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
                                        value="varied" 
                                        checked={formData.portion_type === 'varied'} 
                                        onChange={handleInputChange} 
                                        className="text-[#C8843B]" 
                                    />
                                    <span className="text-sm font-medium">Small / Large Sizes</span>
                                </label>
                            </div>

                            {formData.portion_type === 'regular' ? (
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Price (Rs.) <span className="text-red-500">*</span></label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Small Price (Rs.) <span className="text-red-500">*</span></label>
                                        <input type="number" step="0.01" name="price_small" value={formData.price_small} onChange={handleInputChange} placeholder="0.00" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Large Price (Rs.) <span className="text-red-500">*</span></label>
                                        <input type="number" step="0.01" name="price_large" value={formData.price_large} onChange={handleInputChange} placeholder="0.00" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#C8843B]" />
                                    </div>
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
                            <label className="block text-sm font-semibold mb-4 text-left">Dish Image</label>
                            
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
                                    <span className="text-sm">Upload appetizing photo</span>
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

export default EditMenu;
