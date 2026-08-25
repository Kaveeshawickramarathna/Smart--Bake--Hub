import React, { useState } from 'react';
import { 
    Search, Filter, Plus, MoreHorizontal, LayoutDashboard,
    QrCode, Link as LinkIcon, Edit, Trash2, Settings, ChevronDown, ChevronRight
} from 'lucide-react';

const TablesManagement = () => {
    const [activeTab, setActiveTab] = useState('configuration');
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const kpis = [
        { label: 'Total Orders', value: '12', type: 'primary' },
        { label: 'Occupied', value: '5', type: 'occupied' },
        { label: 'Reserved', value: '2', type: 'reserved' },
        { label: 'Available', value: '9', type: 'available' },
    ];

    const mockTables = [
        { id: 1, number: '24', name: 'Sliding Dinner', area: 'Outdoor#444', menu: 'Autumn', date: '2025/10/11 14:48', status: 'In Use' },
        { id: 2, number: '24', name: 'Sliding Dinner', area: 'Outdoor#444', menu: 'Autumn', date: '2025/10/11 14:48', status: 'In Use' },
        { id: 3, number: '24', name: 'Sliding Dinner', area: 'Outdoor#444', menu: 'Autumn', date: '2025/10/11 14:48', status: 'Enabled' },
        { id: 4, number: '24', name: 'Sliding Dinner', area: 'Outdoor#444', menu: 'Autumn', date: '2025/10/11 14:48', status: 'In Use' },
        { id: 5, number: '24', name: 'Sliding Dinner', area: 'Outdoor#444', menu: 'Autumn', date: '2025/10/11 14:48', status: 'Enabled' },
        { id: 6, number: '24', name: 'Sliding Dinner', area: 'Outdoor#444', menu: 'Autumn', date: '2025/10/11 14:48', status: 'Enabled' },
    ];

    const getStatusStyle = (status) => {
        if (status === 'In Use') return 'bg-gray-100 text-gray-600';
        if (status === 'Enabled') return 'bg-green-50 text-green-600';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex justify-between items-center">
                    Tables
                    <div className="flex gap-4">
                        <button className="text-gray-400 hover:text-gray-600"><LayoutDashboard className="w-5 h-5" /></button>
                        <button className="text-gray-400 hover:text-gray-600"><Settings className="w-5 h-5" /></button>
                    </div>
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage table configuration and view real-time status.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {kpis.map((kpi, index) => (
                    <div 
                        key={index} 
                        className={`rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center ${
                            kpi.type === 'primary' 
                                ? 'bg-[#C8843B] text-white shadow-lg shadow-[#C8843B]/30' 
                                : 'bg-white border border-[#C8843B]/10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]'
                        }`}
                    >
                        {kpi.type === 'primary' && (
                            <div className="absolute top-4 right-4 opacity-50">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"/><path d="M12 15v7"/><path d="M12 15a6 6 0 0 0 6-6V3H6v6a6 6 0 0 0 6 6z"/></svg>
                            </div>
                        )}
                        <h3 className={`text-sm font-medium mb-4 ${kpi.type === 'primary' ? 'text-white/90' : 'text-gray-900 font-semibold'}`}>
                            {kpi.label}
                        </h3>
                        <div className={`text-3xl font-bold ${
                            kpi.type === 'primary' ? 'text-white' : 
                            kpi.type === 'occupied' ? 'text-[#C8843B]' : 
                            kpi.type === 'reserved' ? 'text-blue-600' : 
                            kpi.type === 'available' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                            {kpi.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                {/* Tabs */}
                <div className="flex bg-[#FDF6ED] p-1 rounded-xl border border-[#C8843B]/20">
                    <button 
                        onClick={() => setActiveTab('realtime')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === 'realtime' ? 'bg-white text-[#C8843B] shadow-sm' : 'text-gray-500 hover:text-[#C8843B]'
                        }`}
                    >
                        Real-time Status
                    </button>
                    <button 
                        onClick={() => setActiveTab('configuration')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === 'configuration' ? 'bg-white text-[#C8843B] shadow-sm' : 'text-gray-500 hover:text-[#C8843B]'
                        }`}
                    >
                        Table Configuration
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-white border border-[#C8843B]/20 rounded-xl text-sm focus:outline-none focus:border-[#C8843B] transition-colors w-40"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded border border-gray-200">⌘K</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="relative">
                        <select className="pl-3 pr-8 py-2 bg-white border border-[#C8843B]/20 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#C8843B] appearance-none cursor-pointer">
                            <option>All Statuses</option>
                            <option>In Use</option>
                            <option>Enabled</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    
                    <div className="relative">
                        <select className="pl-3 pr-8 py-2 bg-white border border-[#C8843B]/20 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#C8843B] appearance-none cursor-pointer">
                            <option>All Areas</option>
                            <option>Outdoor</option>
                            <option>Indoor</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Action Buttons */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-[#C8843B] text-[#C8843B] hover:bg-[#FDF6ED] rounded-xl text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Create New Table
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
                        More <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 text-left">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Table Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Table Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Area No.</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Linked Menu</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {mockTables.map((table) => (
                                <tr key={table.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{table.number}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{table.name}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{table.area}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{table.menu}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{table.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(table.status)}`}>
                                            {table.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <button 
                                            onClick={() => setOpenDropdownId(openDropdownId === table.id ? null : table.id)}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        {openDropdownId === table.id && (
                                            <div className="absolute right-6 top-10 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1">
                                                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2">
                                                    <QrCode className="w-3.5 h-3.5" /> QR Code Management
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-[#C8843B] bg-[#C8843B]/5 hover:bg-[#C8843B]/10 flex items-center gap-2">
                                                    <LinkIcon className="w-3.5 h-3.5" /> Linked Menu
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2">
                                                    <Edit className="w-3.5 h-3.5" /> Edit Menu
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2">
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TablesManagement;
