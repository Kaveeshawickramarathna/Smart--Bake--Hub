import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, Award, Clock, Check, X, Trash2, ChevronDown, ChevronUp, Mail, Phone, Info, Sparkles } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Events = ({ onNavigateToAdd }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const ledgerRef = useRef(null);

    const handleCardClick = (status) => {
        setFilterStatus(status);
        if (ledgerRef.current) {
            ledgerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/bookings/admin');
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            toast.error('Could not load event bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            toast.success(`Booking ${status} successfully`);
            
            // Local state update
            setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update booking status');
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking permanently?')) return;

        try {
            await api.delete(`/bookings/${id}`);
            toast.success('Booking deleted successfully');
            setBookings(bookings.filter(b => b.id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete booking');
        }
    };

    const toggleRow = (id) => {
        setExpandedBookingId(expandedBookingId === id ? null : id);
    };

    // Calculate Summary Stats
    const totalBookings = bookings.length;
    const pendingInquiries = bookings.filter(b => b.status === 'pending').length;
    const approvedBookings = bookings.filter(b => b.status === 'approved').length;
    
    // Revenue calculations (only counting approved events as realized/expected revenue)
    const totalRevenue = bookings
        .filter(b => b.status === 'approved')
        .reduce((sum, b) => sum + Number(b.total_price), 0);

    // Filter bookings based on status select
    const filteredBookings = bookings.filter(b => {
        if (filterStatus === 'all') return true;
        return b.status === filterStatus;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    // Human-friendly date formatter
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    return (
        <div className="space-y-8 pb-12">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#2E1A12] font-serif">Event Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage event hall rentals, catering inquiries, and slot allocations.</p>
                </div>
                <button 
                    onClick={() => {
                        if (onNavigateToAdd) onNavigateToAdd();
                        else navigate('/admin/events/add');
                    }}
                    className="flex items-center justify-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                    + Create Booking
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Bookings */}
                <div 
                    onClick={() => handleCardClick('all')}
                    className="bg-white rounded-3xl p-6 border border-[#C8843B]/10 shadow-[0_8px_20px_rgba(46,26,18,0.02)] flex items-center justify-between cursor-pointer hover:shadow-md hover:ring-2 hover:ring-[#C8843B]/20 transition-all"
                >
                    <div className="space-y-2">
                        <span className="text-gray-400 text-xs font-semibold uppercase">Total Applications</span>
                        <h3 className="text-3xl font-extrabold text-[#2E1A12] font-serif">{totalBookings}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] shadow-inner">
                        <Calendar className="w-6 h-6 stroke-[1.5]" />
                    </div>
                </div>

                {/* Pending Inquiries */}
                <div 
                    onClick={() => handleCardClick('pending')}
                    className="bg-white rounded-3xl p-6 border border-[#C8843B]/10 shadow-[0_8px_20px_rgba(46,26,18,0.02)] flex items-center justify-between cursor-pointer hover:shadow-md hover:ring-2 hover:ring-[#C8843B]/20 transition-all"
                >
                    <div className="space-y-2">
                        <span className="text-gray-400 text-xs font-semibold uppercase">Pending Reviews</span>
                        <h3 className="text-3xl font-extrabold text-[#2E1A12] font-serif">{pendingInquiries}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                        <Clock className="w-6 h-6 stroke-[1.5]" />
                    </div>
                </div>

                {/* Approved Bookings */}
                <div 
                    onClick={() => handleCardClick('approved')}
                    className="bg-white rounded-3xl p-6 border border-[#C8843B]/10 shadow-[0_8px_20px_rgba(46,26,18,0.02)] flex items-center justify-between cursor-pointer hover:shadow-md hover:ring-2 hover:ring-[#C8843B]/20 transition-all"
                >
                    <div className="space-y-2">
                        <span className="text-gray-400 text-xs font-semibold uppercase">Confirmed Events</span>
                        <h3 className="text-3xl font-extrabold text-[#2E1A12] font-serif">{approvedBookings}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
                        <Award className="w-6 h-6 stroke-[1.5]" />
                    </div>
                </div>

                {/* Expected Revenue */}
                <div className="bg-white rounded-3xl p-6 border border-[#C8843B]/10 shadow-[0_8px_20px_rgba(46,26,18,0.02)] flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-gray-400 text-xs font-semibold uppercase">Expected Revenue</span>
                        <h3 className="text-2xl font-extrabold text-green-600 font-serif">Rs. {totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
                        <DollarSign className="w-6 h-6 stroke-[1.5]" />
                    </div>
                </div>
            </div>

            {/* List and Actions */}
            <div ref={ledgerRef} className="bg-white rounded-[32px] border border-[#C8843B]/10 shadow-sm overflow-hidden scroll-mt-24">
                
                {/* Filters Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="font-bold text-lg text-[#2E1A12] font-serif">Bookings Ledger</h3>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium font-sans">Filter by Status:</span>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-[#e6dfd5] bg-white rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:border-[#C8843B]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C8843B] border-t-transparent"></div>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="py-4.5 px-6">Event Details</th>
                                    <th className="py-4.5 px-6">Client Info</th>
                                    <th className="py-4.5 px-6">Hall & Package</th>
                                    <th className="py-4.5 px-6">Guests</th>
                                    <th className="py-4.5 px-6">Cost</th>
                                    <th className="py-4.5 px-6 text-center">Status</th>
                                    <th className="py-4.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => {
                                    const isExpanded = expandedBookingId === booking.id;
                                    return (
                                        <React.Fragment key={booking.id}>
                                            <tr className={`border-b border-gray-50 hover:bg-gray-50/30 transition-colors font-sans text-xs ${isExpanded ? 'bg-gray-50/20' : ''}`}>
                                                
                                                {/* Event Details */}
                                                <td className="py-4.5 px-6 font-medium">
                                                    <div className="font-bold text-[#2E1A12]">{formatDate(booking.event_date)}</div>
                                                    <div className="text-[10px] text-gray-400 capitalize mt-0.5">{booking.event_session} session</div>
                                                    <div className="text-[10px] text-[#C8843B] font-semibold mt-1">Ref: #EV-{booking.id}</div>
                                                </td>

                                                {/* Client Info */}
                                                <td className="py-4.5 px-6">
                                                    <div className="font-semibold text-gray-800">{booking.customer_name}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">{booking.customer_email}</div>
                                                    <div className="text-[10px] text-gray-400">{booking.customer_phone}</div>
                                                </td>

                                                {/* Hall & Package */}
                                                <td className="py-4.5 px-6">
                                                    <div className="font-semibold text-gray-800">{booking.hall_name}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">Package: <span className="font-semibold text-gray-600">{booking.package_name}</span></div>
                                                    <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                                        Type: {booking.event_type}
                                                        {booking.add_ons && booking.add_ons.includes('cake') && (
                                                            <span className="bg-[#C8843B] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">CAKE</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Guests */}
                                                <td className="py-4.5 px-6 font-semibold text-gray-800">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                                        {booking.guest_count}
                                                    </div>
                                                </td>

                                                {/* Cost */}
                                                <td className="py-4.5 px-6 font-bold text-gray-800">
                                                    Rs. {Number(booking.total_price).toLocaleString()}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4.5 px-6 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusClass(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4.5 px-6 text-right space-x-1.5 shrink-0">
                                                    <button 
                                                        onClick={() => toggleRow(booking.id)}
                                                        className="p-1.5 rounded-lg border border-gray-150 hover:bg-white text-gray-500 cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                    {booking.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(booking.id, 'approved')}
                                                            className="p-1.5 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 text-green-600 cursor-pointer"
                                                            title="Approve Booking"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-500 cursor-pointer"
                                                            title="Cancel Booking"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-red-500 cursor-pointer"
                                                        title="Delete Inquiry"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expandable details row */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50/10 font-sans border-b border-gray-100">
                                                    <td colSpan="7" className="p-6">
                                                        <div className="bg-white rounded-2xl p-6 border border-[#e6dfd5]/60 shadow-inner flex flex-col md:flex-row gap-8">
                                                            
                                                            {/* Add-ons Detail */}
                                                            <div className="flex-1 space-y-3">
                                                                <h4 className="text-xs font-bold text-[#C8843B] uppercase tracking-wider flex items-center gap-1.5">
                                                                    <Award className="w-4 h-4" />
                                                                    Add-Ons Details
                                                                </h4>
                                                                {booking.add_ons && booking.add_ons.length > 0 ? (
                                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 font-medium">
                                                                        {booking.add_ons.map(addonId => {
                                                                            // Mapping addon id to nice name
                                                                            const addonNames = {
                                                                                cake: "Custom Master-Chef Anniversary Cake",
                                                                                av: "Pro Audio & Stage Visual Suite",
                                                                                live: "Live Hopper & Kottu Stations",
                                                                                photo: "Official Event Photography"
                                                                            };
                                                                            return (
                                                                                <li key={addonId} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                                                                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                                                                    {addonNames[addonId] || addonId}
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-[11px] text-gray-400 italic">No additional event features selected.</p>
                                                                )}
                                                            </div>

                                                            {/* Special Requirements */}
                                                            <div className="flex-1 space-y-3">
                                                                <h4 className="text-xs font-bold text-[#C8843B] uppercase tracking-wider flex items-center gap-1.5">
                                                                    <Info className="w-4 h-4" />
                                                                    Special Requirements
                                                                </h4>
                                                                {booking.special_notes ? (
                                                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                                                                        {booking.special_notes.split('--- Cake Details ---')[0].trim() || 'No general special requirements.'}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[11px] text-gray-400 italic">No special requirements mentioned.</p>
                                                                )}
                                                            </div>

                                                            {/* Cake Order Box */}
                                                            {booking.special_notes && booking.special_notes.includes('--- Cake Details ---') && (
                                                                <div className="flex-1 space-y-3">
                                                                    <h4 className="text-xs font-bold text-[#C8843B] uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Sparkles className="w-4 h-4" />
                                                                        Cake Details
                                                                    </h4>
                                                                    <div className="p-4 rounded-xl bg-amber-50 border border-[#C8843B]/20 text-[11px] text-[#2E1A12] leading-relaxed font-bold whitespace-pre-line shadow-inner">
                                                                        {booking.special_notes.split('--- Cake Details ---')[1].trim()}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Client Direct Communication */}
                                                            <div className="w-full md:w-[240px] space-y-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col">
                                                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Client</h4>
                                                                <div className="flex flex-col gap-2 mt-1">
                                                                    <a 
                                                                        href={`mailto:${booking.customer_email}`} 
                                                                        className="flex items-center gap-2 text-xs font-semibold text-[#C8843B] hover:text-[#2E1A12] transition-colors"
                                                                    >
                                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                                        Send Email
                                                                    </a>
                                                                    <a 
                                                                        href={`tel:${booking.customer_phone}`} 
                                                                        className="flex items-center gap-2 text-xs font-semibold text-[#C8843B] hover:text-[#2E1A12] transition-colors"
                                                                    >
                                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                                        Call Client
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center font-sans">
                        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                        <h4 className="font-bold text-sm text-[#2E1A12]">No Bookings Found</h4>
                        <p className="text-xs text-gray-400 max-w-[280px] mt-1">There are no event bookings corresponding to the selected filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
