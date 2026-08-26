import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import api from '../../services/api';

const AddCateringPackage = ({ onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) onBack();
        else navigate('/admin/catering-packages');
    };
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
    });
    
    // Items list for the package features
    const [items, setItems] = useState(['']);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, '']);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Filter out empty items
        const filteredItems = items.filter(item => item.trim() !== '');

        if (!formData.name || !formData.price) {
            alert('Name and price are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/catering', {
                ...formData,
                items: filteredItems
            });

            if (response.data.success) {
                toast.success('Package added successfully!');
                handleBack();
            }
        } catch (error) {
            console.error('Failed to create package:', error);
            alert('Failed to create package. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleBack}
                    className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif">Add Catering Package</h1>
                    <p className="text-sm text-gray-500 mt-1">Create a new catering or buffet package</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Package Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Gold Package"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C8843B] focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Head (Rs.) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 2500"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C8843B] focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g. Standard Buffet + Welcome Drink"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C8843B] focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Items List */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-4">Package Features / Menu Items</label>
                        
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleItemChange(index, e.target.value)}
                                            placeholder={`Item ${index + 1} (e.g. Chicken Fried Rice)`}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C8843B] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={items.length === 1}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#C8843B] hover:text-[#2E1A12] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Another Item
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/catering-packages')}
                        className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#2E1A12] hover:bg-[#C8843B] text-white rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Package
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCateringPackage;
