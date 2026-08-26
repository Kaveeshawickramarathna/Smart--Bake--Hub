import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, MapPin, Package, Check, 
    ArrowLeft, Send, Sparkles, AlertCircle, X, Image as ImageIcon
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddEvent = ({ onBack }) => {
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);

const handleBack = () => {
    if (onBack) onBack();
    else navigate('/admin/events');
};

const [isCakeModalOpen, setIsCakeModalOpen] = useState(false);
const [cakeCustomization, setCakeCustomization] = useState({
    design: '',
    flavor: 'Chocolate',
    icing: 'Buttercream',
    weight: '1kg',
    shape: 'Round',
    message: '',
    specialInstructions: ''
});

    const [formData, setFormData] = useState({
        event_type: 'Birthday',
        event_date: '',
        start_time: '',
        end_time: '',
        hall_name: 'Grand Ballroom',
        package_name: 'Gold',
        guest_count: 50,
        add_ons: [],
        special_notes: '',
        customer_name: '',
        customer_email: '',
        customer_phone: ''
    });

    // Configuration Data
    const eventTypes = ['Birthday', 'Corporate Event', 'Anniversary', 'Party'];
    const halls = [
        { id: 'Grand Ballroom', capacity: 300, price: 150000 },
        { id: 'Sapphire Hall', capacity: 150, price: 75000 },
        { id: 'Ruby Garden', capacity: 100, price: 50000 }
    ];
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [availableAddOns, setAvailableAddOns] = useState([]);
    const [loadingAddOns, setLoadingAddOns] = useState(true);
    const [cakeDesigns, setCakeDesigns] = useState([]);
    const [cakeOptions, setCakeOptions] = useState([]);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await api.get('/catering');
                if (response.data.success) {
                    const activePackages = response.data.data.filter(pkg => pkg.status === 'active');
                    setPackages(activePackages);
                    if (activePackages.length > 0) {
                        setFormData(prev => ({ ...prev, package_name: activePackages[0].name || activePackages[0].id }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch catering packages:', error);
            } finally {
                setLoadingPackages(false);
            }
        };
        const fetchAddOns = async () => {
            try {
                const response = await api.get('/addons');
                if (response.data.success) {
                    const activeAddOns = response.data.data.filter(addon => addon.status === 'active');
                    setAvailableAddOns(activeAddOns);
                }
            } catch (error) {
                console.error('Failed to fetch add-ons:', error);
            } finally {
                setLoadingAddOns(false);
            }
        };
        const fetchCakeData = async () => {
            try {
                const [designsRes, optionsRes] = await Promise.all([
                    api.get('/cake-designs'),
                    api.get('/cake-options')
                ]);
                
                if (designsRes.data.success) {
                    setCakeDesigns(designsRes.data.data.filter(d => d.status === 'active'));
                }
                if (optionsRes.data.success) {
                    const activeOpts = optionsRes.data.data.filter(o => o.status === 'active');
                    setCakeOptions(activeOpts);
                    
                    // Set defaults based on first active option of each category
                    const defaultFlavor = activeOpts.find(o => o.category === 'flavor')?.value || '';
                    const defaultIcing = activeOpts.find(o => o.category === 'icing')?.value || '';
                    const defaultWeight = activeOpts.find(o => o.category === 'weight')?.value || '';
                    const defaultShape = activeOpts.find(o => o.category === 'shape')?.value || '';
                    
                    setCakeCustomization(prev => ({
                        ...prev,
                        flavor: defaultFlavor,
                        icing: defaultIcing,
                        weight: defaultWeight,
                        shape: defaultShape
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch cake data:', error);
            }
        };
        fetchPackages();
        fetchAddOns();
        fetchCakeData();
    }, []);

    useEffect(() => {
        const checkAutoAvailability = async () => {
            if (!formData.event_date || !formData.start_time || !formData.end_time || !formData.hall_name) {
                setIsAvailable(null);
                return;
            }
            
            setCheckingAvailability(true);
            try {
                const { data } = await api.get('/bookings/check-availability', {
                    params: {
                        date: formData.event_date,
                        start_time: formData.start_time,
                        end_time: formData.end_time,
                        hall: formData.hall_name
                    }
                });
                setIsAvailable(data.available);
            } catch (error) {
                console.error("Failed to auto-check availability", error);
                setIsAvailable(null);
            } finally {
                setCheckingAvailability(false);
            }
        };

        checkAutoAvailability();
    }, [formData.event_date, formData.start_time, formData.end_time, formData.hall_name]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddOnToggle = (addonId) => {
        setFormData(prev => {
            const exists = prev.add_ons.includes(addonId);
            if (exists) {
                return { ...prev, add_ons: prev.add_ons.filter(id => id !== addonId) };
            } else {
                return { ...prev, add_ons: [...prev.add_ons, addonId] };
            }
        });
    };

    const calculateTotal = () => {
        const hall = halls.find(h => h.id === formData.hall_name);
        const pkg = packages.find(p => p.name === formData.package_name || p.id === formData.package_name);
        
        let total = (hall ? hall.price : 0) + (pkg ? Number(pkg.price || pkg.pricePerHead) * formData.guest_count : 0);
        
        formData.add_ons.forEach(addonId => {
            const addon = availableAddOns.find(a => a.id === addonId);
            if (addon) total += Number(addon.price);
        });

        if (formData.event_session === 'full-day') {
            total += (hall ? hall.price * 0.5 : 0);
        }

        return total;
    };

    // Automatic availability check handles the status updates

    const submitBooking = async (e) => {
        e.preventDefault();

        let currentAvailability = isAvailable;

        if (currentAvailability === null) {
            if (!formData.event_date) {
                toast.error("Please select a date first");
                return;
            }
            if (!formData.start_time || !formData.end_time) {
                toast.error("Please select both start and end times");
                return;
            }
            setLoading(true);
            try {
                const { data } = await api.get('/bookings/check-availability', {
                    params: {
                        date: formData.event_date,
                        start_time: formData.start_time,
                        end_time: formData.end_time,
                        hall: formData.hall_name
                    }
                });
                setIsAvailable(data.available);
                currentAvailability = data.available;
                
                if (!data.available) {
                    toast.error('Hall is already booked for this session.');
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to check availability automatically');
                setLoading(false);
                return;
            }
            setLoading(false); // Clear loading state after successful check before validations
        } else if (currentAvailability === false) {
            toast.error("Please select an available date/session/hall before proceeding");
            return;
        }

        const hall = halls.find(h => h.id === formData.hall_name);
        if (formData.guest_count > hall.capacity) {
            toast.error(`Guest count cannot exceed the hall capacity (${hall.capacity} pax)`);
            return;
        }

        if (!formData.customer_name || !formData.customer_phone || !formData.customer_email) {
            toast.error('Please fill in all customer contact details.');
            return;
        }

        setLoading(true);
        try {
            const total_price = calculateTotal();
            let finalSpecialNotes = formData.special_notes;
            
            if (formData.add_ons.includes('cake')) {
                const designName = cakeDesigns.find(d => d.id === cakeCustomization.design)?.name || 'Custom/No Design';
                const cakeDetails = `\n\n--- Cake Customization ---\nDesign: ${designName}\nFlavor: ${cakeCustomization.flavor}\nIcing: ${cakeCustomization.icing}\nWeight: ${cakeCustomization.weight}\nShape: ${cakeCustomization.shape}\nMessage: ${cakeCustomization.message || 'N/A'}\nInstructions: ${cakeCustomization.specialInstructions || 'N/A'}`;
                finalSpecialNotes = finalSpecialNotes ? finalSpecialNotes + cakeDetails : cakeDetails;
            }

            const payload = { ...formData, special_notes: finalSpecialNotes, total_price };
            
            await api.post('/bookings/manual', payload);
            toast.success('Manual booking created successfully!', { icon: '🎉' });
            handleBack();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleBack}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#2E1A12] transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif">Create Manual Booking</h1>
                    <p className="text-sm text-gray-500 mt-1">Book an event hall on behalf of a customer.</p>
                </div>
            </div>

            <form onSubmit={submitBooking} className="bg-white rounded-[24px] border border-[#C8843B]/10 p-6 md:p-8 shadow-[0_4px_20px_rgba(46,26,18,0.02)] space-y-8">
                
                {/* Section 1: Customer Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#C8843B] uppercase tracking-wider border-b border-gray-100 pb-2">1. Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input 
                                type="text" required
                                name="customer_name" 
                                value={formData.customer_name} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input 
                                type="email" required
                                name="customer_email" 
                                value={formData.customer_email} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                            <input 
                                type="tel" required
                                name="customer_phone" 
                                value={formData.customer_phone} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Event Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#C8843B] uppercase tracking-wider border-b border-gray-100 pb-2">2. Event Schedule & Venue</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Event Type</label>
                            <select 
                                name="event_type" 
                                value={formData.event_type} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            >
                                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Event Date</label>
                            <input 
                                type="date" required
                                name="event_date" 
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.event_date} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Event Time</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="time" 
                                    name="start_time" 
                                    min="09:00"
                                    max="21:00"
                                    value={formData.start_time} 
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                                />
                                <span className="text-gray-400 font-bold">to</span>
                                <input 
                                    type="time" 
                                    name="end_time" 
                                    min="10:00"
                                    max="22:00"
                                    value={formData.end_time} 
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Venue / Hall</label>
                            <select 
                                name="hall_name" 
                                value={formData.hall_name} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            >
                                {halls.map(h => <option key={h.id} value={h.id}>{h.id} (Max {h.capacity} Pax)</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
                        isAvailable === true ? 'bg-green-50/50 border-green-200' :
                        isAvailable === false ? 'bg-red-50/50 border-red-200' :
                        'bg-blue-50/50 border-blue-100'
                    }`}>
                        <div className="flex items-center gap-2">
                            {checkingAvailability ? (
                                <span className="text-xs font-semibold text-blue-600 flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Checking availability...
                                </span>
                            ) : isAvailable === true ? (
                                <span className="text-xs font-bold text-green-700 flex items-center gap-1.5">
                                    <Check className="w-4 h-4" /> Hall is Available
                                </span>
                            ) : isAvailable === false ? (
                                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4" /> Hall is Booked for this time
                                </span>
                            ) : (
                                <span className="text-xs font-semibold text-gray-500">
                                    Fill in the date and time to automatically check availability.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Packages & Guests */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#C8843B] uppercase tracking-wider border-b border-gray-100 pb-2">3. Package & Add-ons</h3>
                    
                    <div className="space-y-2 max-w-sm mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Guest Count
                        </label>
                        <input 
                            type="number" required min="10"
                            name="guest_count" 
                            max={halls.find(h => h.id === formData.hall_name)?.capacity}
                            value={formData.guest_count} 
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {loadingPackages ? (
                            <div className="col-span-3 text-center py-4 text-gray-500 text-sm">Loading packages...</div>
                        ) : packages.map(pkg => (
                            <div 
                                key={pkg.id || pkg.name}
                                onClick={() => setFormData({...formData, package_name: pkg.name || pkg.id})}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    formData.package_name === (pkg.name || pkg.id) 
                                    ? 'border-[#8B4513] bg-[#8B4513]/5' 
                                    : 'border-gray-200 hover:border-[#8B4513]/30'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                                    {formData.package_name === (pkg.name || pkg.id) && (
                                        <div className="w-5 h-5 rounded-full bg-[#8B4513] flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-[#8B4513]">
                                    Rs. {Number(pkg.price || pkg.pricePerHead).toLocaleString()} <span className="text-gray-500 font-normal">/ head</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{pkg.description || pkg.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {availableAddOns.map(addon => {
                            const isSelected = formData.add_ons.includes(addon.id);
                            return (
                                <div key={addon.id} className="flex flex-col gap-2">
                                    <div 
                                        onClick={() => handleAddOnToggle(addon.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                            isSelected 
                                            ? 'border-[#C8843B] bg-white shadow-sm' 
                                            : 'border-gray-100 bg-gray-50/50 hover:bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                isSelected ? 'bg-[#C8843B] border-[#C8843B]' : 'bg-white border-gray-300'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-sm font-semibold text-[#2E1A12]">{addon.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#C8843B]">Rs. {Number(addon.price).toLocaleString()}</span>
                                    </div>

                                    {isSelected && addon.id === 'cake' && (
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setIsCakeModalOpen(true); }}
                                            className="ml-8 mr-2 py-1.5 px-3 bg-[#FDF6ED] border border-[#C8843B]/30 rounded-lg text-xs font-bold text-[#C8843B] hover:bg-[#C8843B] hover:text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> Cake
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#C8843B] uppercase tracking-wider border-b border-gray-100 pb-2">4. Special Notes</h3>
                    <textarea 
                        name="special_notes" 
                        rows="2"
                        placeholder="Dietary requirements or manual booking notes..."
                        value={formData.special_notes} 
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors resize-none"
                    ></textarea>
                </div>

                {/* Total & Submit */}
                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Estimated Cost</p>
                        <p className="text-3xl font-black text-[#C8843B] font-serif">Rs. {calculateTotal().toLocaleString()}</p>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? 'Submitting...' : 'Save Manual Booking'} <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* CAKE CUSTOMIZATION MODAL */}
            {isCakeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-amber-50/30">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-[#2E1A12]">Cake</h2>
                                <p className="text-xs text-gray-500 mt-1">Design the perfect cake for the event</p>
                            </div>
                            <button type="button" onClick={() => setIsCakeModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                            {/* Cake Designs Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Select a Design
                                </label>
                                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-gray-200">
                                    {cakeDesigns.map((design) => (
                                        <div 
                                            key={design.id}
                                            onClick={() => setCakeCustomization({...cakeCustomization, design: design.id})}
                                            className={`min-w-[120px] cursor-pointer rounded-xl overflow-hidden border-2 transition-all snap-start ${
                                                cakeCustomization.design === design.id 
                                                ? 'border-[#C8843B] shadow-md transform scale-105' 
                                                : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                                            }`}
                                        >
                                            <div className="aspect-square bg-gray-100">
                                                <img src={`${BASE_URL}${design.image_url}`} alt={design.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className={`p-2 text-center text-xs font-bold truncate ${cakeCustomization.design === design.id ? 'bg-[#C8843B] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                {design.name}
                                            </div>
                                        </div>
                                    ))}
                                    {cakeDesigns.length === 0 && (
                                        <div className="text-sm text-gray-400 italic py-2">No active cake designs available.</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Flavor</label>
                                    <select 
                                        value={cakeCustomization.flavor}
                                        onChange={(e) => setCakeCustomization({...cakeCustomization, flavor: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                    >
                                        <option value="">Select Flavor</option>
                                        {cakeOptions.filter(o => o.category === 'flavor').map(opt => (
                                            <option key={opt.id} value={opt.value}>{opt.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Icing Type</label>
                                    <select 
                                        value={cakeCustomization.icing}
                                        onChange={(e) => setCakeCustomization({...cakeCustomization, icing: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                    >
                                        <option value="">Select Icing</option>
                                        {cakeOptions.filter(o => o.category === 'icing').map(opt => (
                                            <option key={opt.id} value={opt.value}>{opt.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Weight</label>
                                    <select 
                                        value={cakeCustomization.weight}
                                        onChange={(e) => setCakeCustomization({...cakeCustomization, weight: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                    >
                                        <option value="">Select Weight</option>
                                        {cakeOptions.filter(o => o.category === 'weight').map(opt => (
                                            <option key={opt.id} value={opt.value}>{opt.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Shape</label>
                                    <select 
                                        value={cakeCustomization.shape}
                                        onChange={(e) => setCakeCustomization({...cakeCustomization, shape: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                    >
                                        <option value="">Select Shape</option>
                                        {cakeOptions.filter(o => o.category === 'shape').map(opt => (
                                            <option key={opt.id} value={opt.value}>{opt.value}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Message on Cake</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Happy Birthday John!"
                                    value={cakeCustomization.message}
                                    onChange={(e) => setCakeCustomization({...cakeCustomization, message: e.target.value})}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-[#C8843B] focus:outline-none"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Special Instructions / Theme</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Any specific colors, themes, or design details?"
                                    value={cakeCustomization.specialInstructions}
                                    onChange={(e) => setCakeCustomization({...cakeCustomization, specialInstructions: e.target.value})}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#C8843B] focus:outline-none resize-none"
                                ></textarea>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button 
                                type="button"
                                onClick={() => setIsCakeModalOpen(false)}
                                className="px-6 py-2.5 bg-[#2E1A12] text-white rounded-xl text-sm font-bold shadow hover:bg-[#C8843B] transition-colors"
                            >
                                Save Customization
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddEvent;
