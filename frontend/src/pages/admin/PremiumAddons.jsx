import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PremiumAddons = () => {
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-medium">Loading add-ons...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif mb-1">Premium Add-Ons</h1>
                    <p className="text-sm text-gray-500">Manage the optional add-ons available for event bookings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addons.map((addon) => (
                    <div 
                        key={addon.id} 
                        className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                            addon.status === 'inactive' ? 'border-gray-200 opacity-75' : 'border-[#C8843B]/20 shadow-sm hover:shadow-md'
                        }`}
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-lg font-bold font-serif ${addon.status === 'inactive' ? 'text-gray-500' : 'text-[#2E1A12]'}`}>
                                    {addon.name}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
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

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button 
                                onClick={() => handleToggleStatus(addon)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    addon.status === 'active'
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                            >
                                {addon.status === 'active' ? (
                                    <><EyeOff className="w-4 h-4" /> Deactivate</>
                                ) : (
                                    <><Eye className="w-4 h-4" /> Activate</>
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {addons.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                        No add-ons found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumAddons;
