import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, Clock, XCircle, Search, Eye, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [prepModalOpen, setPrepModalOpen] = useState(false);
    const [prepOrder, setPrepOrder] = useState(null);
    const [prepTimeHours, setPrepTimeHours] = useState(0);
    const [prepTimeMinutes, setPrepTimeMinutes] = useState(30);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (newStatus === 'accepted' || newStatus === 'preparing') {
            setPrepOrder({ orderId, newStatus });
            setPrepTimeHours(0);
            setPrepTimeMinutes(30);
            setPrepModalOpen(true);
            return;
        }
        submitStatusUpdate(orderId, newStatus, null);
    };

    const submitStatusUpdate = async (orderId, newStatus, prepTime) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus, prep_time: prepTime });
            toast.success(`Order #${orderId} marked as ${newStatus}`);
            fetchOrders();
            setPrepModalOpen(false);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ready': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'All' || order.status === filter.toLowerCase();
        const matchesSearch = 
            order.id.toString().includes(searchQuery) || 
            (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-[#C8843B]" /> Order Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search Order ID or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-[#C8843B]/20 rounded-xl text-sm focus:outline-none focus:border-[#C8843B] transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-[#C8843B]/20 rounded-xl text-sm focus:outline-none focus:border-[#C8843B] appearance-none"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8843B]"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-[#C8843B]/10 p-12 text-center shadow-sm">
                    <ShoppingCart className="w-12 h-12 text-[#C8843B]/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#2E1A12]">No Orders Found</h3>
                    <p className="text-gray-500 text-sm mt-1">There are no orders matching your current filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[24px] border border-[#C8843B]/10 overflow-hidden shadow-[0_4px_20px_rgba(46,26,18,0.02)]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#FDF6ED] border-b border-[#C8843B]/10 text-left">
                                    <th className="px-6 py-4 text-xs font-bold text-[#2E1A12] uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#2E1A12] uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#2E1A12] uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#2E1A12] uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#2E1A12] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#2E1A12] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C8843B]/5">
                                {filteredOrders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr className="hover:bg-[#FDF6ED]/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-[#2E1A12]">#{order.id}</span>
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    {new Date(order.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-[#2E1A12]">{order.customer_name}</div>
                                                <div className="text-xs text-gray-500">{order.customer_email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-semibold capitalize text-[#2E1A12] bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 w-max">
                                                    {order.order_type}
                                                    {order.table_number && <span className="text-[#C8843B]"> (Table {order.table_number})</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-[#C8843B]">
                                                    Rs. {parseFloat(order.total_amount).toLocaleString()}
                                                </span>
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    {order.items?.length || 0} items
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2 items-center">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className="bg-white border border-[#C8843B]/20 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-[#C8843B]"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button 
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    className="p-1.5 text-gray-500 hover:text-[#C8843B] bg-gray-100 hover:bg-[#FDF6ED] rounded-lg transition-colors border border-transparent hover:border-[#C8843B]/20"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrder === order.id && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan="6" className="px-6 py-4">
                                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                                                        <ul className="space-y-2">
                                                            {order.items?.map((item, idx) => (
                                                                <li key={idx} className="flex justify-between items-center text-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="w-6 h-6 rounded bg-[#C8843B]/10 text-[#C8843B] flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                                                                        <span className="font-semibold text-[#2E1A12]">{item.item_name || item.product_name || item.menu_name || item.beverage_name || 'Unknown Item'}</span>
                                                                    </div>
                                                                    <div className="text-gray-500 font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {order.special_note && (
                                                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                <span className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">Special Note:</span>
                                                                <span className="text-sm font-semibold text-[#2E1A12]">{order.special_note}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {prepModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-[#C8843B]/20">
                        <h3 className="text-xl font-bold text-[#2E1A12] mb-2 font-serif">Estimated Ready Time</h3>
                        <p className="text-sm text-gray-500 mb-6">Enter how long it will take to prepare this order.</p>
                        
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hours</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="24"
                                    value={prepTimeHours} 
                                    onChange={(e) => setPrepTimeHours(e.target.value)}
                                    className="w-full bg-[#FDF6ED] border border-[#C8843B]/30 rounded-xl px-4 py-3 text-[#2E1A12] font-semibold focus:outline-none focus:border-[#C8843B]"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Minutes</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="59"
                                    value={prepTimeMinutes} 
                                    onChange={(e) => setPrepTimeMinutes(e.target.value)}
                                    className="w-full bg-[#FDF6ED] border border-[#C8843B]/30 rounded-xl px-4 py-3 text-[#2E1A12] font-semibold focus:outline-none focus:border-[#C8843B]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPrepModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    const totalMinutes = (parseInt(prepTimeHours) || 0) * 60 + (parseInt(prepTimeMinutes) || 0);
                                    if (totalMinutes <= 0) {
                                        toast.error("Please enter a valid time.");
                                        return;
                                    }
                                    submitStatusUpdate(prepOrder.orderId, prepOrder.newStatus, totalMinutes);
                                }}
                                className="flex-1 px-4 py-3 bg-[#C8843B] text-white rounded-xl font-bold hover:bg-[#b0702c] transition-colors shadow-sm text-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
