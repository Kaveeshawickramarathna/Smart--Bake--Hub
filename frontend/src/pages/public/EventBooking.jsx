import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, MapPin, Package, Check, 
    ChevronRight, ArrowLeft, Send, Sparkles, AlertCircle
} from 'lucide-react';

const EventBooking = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookedHalls, setBookedHalls] = useState([]);

    // Form State
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
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: ''
    });

    // Configuration Data
    const eventTypes = ['Birthday', 'Wedding', 'Corporate Event', 'Anniversary', 'Party'];
    const halls = [
        { id: 'Grand Ballroom', capacity: 300, price: 150000 },
        { id: 'Sapphire Hall', capacity: 150, price: 75000 },
        { id: 'Ruby Garden', capacity: 100, price: 50000 }
    ];
    const packages = [
        { 
            id: 'Gold', 
            name: 'Gold Package', 
            pricePerHead: 2500, 
            desc: 'Standard Buffet + Welcome Drink',
            items: ['Welcome Drink (Fruit Juice)', 'Chicken Fried Rice / Noodles', 'Devilled Chicken', 'Fish Ambul Thiyal', 'Dhal Curry', 'Brinjal Moju', 'Watalappam / Ice Cream']
        },
        { 
            id: 'Platinum', 
            name: 'Platinum Package', 
            pricePerHead: 3500, 
            desc: 'Premium Buffet + 2 Drinks + Dessert Bar',
            items: ['Welcome Drinks (Mocktail/Juice)', 'Seafood Fried Rice', 'Spicy Macaroni / Noodles', 'Roast Chicken with Sauce', 'Hot Butter Cuttlefish', 'Cashew & Green Pea Curry', 'Mushroom & Beans', 'Salad Bar', 'Dessert Buffet (Watalappam, Jelly, Fresh Fruits, Cake)']
        },
        { 
            id: 'Diamond', 
            name: 'Diamond Package', 
            pricePerHead: 5000, 
            desc: 'Luxury Buffet + Unlimited Drinks + Special Desserts',
            items: ['Unlimited Welcome Drinks & Soups', 'Biryani / Premium Mixed Rice', 'Spicy Spaghetti / Noodles', 'Mutton Curry / Devilled Beef', 'Grilled Tiger Prawns / BBQ Chicken', 'Whole Baked Fish', 'Special Paneer / Cashew Curry', 'Premium Salad Bar', 'Luxury Dessert Station (Chocolate Fountain, Assorted Cakes, Premium Ice Cream)']
        }
    ];
    const availableAddOns = [
        { id: 'cake', name: 'Custom Anniversary/Birthday Cake', price: 12000 },
        { id: 'av', name: 'Pro Audio & Stage Visual Suite', price: 25000 },
        { id: 'live', name: 'Live Hopper & Kottu Stations', price: 15000 },
        { id: 'photo', name: 'Official Event Photography', price: 30000 }
    ];

    // Remove old useEffect for isAvailable

    // Fetch booked slots when date and hall change
    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (!formData.event_date || !formData.hall_name) {
                setBookedSlots([]);
                return;
            }
            setLoadingSlots(true);
            try {
                const { data } = await api.get('/bookings/booked-slots', {
                    params: { date: formData.event_date, hall: formData.hall_name }
                });
                setBookedSlots(data.bookedSlots || []);
            } catch (error) {
                console.error("Failed to fetch booked slots", error);
                setBookedSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [formData.event_date, formData.hall_name]);

    // Fetch booked halls when date, start_time or end_time change
    useEffect(() => {
        const fetchBookedHalls = async () => {
            if (!formData.event_date || !formData.start_time || !formData.end_time) {
                setBookedHalls([]);
                return;
            }
            try {
                const { data } = await api.get('/bookings/booked-halls', {
                    params: { 
                        date: formData.event_date,
                        start_time: formData.start_time,
                        end_time: formData.end_time
                    }
                });
                setBookedHalls(data.bookedHalls || []);
            } catch (error) {
                console.error("Failed to fetch booked halls", error);
                setBookedHalls([]);
            }
        };

        fetchBookedHalls();
    }, [formData.event_date, formData.start_time, formData.end_time]);

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

    // Calculate Total Price
    const calculateTotal = () => {
        const hall = halls.find(h => h.id === formData.hall_name);
        const pkg = packages.find(p => p.id === formData.package_name);
        
        let total = (hall ? hall.price : 0) + (pkg ? pkg.pricePerHead * formData.guest_count : 0);
        
        formData.add_ons.forEach(addonId => {
            const addon = availableAddOns.find(a => a.id === addonId);
            if (addon) total += addon.price;
        });

        return total;
    };

    // Removed checkAvailability function

    const nextStep = () => {
        if (step === 1) {
            if (!formData.event_date) {
                toast.error("Please select an event date");
                return;
            }
            if (!formData.start_time || !formData.end_time) {
                toast.error("Please select both start and end times");
                return;
            }
            if (bookedHalls.includes(formData.hall_name)) {
                toast.error("The selected hall is booked for the chosen time. Please select another time or hall.");
                return;
            }
        }
        if (step === 2) {
            const hall = halls.find(h => h.id === formData.hall_name);
            if (formData.guest_count > hall.capacity) {
                toast.error(`Guest count cannot exceed the hall capacity (${hall.capacity} pax)`);
                return;
            }
        }
        setStep(step + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo(0, 0);
    };

    const submitBooking = async () => {
        if (!user) {
            toast.error('Please login to submit a booking.');
            navigate('/login');
            return;
        }

        if (!formData.customer_phone) {
            toast.error('Please provide a contact number.');
            return;
        }

        setLoading(true);
        try {
            const total_price = calculateTotal();
            const payload = { ...formData, total_price };
            
            await api.post('/bookings', payload);
            toast.success('Event booking request submitted successfully!', { icon: '🎉' });
            
            // Navigate to home or profile after success
            setTimeout(() => {
                navigate('/');
            }, 2000);
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F4ED] font-sans selection:bg-[#C8843B] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />
                
                <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
                    <ScrollReveal variant="fade-up" duration={800}>
                        <div className="text-center mb-12">
                            <span className="text-[#C8843B] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Premium Venues</span>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#2E1A12] font-serif leading-tight">
                                Making Every Occasion Extraordinary
                            </h1>
                            <p className="text-sm text-gray-500 mt-4 max-w-xl mx-auto">
                                From intimate gatherings to grand celebrations, select your perfect space and let us handle the culinary excellence.
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-12 max-w-2xl mx-auto">
                        <div className="flex items-center w-full">
                            <div className={`flex flex-col items-center relative z-10 transition-colors duration-500 ${step >= 1 ? 'text-[#C8843B]' : 'text-gray-300'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 transition-all duration-500 ${step >= 1 ? 'bg-[#FDF6ED] border-[#C8843B] text-[#C8843B]' : 'bg-white border-gray-200'}`}>
                                    1
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Details</span>
                            </div>
                            <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${step >= 2 ? 'bg-[#C8843B]' : 'bg-gray-200'}`}></div>
                            <div className={`flex flex-col items-center relative z-10 transition-colors duration-500 ${step >= 2 ? 'text-[#C8843B]' : 'text-gray-300'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 transition-all duration-500 ${step >= 2 ? 'bg-[#FDF6ED] border-[#C8843B] text-[#C8843B]' : 'bg-white border-gray-200'}`}>
                                    2
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Packages</span>
                            </div>
                            <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${step >= 3 ? 'bg-[#C8843B]' : 'bg-gray-200'}`}></div>
                            <div className={`flex flex-col items-center relative z-10 transition-colors duration-500 ${step >= 3 ? 'text-[#C8843B]' : 'text-gray-300'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 transition-all duration-500 ${step >= 3 ? 'bg-[#FDF6ED] border-[#C8843B] text-[#C8843B]' : 'bg-white border-gray-200'}`}>
                                    3
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Confirm</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-[#C8843B]/10 shadow-[0_20px_40px_rgba(46,26,18,0.03)] p-8 md:p-12">
                        
                        {/* STEP 1: EVENT DETAILS & AVAILABILITY */}
                        {step === 1 && (
                            <ScrollReveal variant="fade-up" duration={500}>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#C8843B]">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xl font-bold font-serif">Event Schedule & Venue</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Type</label>
                                            <select 
                                                name="event_type" 
                                                value={formData.event_type} 
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                            >
                                                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Date</label>
                                            <input 
                                                type="date" 
                                                name="event_date" 
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.event_date} 
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Time</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="time" 
                                                    name="start_time" 
                                                    min="09:00"
                                                    max="21:00"
                                                    value={formData.start_time} 
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                                />
                                                <span className="text-gray-400 font-bold">to</span>
                                                <input 
                                                    type="time" 
                                                    name="end_time" 
                                                    min="10:00"
                                                    max="22:00"
                                                    value={formData.end_time} 
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Venue / Hall</label>
                                            <select 
                                                name="hall_name" 
                                                value={formData.hall_name} 
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                            >
                                                {halls.map(h => {
                                                    const isBooked = bookedHalls.includes(h.id);
                                                    return (
                                                        <option key={h.id} value={h.id} disabled={isBooked}>
                                                            {h.id} (Max {h.capacity} Pax) {formData.event_date ? (isBooked ? ' - ❌ Booked' : ' - ✅ Available') : ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Booked Slots Display */}
                                    {formData.event_date && formData.hall_name && (
                                        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 sm:p-6 mb-4">
                                            <h4 className="text-sm font-bold text-[#2E1A12] mb-2">Booked Times for this date</h4>
                                            {loadingSlots ? (
                                                <p className="text-xs text-gray-500">Loading booked times...</p>
                                            ) : bookedSlots.length > 0 ? (
                                                <ul className="text-xs text-orange-800 space-y-1.5">
                                                    {bookedSlots.map((slot, idx) => (
                                                        <li key={idx} className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                            <span className="font-semibold">{slot.start_time} - {slot.end_time}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-green-600 font-bold">🎉 All hours are available for this date!</p>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </ScrollReveal>
                        )}

                        {/* STEP 2: PACKAGES & GUESTS */}
                        {step === 2 && (
                            <ScrollReveal variant="fade-up" duration={500}>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#C8843B]">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xl font-bold font-serif">Packages & Add-ons</h3>
                                    </div>

                                    <div className="space-y-2 max-w-sm">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Estimated Guest Count
                                        </label>
                                        <input 
                                            type="number" 
                                            name="guest_count" 
                                            min="10"
                                            max={halls.find(h => h.id === formData.hall_name)?.capacity}
                                            value={formData.guest_count} 
                                            onChange={handleInputChange}
                                            className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                        />
                                        <p className="text-[10px] text-gray-400 font-semibold">
                                            Max capacity for {formData.hall_name} is {halls.find(h => h.id === formData.hall_name)?.capacity} pax.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Catering Package</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {packages.map(pkg => (
                                                <div 
                                                    key={pkg.id}
                                                    onClick={() => setFormData({...formData, package_name: pkg.id})}
                                                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                                        formData.package_name === pkg.id 
                                                        ? 'border-[#C8843B] bg-[#FDF6ED] shadow-sm' 
                                                        : 'border-gray-100 bg-white hover:border-[#C8843B]/30'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-[#2E1A12] text-sm">{pkg.name}</h4>
                                                        {formData.package_name === pkg.id && (
                                                            <div className="w-5 h-5 rounded-full bg-[#C8843B] flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xl font-black text-[#C8843B] mb-2">
                                                        Rs. {pkg.pricePerHead.toLocaleString()} <span className="text-[10px] text-gray-400 font-semibold uppercase">/ Head</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{pkg.desc}</p>
                                                    <div className="mt-3 pt-3 border-t border-gray-100 text-left">
                                                        <ul className="text-[10.5px] text-gray-600 space-y-1.5 list-disc pl-3">
                                                            {pkg.items.map((item, idx) => (
                                                                <li key={idx} className="leading-tight">{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Premium Add-Ons (Optional)</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {availableAddOns.map(addon => {
                                                const isSelected = formData.add_ons.includes(addon.id);
                                                return (
                                                    <div 
                                                        key={addon.id}
                                                        onClick={() => handleAddOnToggle(addon.id)}
                                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                                            isSelected 
                                                            ? 'border-[#C8843B] bg-white shadow-sm' 
                                                            : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#C8843B]/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                                                isSelected ? 'bg-[#C8843B] border-[#C8843B]' : 'bg-white border-gray-300'
                                                            }`}>
                                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <span className="text-sm font-semibold text-[#2E1A12]">{addon.name}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-[#C8843B]">Rs. {addon.price.toLocaleString()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </ScrollReveal>
                        )}

                        {/* STEP 3: CONTACT & CONFIRMATION */}
                        {step === 3 && (
                            <ScrollReveal variant="fade-up" duration={500}>
                                <div className="space-y-8">
                                    
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Contact Form */}
                                        <div className="w-full lg:w-1/2 space-y-6">
                                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#C8843B]">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <h3 className="text-xl font-bold font-serif">Contact Information</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                                    <input 
                                                        type="text" 
                                                        name="customer_name" 
                                                        value={formData.customer_name} 
                                                        onChange={handleInputChange}
                                                        className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                                    <input 
                                                        type="email" 
                                                        name="customer_email" 
                                                        value={formData.customer_email} 
                                                        onChange={handleInputChange}
                                                        className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number *</label>
                                                    <input 
                                                        type="tel" 
                                                        name="customer_phone" 
                                                        required
                                                        placeholder="e.g. 0712345678"
                                                        value={formData.customer_phone} 
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors shadow-inner"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Special Requests / Notes</label>
                                                    <textarea 
                                                        name="special_notes" 
                                                        rows="3"
                                                        placeholder="Any dietary requirements or specific setups?"
                                                        value={formData.special_notes} 
                                                        onChange={handleInputChange}
                                                        className="w-full bg-[#F7F4ED]/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#C8843B] transition-colors resize-none"
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="w-full lg:w-1/2">
                                            <div className="bg-[#2E1A12] text-white rounded-3xl p-8 shadow-xl">
                                                <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-3">
                                                    Booking Summary
                                                </h3>
                                                
                                                <div className="space-y-4 text-sm font-medium">
                                                    <div className="flex justify-between items-start pb-4 border-b border-white/10">
                                                        <span className="text-gray-400">Venue & Date</span>
                                                        <div className="text-right">
                                                            <div className="font-bold text-white">{formData.hall_name}</div>
                                                            <div className="text-xs text-gray-400 mt-1">{formData.event_date} ({formData.start_time} - {formData.end_time})</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-start pb-4 border-b border-white/10">
                                                        <span className="text-gray-400">Package & Guests</span>
                                                        <div className="text-right">
                                                            <div className="font-bold text-white">{formData.package_name} Package</div>
                                                            <div className="text-xs text-gray-400 mt-1">{formData.guest_count} Guests</div>
                                                        </div>
                                                    </div>

                                                    {formData.add_ons.length > 0 && (
                                                        <div className="flex justify-between items-start pb-4 border-b border-white/10">
                                                            <span className="text-gray-400">Add-ons</span>
                                                            <div className="text-right">
                                                                <div className="font-bold text-white">{formData.add_ons.length} selected</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-dashed border-[#C8843B]/50 flex items-end justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Estimated Cost</span>
                                                    </div>
                                                    <span className="text-3xl font-black text-[#C8843B] font-serif tracking-tight">
                                                        Rs. {calculateTotal().toLocaleString()}
                                                    </span>
                                                </div>
                                                
                                                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-[#C8843B] shrink-0" />
                                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                                        This is an estimated cost. Final invoice may vary based on exact requirements discussed after booking confirmation. 10% advance required upon approval.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </ScrollReveal>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                            {step > 1 ? (
                                <button 
                                    onClick={prevStep}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#2E1A12] transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <button 
                                    onClick={nextStep}
                                    className="flex items-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    Proceed <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={submitBooking}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[#C8843B] hover:bg-[#b07130] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Submitting...' : 'Submit Booking Request'} <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default EventBooking;
