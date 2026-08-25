import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        price: '',
        availability: 'available',
        image: null
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/products/categories');
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Product description is required');
            return false;
        }
        if (!formData.category_id) {
            toast.error('Category is required');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Valid price is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('availability', formData.availability);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            await api.post('/products', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Product created successfully');
            navigate('/admin/products');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create product';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-[#C8843B]/10 rounded-lg transition-colors text-[#2E1A12]"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#2E1A12] font-serif">Add New Product</h1>
                    <p className="text-[#2E1A12]/60 text-sm mt-1">Create a new product in your bakery catalog</p>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Name */}
                        <div className="bg-white rounded-xl border border-[#C8843B]/20 p-6">
                            <label className="block text-sm font-semibold text-[#2E1A12] mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Chocolate Cake"
                                className="w-full px-4 py-2.5 border border-[#C8843B]/20 rounded-lg bg-white text-[#2E1A12] placeholder-[#2E1A12]/40 focus:outline-none focus:border-[#C8843B] transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-[#C8843B]/20 p-6">
                            <label className="block text-sm font-semibold text-[#2E1A12] mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your product..."
                                rows="4"
                                className="w-full px-4 py-2.5 border border-[#C8843B]/20 rounded-lg bg-white text-[#2E1A12] placeholder-[#2E1A12]/40 focus:outline-none focus:border-[#C8843B] transition-colors resize-none"
                            />
                        </div>

                        {/* Category and Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-[#C8843B]/20 p-6">
                                <label className="block text-sm font-semibold text-[#2E1A12] mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-[#C8843B]/20 rounded-lg bg-white text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-colors appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-white rounded-xl border border-[#C8843B]/20 p-6">
                                <label className="block text-sm font-semibold text-[#2E1A12] mb-2">
                                    Price (Rs.) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 border border-[#C8843B]/20 rounded-lg bg-white text-[#2E1A12] placeholder-[#2E1A12]/40 focus:outline-none focus:border-[#C8843B] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-xl border border-[#C8843B]/20 p-6">
                            <label className="block text-sm font-semibold text-[#2E1A12] mb-2">
                                Availability Status
                            </label>
                            <select
                                name="availability"
                                value={formData.availability}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-[#C8843B]/20 rounded-lg bg-white text-[#2E1A12] focus:outline-none focus:border-[#C8843B] transition-colors appearance-none"
                            >
                                <option value="available">Available</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2.5 border border-[#C8843B]/20 text-[#2E1A12] rounded-lg hover:bg-[#C8843B]/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-[#2E1A12] text-white rounded-lg hover:bg-[#2E1A12]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Image Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-[#C8843B]/20 p-6 sticky top-20">
                        <label className="block text-sm font-semibold text-[#2E1A12] mb-4">
                            Product Image
                        </label>
                        
                        <div className="mb-4">
                            {preview ? (
                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#F7F4ED] border border-[#C8843B]/20">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-square rounded-lg bg-[#F7F4ED] border-2 border-dashed border-[#C8843B]/30 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-[#C8843B]/50" />
                                </div>
                            )}
                        </div>

                        <label className="block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <span className="block w-full px-4 py-2.5 bg-[#C8843B]/10 text-[#C8843B] text-sm font-medium text-center rounded-lg cursor-pointer hover:bg-[#C8843B]/20 transition-colors">
                                Choose Image
                            </span>
                        </label>

                        <p className="text-xs text-[#2E1A12]/60 mt-3">
                            Recommended: 400x400px, PNG or JPG
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
