import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        
        switch (notification.type) {
            case 'order':
                navigate('/admin/orders');
                break;
            case 'booking':
                navigate('/admin/events');
                break;
            case 'inventory':
            case 'stock':
                navigate('/admin/inventory');
                break;
            case 'user':
                navigate('/admin/users');
                break;
            default:
                // If it's a general notification or unknown type, maybe just stay here or go to dashboard
                // navigate('/admin/dashboard');
                break;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage your system notifications</p>
                </div>
                
                {notifications.some(n => !n.is_read) && (
                    <div className="flex gap-3">
                        <button 
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Mark all read
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C8843B]/20 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-500 font-medium">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-16 h-16 bg-[#F7F4ED] rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-[#2E1A12] mb-1">No notifications yet</h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            When you receive alerts, system updates, or new orders, they will show up here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-5 flex gap-4 transition-all group ${!notification.is_read ? 'bg-[#F7F4ED]/50 cursor-pointer hover:bg-[#F7F4ED]' : 'bg-white cursor-pointer hover:bg-gray-50'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${!notification.is_read ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm mb-1 ${!notification.is_read ? 'font-bold text-[#2E1A12]' : 'font-medium text-gray-700'}`}>
                                            {notification.title}
                                        </h4>
                                        <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
