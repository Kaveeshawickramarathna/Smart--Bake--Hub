import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CateringPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await api.get('/catering');
            if (response.data.success) {
                setPackages(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch catering packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (pkg) => {
        const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
        
        // Optimistically update the UI
        setPackages(packages.map(p => 
            p.id === pkg.id ? { ...p, status: newStatus } : p
        ));

        try {
            const response = await api.put(`/catering/${pkg.id}/status`, { status: newStatus });
            if (!response.data.success) {
                // Revert on failure
                setPackages(packages.map(p => 
                    p.id === pkg.id ? { ...p, status: pkg.status } : p
                ));
            }
        } catch (error) {
            console.error('Failed to update package status:', error);
            alert('Error updating package status.');
            // Revert on error
            setPackages(packages.map(p => 
                p.id === pkg.id ? { ...p, status: pkg.status } : p
            ));
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-medium">Loading packages...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif">Catering Packages</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage catering packages and bundles</p>
                </div>
                <Link to="/admin/catering-packages/add" className="bg-[#2E1A12] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#C8843B] transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Package
                </Link>
            </div>

            {packages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2E1A12] mb-1">No Packages Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first catering package to offer to customers.</p>
                    <Link to="/admin/catering-packages/add" className="text-[#C8843B] font-medium hover:underline">
                        Create Package
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative group overflow-hidden transition-opacity ${pkg.status === 'inactive' ? 'opacity-60 bg-gray-50 grayscale-[0.5]' : ''}`}>
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                <span className={`text-xs font-semibold ${pkg.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                                    {pkg.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <button 
                                    onClick={() => handleToggleStatus(pkg)} 
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8843B] focus:ring-offset-2 ${pkg.status === 'active' ? 'bg-[#C8843B]' : 'bg-gray-200'}`}
                                    title={pkg.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                                >
                                    <span 
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pkg.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} 
                                    />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-[#2E1A12] font-serif">{pkg.name}</h3>
                                {pkg.status === 'inactive' && (
                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Inactive</span>
                                )}
                            </div>
                            <div className="text-[#C8843B] font-bold text-lg mb-2">Rs. {Number(pkg.price).toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ HEAD</span></div>
                            
                            {pkg.description && (
                                <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">{pkg.description}</p>
                            )}

                            <div className="flex-1">
                                <ul className="space-y-2">
                                    {Array.isArray(pkg.items) && pkg.items.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-[#C8843B] mt-1 text-xs">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CateringPackages;
