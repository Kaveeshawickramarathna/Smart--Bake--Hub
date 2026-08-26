import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const CakeDesigns = () => {

    // Designs State
    const [designs, setDesigns] = useState([]);
    const [loadingDesigns, setLoadingDesigns] = useState(true);
    const [isAddDesignModalOpen, setIsAddDesignModalOpen] = useState(false);
    const [newDesign, setNewDesign] = useState({ name: '', pricing_options: [{ weight_kg: '', price: '' }] });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmittingDesign, setIsSubmittingDesign] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDesigns();
    }, []);

    const fetchDesigns = async () => {
        try {
            const response = await api.get('/cake-designs');
            if (response.data.success) {
                setDesigns(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cake designs:', error);
            toast.error('Failed to load cake designs');
        } finally {
            setLoadingDesigns(false);
        }
    };


    // --- Design Handlers ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddDesignSubmit = async (e) => {
        e.preventDefault();
        if (!newDesign.name || !selectedFile) {
            toast.error('Please provide a name and select an image');
            return;
        }

        setIsSubmittingDesign(true);
        const formData = new FormData();
        formData.append('name', newDesign.name);
        
        // Filter out empty options
        const validOptions = newDesign.pricing_options.filter(p => p.weight_kg && p.price);
        if (validOptions.length > 0) {
            formData.append('pricing_options', JSON.stringify(validOptions));
        }
        
        formData.append('image', selectedFile);

        try {
            const response = await api.post('/cake-designs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                toast.success('Cake design added successfully');
                setDesigns([response.data.data, ...designs]);
                closeAddDesignModal();
            }
        } catch (error) {
            toast.error('Failed to add cake design');
        } finally {
            setIsSubmittingDesign(false);
        }
    };

    const closeAddDesignModal = () => {
        setIsAddDesignModalOpen(false);
        setNewDesign({ name: '', pricing_options: [{ weight_kg: '', price: '' }] });
        setSelectedFile(null);
        setPreviewUrl('');
    };

    const handleToggleDesignStatus = async (design) => {
        const newStatus = design.status === 'active' ? 'inactive' : 'active';
        setDesigns(designs.map(d => d.id === design.id ? { ...d, status: newStatus } : d));
        try {
            const response = await api.put(`/cake-designs/${design.id}/status`, { status: newStatus });
            if (!response.data.success) throw new Error();
            toast.success(`Design marked as ${newStatus}`);
        } catch (error) {
            setDesigns(designs.map(d => d.id === design.id ? { ...d, status: design.status } : d));
            toast.error('Failed to update status');
        }
    };

    const handleDeleteDesign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return;
        try {
            const response = await api.delete(`/cake-designs/${id}`);
            if (response.data.success) {
                toast.success('Design deleted successfully');
                setDesigns(designs.filter(d => d.id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete design');
        }
    };

    if (loadingDesigns) {
        return <div className="text-center py-20 text-gray-500 font-medium">Loading cake settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif mb-1">Cakes</h1>
                    <p className="text-sm text-gray-500">Manage cake designs and dynamic booking options.</p>
                </div>
            </div>

            <div className="space-y-6 animate-fade-in mt-6">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsAddDesignModalOpen(true)}
                            className="flex items-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add New Design
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {designs.map((design) => (
                            <div 
                                key={design.id} 
                                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col ${
                                    design.status === 'inactive' ? 'border-gray-200 opacity-75' : 'border-gray-100 shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {design.image_url ? (
                                        <img 
                                            src={`${BASE_URL}${design.image_url}`} 
                                            alt={design.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide backdrop-blur-md shadow-sm ${
                                            design.status === 'active' 
                                            ? 'bg-green-100/90 text-green-700' 
                                            : 'bg-white/90 text-gray-500'
                                        }`}>
                                            {design.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <h3 className="text-lg font-bold text-[#2E1A12] mb-1 truncate">{design.name}</h3>
                                    <div className="text-sm font-semibold text-[#C8843B] mb-4">
                                        {design.pricing_options && design.pricing_options.length > 0 ? (
                                            <div className="space-y-1 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                                                {design.pricing_options.map((opt, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-[#2E1A12]">{opt.weight_kg} kg</span>
                                                        <span>LKR {Number(opt.price).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span>
                                                {design.weight_kg ? `${design.weight_kg} kg` : '-'} • LKR {design.price ? Number(design.price).toLocaleString() : '0.00'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2 mt-auto">
                                        <button 
                                            onClick={() => handleToggleDesignStatus(design)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                design.status === 'active'
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                        >
                                            {design.status === 'active' ? (
                                                <><EyeOff className="w-3.5 h-3.5" /> Deactivate</>
                                            ) : (
                                                <><Eye className="w-3.5 h-3.5" /> Activate</>
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDesign(design.id)}
                                            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {designs.length === 0 && (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
                                <ImageIcon className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                                <p>No cake designs found.</p>
                            </div>
                        )}
                    </div>
                </div>

            {/* ADD DESIGN MODAL */}
            {isAddDesignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-[#2E1A12]">Add New Design</h2>
                            </div>
                            <button onClick={closeAddDesignModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddDesignSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Design Name</label>
                                <input 
                                    type="text" required
                                    value={newDesign.name}
                                    onChange={(e) => setNewDesign({...newDesign, name: e.target.value})}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Pricing Options (Sizes & Prices)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setNewDesign({
                                            ...newDesign, 
                                            pricing_options: [...newDesign.pricing_options, { weight_kg: '', price: '' }]
                                        })}
                                        className="text-[#C8843B] text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add Size
                                    </button>
                                </div>
                                {newDesign.pricing_options.map((opt, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
                                        <div className="space-y-1">
                                            {index === 0 && <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>}
                                            <input 
                                                type="number" step="0.01" min="0" required
                                                value={opt.weight_kg}
                                                onChange={(e) => {
                                                    const newOpts = [...newDesign.pricing_options];
                                                    newOpts[index].weight_kg = e.target.value;
                                                    setNewDesign({...newDesign, pricing_options: newOpts});
                                                }}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                                placeholder="e.g. 1.5"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            {index === 0 && <label className="text-[10px] font-bold text-gray-400 uppercase">Price (LKR)</label>}
                                            <input 
                                                type="number" step="0.01" min="0" required
                                                value={opt.price}
                                                onChange={(e) => {
                                                    const newOpts = [...newDesign.pricing_options];
                                                    newOpts[index].price = e.target.value;
                                                    setNewDesign({...newDesign, pricing_options: newOpts});
                                                }}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                                placeholder="e.g. 2500"
                                            />
                                        </div>
                                        <div className={`pt-${index === 0 ? '6' : '1'} flex items-center h-full`}>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newOpts = newDesign.pricing_options.filter((_, i) => i !== index);
                                                    setNewDesign({...newDesign, pricing_options: newOpts.length ? newOpts : [{ weight_kg: '', price: '' }]});
                                                }}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Image</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                                        previewUrl ? 'border-[#C8843B]/30' : 'border-gray-200 hover:border-[#C8843B] bg-gray-50'
                                    }`}
                                    style={{ height: previewUrl ? '200px' : '150px' }}
                                >
                                    {previewUrl ? (
                                        <div className="absolute inset-0 group">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-sm font-bold flex items-center gap-2">
                                                    <Upload className="w-4 h-4" /> Change Image
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium text-gray-500">Click to browse</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100">
                                <button 
                                    type="submit" disabled={isSubmittingDesign}
                                    className="w-full py-3 bg-[#2E1A12] text-white rounded-xl text-sm font-bold shadow hover:bg-[#C8843B] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isSubmittingDesign ? 'Uploading...' : 'Save Design'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CakeDesigns;
