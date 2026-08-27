import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Info, Search, Bell, MoreHorizontal, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

const DashboardTable = ({ title, data = [], columns }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                
                // Try to parse as numbers if possible for correct numeric sorting
                if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
                    aVal = Number(aVal);
                    bVal = Number(bVal);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
    const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAction = (action) => {
        toast(`${action} functionality coming soon!`, { icon: '🚧' });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col h-[380px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#2E1A12] text-[15px]">{title}</h4>
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" onClick={() => handleAction('Info')} />
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => handleAction('Explore')} className="flex items-center gap-1.5 text-[#F59E0B] text-sm font-semibold hover:text-[#D97706] transition-colors">
                        <Search className="w-4 h-4" /> Explore
                    </button>
                    <div className="flex items-center gap-3 text-gray-500">
                        <Bell className="w-4 h-4 hover:text-gray-800 cursor-pointer" onClick={() => handleAction('Notifications')} />
                        <MoreHorizontal className="w-4 h-4 hover:text-gray-800 cursor-pointer" onClick={() => handleAction('More options')} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-white shadow-sm">
                        <tr className="text-gray-800 font-bold border-b-2 border-gray-100">
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx} 
                                    onClick={() => handleSort(col.key)}
                                    className={`pb-3 pt-2 cursor-pointer hover:text-[#F59E0B] transition-colors ${col.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {col.label} 
                                    <span className="text-gray-300 ml-1 text-[10px]">
                                        {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▼'}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length === 0 ? (
                            <tr><td colSpan={columns.length} className="text-center py-8 text-gray-400">No data available</td></tr>
                        ) : (
                            sortedData.map((item, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Reports = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState({ sales: null, payments: null, inventory: null, bookings: null });
    const [adminFeaturesEnabled, setAdminFeaturesEnabled] = useState(false);

    useEffect(() => { fetchAllReports(); }, []);

    const fetchAllReports = async () => {
        setIsLoading(true);
        try {
            const [salesRes, paymentsRes, inventoryRes, bookingsRes] = await Promise.all([
                api.get('/reports/sales'),
                api.get('/reports/payments'),
                api.get('/reports/inventory'),
                api.get('/reports/bookings')
            ]);
            setReportData({
                sales: salesRes.data,
                payments: paymentsRes.data,
                inventory: inventoryRes.data,
                bookings: bookingsRes.data
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load comprehensive reports');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!reportData.sales || !reportData.payments || !reportData.inventory || !reportData.bookings) {
            toast.error('Data not fully loaded yet!');
            return;
        }

        try {
            toast.loading('Generating Professional PDF...', { id: 'pdf-toast' });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPos = 20;

            // Header
            pdf.setFillColor(46, 26, 18); // #2E1A12
            pdf.rect(0, 0, pageWidth, 25, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SMART BAKE HUB - COMPREHENSIVE BUSINESS REPORT', 15, 16);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15 - 30, 16);

            // Sales & Revenue Section
            pdf.setTextColor(46, 26, 18);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            yPos = 35;
            pdf.text('1. Sales & Revenue Summary', 15, yPos);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);
            
            yPos += 10;
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total Revenue: Rs. ${Number(reportData.sales.summary.totalRevenue).toLocaleString()}`, 15, yPos);
            pdf.text(`Total Orders: ${reportData.sales.summary.totalOrders}`, 100, yPos);
            
            yPos += 10;
            if (reportData.sales.topItems && reportData.sales.topItems.length > 0) {
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Top Selling Item', 'Total Sold', 'Revenue']],
                    body: reportData.sales.topItems.map(item => [item.item_name, item.total_sold, `Rs. ${Number(item.revenue).toLocaleString()}`]),
                    headStyles: { fillColor: [200, 132, 59] },
                    margin: { left: 15, right: 15 }
                });
                yPos = pdf.lastAutoTable.finalY + 15;
            } else {
                yPos += 5;
            }
            
            // Payments Section
            if (yPos > pageHeight - 40) { pdf.addPage(); yPos = 20; }
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('2. Payments Summary', 15, yPos);
            pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);
            
            yPos += 10;
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Collected Revenue: Rs. ${Number(reportData.payments.summary.totalCollected).toLocaleString()}`, 15, yPos);
            pdf.text(`Pending Payments: Rs. ${Number(reportData.payments.summary.totalPending).toLocaleString()}`, 100, yPos);
            
            yPos += 15;
            
            // Inventory Section
            if (yPos > pageHeight - 50) { pdf.addPage(); yPos = 20; }
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('3. Inventory Status', 15, yPos);
            pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);
            
            yPos += 10;
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total Items: ${reportData.inventory.summary.totalItems}`, 15, yPos);
            pdf.text(`Low Stock Alerts: ${reportData.inventory.summary.lowStockCount}`, 80, yPos);
            pdf.text(`Est. Value: Rs. ${Number(reportData.inventory.summary.estimatedValue).toLocaleString()}`, 140, yPos);
            
            yPos += 10;
            
            // Inventory AutoTable
            if (reportData.inventory.lowStockItems.length > 0) {
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Low Stock Item', 'Category', 'Current Stock']],
                    body: reportData.inventory.lowStockItems.map(item => [item.item_name, item.category.replace('_', ' '), item.stock_quantity]),
                    headStyles: { fillColor: [200, 132, 59] },
                    margin: { left: 15, right: 15 }
                });
                yPos = pdf.lastAutoTable.finalY + 15;
            } else {
                pdf.text('No low stock items currently.', 15, yPos);
                yPos += 15;
            }
            
            // Bookings Section
            if (yPos > pageHeight - 50) { pdf.addPage(); yPos = 20; }
            
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('4. Event Bookings Summary', 15, yPos);
            pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);
            
            yPos += 10;
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total Bookings: ${reportData.bookings.summary.totalBookings}`, 15, yPos);
            pdf.text(`Approved Bookings: ${reportData.bookings.summary.approvedBookings}`, 80, yPos);
            
            yPos += 10;
            
            if (reportData.bookings.upcoming.length > 0) {
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Date', 'Event Type', 'Guests']],
                    body: reportData.bookings.upcoming.map(b => [new Date(b.event_date).toLocaleDateString(), b.event_type, b.number_of_guests]),
                    headStyles: { fillColor: [200, 132, 59] },
                    margin: { left: 15, right: 15 }
                });
                yPos = pdf.lastAutoTable.finalY + 15;
            } else {
                pdf.text('No upcoming bookings.', 15, yPos);
            }

            // Add page numbers
            const pageCount = pdf.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(9);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }

            pdf.save('SmartBakeHub_Comprehensive_Business_Report.pdf');
            toast.success('Professional PDF Downloaded!', { id: 'pdf-toast' });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF', { id: 'pdf-toast' });
        }
    };

    const handleAction = (action) => {
        toast(`${action} functionality coming soon!`, { icon: '🚧' });
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        End of Day Report
                    </h2>
                </div>
                
                <div className="flex items-center gap-4">
                    <div 
                        className="flex items-center gap-2 mr-4 cursor-pointer"
                        onClick={() => {
                            setAdminFeaturesEnabled(!adminFeaturesEnabled);
                            toast.success(adminFeaturesEnabled ? "Admin features disabled" : "Admin features enabled");
                        }}
                    >
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${adminFeaturesEnabled ? 'bg-[#FCA311]' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${adminFeaturesEnabled ? 'translate-x-5.5 right-0.5' : 'left-0.5'}`}></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">Admin features</span>
                    </div>
                    <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleAction('Notifications')} />
                    <FileText className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleAction('Documents')} />
                    <button 
                        onClick={downloadPDF}
                        className="bg-[#2E1A12] hover:bg-[#C8843B] text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#C8843B] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    
                    <DashboardTable 
                        title="Top Selling Items"
                        data={reportData.sales?.topItems || []}
                        columns={[
                            { key: 'item_name', label: 'Item Name', className: 'font-medium text-gray-800' },
                            { key: 'total_sold', label: 'Qty Sold', align: 'right', className: 'font-medium' },
                            { key: 'revenue', label: 'Revenue', align: 'right', className: 'text-gray-600', render: (item) => `Rs. ${Number(item.revenue).toLocaleString()}` }
                        ]}
                    />

                    <DashboardTable 
                        title="Upcoming Event Bookings"
                        data={reportData.bookings?.upcoming || []}
                        columns={[
                            { key: 'event_date', label: 'Date', className: 'font-medium text-gray-800', render: (item) => new Date(item.event_date).toLocaleDateString() },
                            { key: 'event_type', label: 'Event Type', className: 'text-gray-600 capitalize' },
                            { key: 'number_of_guests', label: 'Guests', align: 'right', className: 'font-bold text-[#F59E0B]' }
                        ]}
                    />

                    {/* Panel 3: Daily Sales Trend (Bar Chart) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col h-[380px]">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#2E1A12] text-[15px]">Daily Revenue Trend - Last 7 Days</h4>
                                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" onClick={() => handleAction('Info')} />
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleAction('Explore')} className="flex items-center gap-1.5 text-[#F59E0B] text-sm font-semibold hover:text-[#D97706] transition-colors">
                                    <Search className="w-4 h-4" /> Explore
                                </button>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Bell className="w-4 h-4 hover:text-gray-800 cursor-pointer" onClick={() => handleAction('Notifications')} />
                                    <MoreHorizontal className="w-4 h-4 hover:text-gray-800 cursor-pointer" onClick={() => handleAction('More options')} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.sales?.dailySales || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6b7280'}} tickFormatter={(val) => new Date(val).toLocaleDateString()} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} />
                                    <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Legend verticalAlign="top" height={36} content={({ payload }) => (
                                        <div className="flex justify-center gap-4 text-xs font-semibold text-gray-500 mb-4">
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#FCA311] rounded-sm"></div> Revenue (Rs)</div>
                                        </div>
                                    )} />
                                    <Bar dataKey="amount" fill="#FCA311" radius={[2, 2, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <DashboardTable 
                        title="Low Stock Inventory Alerts"
                        data={reportData.inventory?.lowStockItems || []}
                        columns={[
                            { key: 'item_name', label: 'Item', className: 'font-medium text-gray-800' },
                            { key: 'category', label: 'Category', className: 'text-gray-600 capitalize', render: (item) => item.category.replace('_', ' ') },
                            { key: 'stock_quantity', label: 'Stock', align: 'right', className: 'font-bold text-red-500' }
                        ]}
                    />

                </div>
            )}
        </div>
    );
};

export default Reports;
