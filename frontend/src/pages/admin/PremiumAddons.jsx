import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Trash2, X, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DeleteConfirmation from '../../components/DeleteConfirmation';

const PremiumAddons = () => {
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingAddon, setDeletingAddon] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        id: ''
    });

    useEffect(() => {
        fetchAddons();
    }, []);

    const fetchAddons = async () => {
        try {
            const response = await api.get('/addons');
            if (response.data.success) {
                setAddons(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch add-ons:', error);
            toast.error('Failed to load add-ons');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (addon) => {
        const newStatus = addon.status === 'active' ? 'inactive' : 'active';
        
        // Optimistically update the UI
        setAddons(addons.map(a => 
            a.id === addon.id ? { ...a, status: newStatus } : a
        ));

        try {
            const response = await api.put(`/addons/${addon.id}/status`, { status: newStatus });
            if (!response.data.success) {
                throw new Error('Failed to update');
            }
            toast.success(`Add-on marked as ${newStatus}`);
        } catch (error) {
            console.error('Failed to update addon status:', error);
            toast.error('Error updating status.');
            // Revert on error
            setAddons(addons.map(a => 
                a.id === addon.id ? { ...a, status: addon.status } : a
            ));
        }
    };

    const handleCreateAddon = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.price) {
            toast.error('Please enter name and price');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                id: formData.id.trim() || undefined
            };

            const response = await api.post('/addons', payload);
            if (response.data.success) {
                toast.success('Add-on created successfully');
                setShowAddModal(false);
                setFormData({ name: '', price: '', id: '' });
                fetchAddons();
            }
        } catch (error) {
            console.error('Failed to create add-on:', error);
            toast.error(error.response?.data?.message || 'Failed to create add-on');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddon = async (id) => {
        try {
            const res = await api.delete(`/addons/${id}`);
            if (res.data.success) {
                toast.success('Add-on deleted successfully');
                setAddons(addons.filter(a => a.id !== id));
                setDeletingAddon(null);
            }
        } catch (error) {
            console.error('Failed to delete add-on:', error);
            toast.error(error.response?.data?.message || 'Failed to delete add-on');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8843B]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif mb-1 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#C8843B]" /> Premium Add-Ons
                    </h1>
                    <p className="text-sm text-gray-500">Manage the optional premium add-ons available for customer event bookings.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#C8843B] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#A66D31] transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Add-On</span>
                </button>
            </div>

            {/* Addons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addons.map((addon) => (
                    <div 
                        key={addon.id} 
                        className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                            addon.status === 'inactive' ? 'border-gray-200 opacity-75' : 'border-[#C8843B]/20 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h3 className={`text-lg font-bold font-serif ${addon.status === 'inactive' ? 'text-gray-500' : 'text-[#2E1A12]'}`}>
                                        {addon.name}
                                    </h3>
                                    <span className="text-[11px] text-gray-400 font-mono">ID: {addon.id}</span>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                    addon.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {addon.status}
                                </span>
                            </div>

                            <div className="text-2xl font-black text-[#C8843B]">
                                Rs. {Number(addon.price).toLocaleString()}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                            <button 
                                onClick={() => handleToggleStatus(addon)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                                    addon.status === 'active'
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                }`}
                            >
                                {addon.status === 'active' ? (
                                    <><EyeOff className="w-3.5 h-3.5" /> Deactivate</>
                                ) : (
                                    <><Eye className="w-3.5 h-3.5" /> Activate</>
                                )}
                            </button>

                            <button
                                onClick={() => setDeletingAddon(addon)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-200"
                                title="Delete Add-On"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {addons.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
                        <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-gray-700">No Add-Ons Available</p>
                        <p className="text-sm text-gray-400 mt-1">Click "+ Add New Add-On" above to create your first event add-on.</p>
                    </div>
                )}
            </div>

            {/* Add New Add-On Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#C8843B]/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#2E1A12] to-[#C8843B] p-5 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                                <Plus className="w-5 h-5 text-amber-200" /> Add New Premium Add-On
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAddon} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Add-On Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Live Music Acoustic Band, Photography"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8843B] focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Price (Rs.) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    required
                                    placeholder="e.g., 5000"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8843B] focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Custom ID <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Leave empty to auto-generate"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-xs focus:outline-none focus:border-[#C8843B] focus:bg-white"
                                />
                            </div>

                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-[#C8843B] text-white font-bold rounded-xl hover:bg-[#A66D31] transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Add-On'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deletingAddon && (
                <DeleteConfirmation
                    isOpen={!!deletingAddon}
                    onClose={() => setDeletingAddon(null)}
                    onConfirm={() => handleDeleteAddon(deletingAddon.id)}
                    title={`Delete "${deletingAddon.name}"`}
                    message="Are you sure you want to delete this premium add-on? Event bookings referencing it will no longer offer this add-on."
                />
            )}
        </div>
    );
};

export default PremiumAddons;
