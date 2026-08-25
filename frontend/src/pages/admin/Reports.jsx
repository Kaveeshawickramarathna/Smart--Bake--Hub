import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Box, Calendar, Trash2 } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const reportRef = useRef();

    useEffect(() => {
        fetchReportData(activeTab);
    }, [activeTab]);

    const fetchReportData = async (tab) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/reports/${tab}`);
            setReportData(response.data);
        } catch (error) {
            console.error(`Error fetching ${tab} report:`, error);
            toast.error(`Failed to load ${tab} report.`);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!reportRef.current) return;
        
        try {
            toast.loading('Generating PDF...', { id: 'pdf-toast' });
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SmartBakeHub_${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}_Report.pdf`);
            
            toast.success('PDF Downloaded!', { id: 'pdf-toast' });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF', { id: 'pdf-toast' });
        }
    };

    const COLORS = ['#C8843B', '#2E1A12', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

    const renderSalesTab = () => {
        if (!reportData) return null;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
                            <h3 className="text-3xl font-black text-[#2E1A12] mt-1">Rs. {Number(reportData.summary.totalRevenue).toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-[#C8843B]" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Orders</p>
                            <h3 className="text-3xl font-black text-[#2E1A12] mt-1">{reportData.summary.totalOrders}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-[#C8843B]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-wider">Revenue Trend (Last 7 Days)</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={reportData.dailySales}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C8843B" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#C8843B" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                                    <YAxis tick={{fontSize: 10}} />
                                    <RechartsTooltip />
                                    <Area type="monotone" dataKey="amount" stroke="#C8843B" fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-wider">Top 5 Selling Items</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.topItems} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="item_name" type="category" tick={{fontSize: 10}} />
                                    <RechartsTooltip />
                                    <Bar dataKey="total_sold" fill="#2E1A12" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPaymentsTab = () => {
        if (!reportData) return null;
        const data = [
            { name: 'Collected', value: Number(reportData.summary.totalCollected) },
            { name: 'Pending', value: Number(reportData.summary.totalPending) }
        ];

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Collected Revenue</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">Rs. {Number(reportData.summary.totalCollected).toLocaleString()}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Pending Payments</p>
                        <h3 className="text-3xl font-black text-amber-500 mt-1">Rs. {Number(reportData.summary.totalPending).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full lg:w-1/2 mx-auto">
                    <h4 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-wider text-center">Payment Status Distribution</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#10B981" />
                                    <Cell fill="#F59E0B" />
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderInventoryTab = () => {
        if (!reportData) return null;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Total Items in System</p>
                        <h3 className="text-3xl font-black text-[#2E1A12] mt-1">{reportData.summary.totalItems}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Low Stock Alerts</p>
                        <h3 className="text-3xl font-black text-red-500 mt-1">{reportData.summary.lowStockCount}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Est. Inventory Value</p>
                        <h3 className="text-3xl font-black text-[#C8843B] mt-1">Rs. {Number(reportData.summary.estimatedValue).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-wider">Inventory by Category</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={reportData.categories} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="count" nameKey="category">
                                        {reportData.categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-auto">
                        <h4 className="font-bold text-red-600 mb-6 uppercase text-sm tracking-wider flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Low Stock Items
                        </h4>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Item Name</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2">Current Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.lowStockItems.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-4 text-gray-400">No low stock items</td></tr>
                                ) : (
                                    reportData.lowStockItems.map((item, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="px-4 py-2 font-medium text-gray-900">{item.item_name}</td>
                                            <td className="px-4 py-2 capitalize">{item.category.replace('_', ' ')}</td>
                                            <td className="px-4 py-2 font-bold text-red-500">{item.stock_quantity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderBookingsTab = () => {
        if (!reportData) return null;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Total Bookings</p>
                        <h3 className="text-3xl font-black text-[#2E1A12] mt-1">{reportData.summary.totalBookings}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Approved Bookings</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">{reportData.summary.approvedBookings}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-auto">
                    <h4 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Upcoming Bookings
                    </h4>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Event Type</th>
                                <th className="px-4 py-3">Guests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.upcoming.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-6 text-gray-400">No upcoming bookings found.</td></tr>
                            ) : (
                                reportData.upcoming.map((b, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-4 py-3 font-medium">{new Date(b.event_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 capitalize">{b.event_type}</td>
                                        <td className="px-4 py-3 font-bold">{b.number_of_guests}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderWasteTab = () => {
        if (!reportData) return null;
        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 text-center">
                    <h2 className="text-lg font-black text-gray-800">AI-Powered Food Waste Analysis</h2>
                    <p className="text-sm text-gray-500 mt-2">Identifying items nearing expiry to suggest smart discounts before they become waste.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">High Risk (≤ 2 Days to Expiry)</p>
                        <h3 className="text-4xl font-black text-red-700 mt-2">{reportData.summary.highRiskCount} <span className="text-lg font-medium text-red-500">items</span></h3>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Medium Risk (≤ 5 Days to Expiry)</p>
                        <h3 className="text-4xl font-black text-amber-700 mt-2">{reportData.summary.mediumRiskCount} <span className="text-lg font-medium text-amber-500">items</span></h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-auto">
                        <h4 className="font-bold text-red-600 mb-6 uppercase text-sm tracking-wider">High Risk Items</h4>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Days Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.highRisk.map((item, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-4 py-2 font-medium">{item.item_name}</td>
                                        <td className="px-4 py-2">{item.stock_quantity}</td>
                                        <td className="px-4 py-2 font-bold text-red-600">{item.daysLeft} days</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-auto">
                        <h4 className="font-bold text-amber-600 mb-6 uppercase text-sm tracking-wider">Medium Risk Items</h4>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Days Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.mediumRisk.map((item, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-4 py-2 font-medium">{item.item_name}</td>
                                        <td className="px-4 py-2">{item.stock_quantity}</td>
                                        <td className="px-4 py-2 font-bold text-amber-600">{item.daysLeft} days</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#C8843B]" />
                        Business Reports
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        View and download AI-driven insights and operational reports.
                    </p>
                </div>
                
                <button 
                    onClick={downloadPDF}
                    className="bg-[#2E1A12] hover:bg-[#C8843B] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {[
                    { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
                    { id: 'payments', label: 'Payments', icon: DollarSign },
                    { id: 'inventory', label: 'Inventory', icon: Box },
                    { id: 'bookings', label: 'Event Bookings', icon: Calendar },
                    { id: 'waste', label: 'Food Waste (AI)', icon: Trash2 },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-[#C8843B] text-white shadow-md' 
                                : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Report Content Container (for PDF generation) */}
            <div className="mt-6" ref={reportRef}>
                <div className="p-4 bg-white rounded-t-2xl border-b border-gray-100 flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-[#2E1A12] uppercase tracking-wider">
                        {activeTab} Report <span className="text-gray-400 font-medium text-sm capitalize">/ Smart Bake Hub</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400">{new Date().toLocaleString()}</p>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#C8843B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'sales' && renderSalesTab()}
                        {activeTab === 'payments' && renderPaymentsTab()}
                        {activeTab === 'inventory' && renderInventoryTab()}
                        {activeTab === 'bookings' && renderBookingsTab()}
                        {activeTab === 'waste' && renderWasteTab()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
