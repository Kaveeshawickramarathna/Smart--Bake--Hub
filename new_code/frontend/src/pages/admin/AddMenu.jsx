import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { mockMenuCategories } from '../../data/mockMenus';
import CreatableSelect from 'react-select/creatable';

const AddMenu = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [formData, setFormData] = useState({
        dish_code: '',
        name: '',
        menu_category: '',
        category: '',
        portion_type: 'regular',
        price: '',
        price_small: '',
        price_large: ''
    });

    const [pendingCategory, setPendingCategory] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [catRes, codeRes] = await Promise.all([
                    api.get('/menus/categories').catch(() => ({ data: mockMenuCategories })),
                    api.get('/menus/next-code').catch(() => ({ data: { nextCode: 'WBD0001' } }))
                ]);
                setCategoriesList(catRes.data || mockMenuCategories);
                setFormData(prev => ({ ...prev, dish_code: codeRes.data.nextCode || 'WBD0001' }));
            } catch (err) {
                setCategoriesList(mockMenuCategories);
            }
        };
        load();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryCreateRequest = (inputValue) => {
        setPendingCategory({ name: inputValue, description: '' });
    };

    const confirmCreateCategory = async () => {
        if (!pendingCategory?.description?.trim()) {
            toast.error('Description is required');
            return;
        }
        setLoading(true);
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
            setLoading(false);
        }
    };

    const categoryOptions = (categoriesList.length ? categoriesList : mockMenuCategories).map(cat => ({
        value: cat.id,
        label: cat.name
    }));



    const validateForm = () => {
        if (!formData.dish_code.trim()) { toast.error('Dish code is required'); return false; }
        if (!formData.name.trim()) { toast.error('Dish name is required'); return false; }
        if (!formData.menu_category) { toast.error('Menu category is required'); return false; }
        if (!formData.category) { toast.error('Category is required'); return false; }
        
        if (!formData.price || parseFloat(formData.price) <= 0) { toast.error('Valid price is required'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                dish_code: formData.dish_code,
                name: formData.name,
                menu_category: formData.menu_category,
                category_id: formData.category || null,
                price: (parseFloat(formData.price) || 0)
            };

            await api.post('/menus', payload);
            toast.success('Dish created successfully');
            navigate('/admin/menus');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to create dish');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin/menus')} className="p-2 hover:bg-[#C8843B]/10 rounded-lg">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Create New Dish</h1>
                    <p className="text-sm mt-1">Add details for the new dish</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Dish Code <span className="text-red-500">*</span></label>
                                <input name="dish_code" value={formData.dish_code} readOnly className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500" />
                            </div>

                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Dish Name <span className="text-red-500">*</span></label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border p-6">
                                <label className="block text-sm font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                                <CreatableSelect
                                    isClearable
                                    isLoading={loading}
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
                                <label className="block text-sm font-semibold mb-2">Menu Category <span className="text-red-500">*</span></label>
                                <select name="menu_category" value={formData.menu_category} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg">
                                    <option value="">Select Menu Category</option>
                                    <option value="A La Carte">A La Carte</option>
                                    <option value="Set Menu">Set Menu</option>
                                    <option value="Buffet">Buffet</option>
                                    <option value="Special">Special</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border p-6">
                            <label className="block text-sm font-semibold mb-2">Price (Rs.) <span className="text-red-500">*</span></label>
                            <input name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg" />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => navigate('/admin/menus')} className="flex-1 px-4 py-2.5 border rounded-lg">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-[#2E1A12] text-white rounded-lg">{loading ? 'Creating...' : 'Create Dish'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMenu;
