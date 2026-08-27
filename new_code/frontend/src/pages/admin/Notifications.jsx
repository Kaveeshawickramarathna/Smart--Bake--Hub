import React, { useState } from 'react';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';

const Notifications = () => {
    // For now, we will use an empty state or a few dummy notifications.
    // In the future, this can be connected to the backend.
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Welcome to Smart Bake Hub Admin', message: 'Your admin account has been set up successfully.', time: '2 hours ago', read: false },
        { id: 2, title: 'System Update', message: 'The AI Insights module has been updated with new forecasting models.', time: '1 day ago', read: true }
    ]);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E1A12] font-serif">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage your system notifications</p>
                </div>
                
                {notifications.length > 0 && (
                    <div className="flex gap-3">
                        <button 
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Mark all read
                        </button>
                        <button 
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors text-red-600"
                        >
                            <Trash2 className="w-4 h-4" /> Clear all
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#C8843B]/20 overflow-hidden">
                {notifications.length === 0 ? (
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
                                className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-[#F7F4ED]/50' : 'bg-white'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${!notification.read ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm mb-1 ${!notification.read ? 'font-bold text-[#2E1A12]' : 'font-medium text-gray-700'}`}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                        {notification.time}
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
