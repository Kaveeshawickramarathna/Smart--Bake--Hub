import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, MapPin, Package, Check, 
    ArrowLeft, Send, Sparkles, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddEvent = () => {
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        event_type: 'Birthday',
        event_date: '',
        event_session: 'morning',
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
    const eventTypes = ['Birthday', 'Wedding', 'Corporate Event', 'Anniversary', 'Party'];
    const sessions = [
        { id: 'morning', label: 'Morning Session (8 AM - 2 PM)' },
        { id: 'evening', label: 'Evening Session (4 PM - 10 PM)' },
        { id: 'full-day', label: 'Full Day (8 AM - 10 PM)' }
    ];
    const halls = [
        { id: 'Grand Ballroom', capacity: 300, price: 150000 },
        { id: 'Sapphire Hall', capacity: 150, price: 75000 },
        { id: 'Ruby Garden', capacity: 100, price: 50000 }
    ];
    const packages = [
        { id: 'Gold', name: 'Gold Package', pricePerHead: 2500, desc: 'Standard Buffet + Welcome Drink' },
        { id: 'Platinum', name: 'Platinum Package', pricePerHead: 3500, desc: 'Premium Buffet + 2 Drinks + Dessert Bar' },
        { id: 'Diamond', name: 'Diamond Package', pricePerHead: 5000, desc: 'Luxury Buffet + Unlimited Drinks + Special Desserts' }
    ];
    const availableAddOns = [
        { id: 'cake', name: 'Custom Anniversary/Birthday Cake', price: 12000 },
        { id: 'av', name: 'Pro Audio & Stage Visual Suite', price: 25000 },
        { id: 'live', name: 'Live Hopper & Kottu Stations', price: 15000 },
        { id: 'photo', name: 'Official Event Photography', price: 30000 }
    ];

    useEffect(() => {
        setIsAvailable(null);
    }, [formData.event_date, formData.event_session, formData.hall_name]);

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
        const pkg = packages.find(p => p.id === formData.package_name);
        
        let total = (hall ? hall.price : 0) + (pkg ? pkg.pricePerHead * formData.guest_count : 0);
        
        formData.add_ons.forEach(addonId => {
            const addon = availableAddOns.find(a => a.id === addonId);
            if (addon) total += addon.price;
        });

        if (formData.event_session === 'full-day') {
            total += (hall ? hall.price * 0.5 : 0);
        }

        return total;
    };

    const checkAvailability = async () => {
        if (!formData.event_date) {
            toast.error("Please select a date first");
            return;
        }
        
        setCheckingAvailability(true);
        try {
            const { data } = await api.get('/bookings/check-availability', {
                params: {
                    date: formData.event_date,
                    session: formData.event_session,
                    hall: formData.hall_name
                }
            });
            setIsAvailable(data.available);
            if (data.available) {
                toast.success('Hall is available!');
            } else {
                toast.error('Hall is already booked for this session.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to check availability');
        } finally {
            setCheckingAvailability(false);
        }
    };

    const submitBooking = async (e) => {
        e.preventDefault();

        if (isAvailable === false) {
            toast.error("Please select an available date/session/hall before proceeding");
            return;
        }
        if (isAvailable === null) {
            toast.error("Please check availability first");
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
            const payload = { ...formData, total_price };
            
            await api.post('/bookings', payload);
            toast.success('Manual booking created successfully!', { icon: '🎉' });
            navigate('/admin/events');
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
                    onClick={() => navigate('/admin/events')}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
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
                            <label className="text-xs font-bold text-gray-500 uppercase">Time Session</label>
                            <select 
                                name="event_session" 
                                value={formData.event_session} 
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                            >
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
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
                    
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Please check hall availability for the selected date and session.</span>
                        <div className="flex items-center gap-3">
                            {isAvailable === true && (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-lg">Available</span>
                            )}
                            {isAvailable === false && (
                                <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-lg">Booked</span>
                            )}
                            <button 
                                type="button"
                                onClick={checkAvailability}
                                disabled={checkingAvailability}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                            >
                                {checkingAvailability ? 'Checking...' : 'Check Availability'}
                            </button>
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {packages.map(pkg => (
                            <div 
                                key={pkg.id}
                                onClick={() => setFormData({...formData, package_name: pkg.id})}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    formData.package_name === pkg.id 
                                    ? 'border-[#C8843B] bg-[#FDF6ED] shadow-sm' 
                                    : 'border-gray-100 bg-white hover:border-[#C8843B]/30'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[#2E1A12] text-sm">{pkg.name}</h4>
                                    {formData.package_name === pkg.id && (
                                        <div className="w-4 h-4 rounded-full bg-[#C8843B] flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-lg font-black text-[#C8843B] mb-1">
                                    Rs. {pkg.pricePerHead.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {availableAddOns.map(addon => {
                            const isSelected = formData.add_ons.includes(addon.id);
                            return (
                                <div 
                                    key={addon.id}
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
                                    <span className="text-xs font-bold text-[#C8843B]">Rs. {addon.price.toLocaleString()}</span>
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
        </div>
    );
};

export default AddEvent;
