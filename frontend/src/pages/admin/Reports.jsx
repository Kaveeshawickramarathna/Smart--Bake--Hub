import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Box, Calendar, Trash2 } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

const Reports = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState({ sales: null, payments: null, inventory: null, bookings: null });
    
    // Refs for each section to handle perfect page breaks
    const salesRef = useRef();
    const paymentsRef = useRef();
    const inventoryRef = useRef();
    const bookingsRef = useRef();

    useEffect(() => { fetchAllReports(); }, []);

    
    const fetchAllReports = async () => {
        setIsLoading(true);
        try {
            const [salesRes, paymentsRes, invRes, bookRes] = await Promise.all([
                api.get('/reports/sales'),
                api.get('/reports/payments'),
                api.get('/reports/inventory'),
                api.get('/reports/bookings')
            ]);
            setReportData({
                sales: salesRes.data,
                payments: paymentsRes.data,
                inventory: invRes.data,
                bookings: bookRes.data
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports.');
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
                    headStyles: { fillColor: [200, 132, 59] }, // #C8843B
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
                    headStyles: { fillColor: [46, 26, 18] },
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

    const COLORS = ['#C8843B', '#2E1A12', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

    const renderSalesTab = () => {
        const report = reportData.sales;
        if (!report) return null;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
                            <h3 className="text-3xl font-black text-[#2E1A12] mt-1">Rs. {Number(report.summary.totalRevenue).toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-[#C8843B]" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Orders</p>
                            <h3 className="text-3xl font-black text-[#2E1A12] mt-1">{report.summary.totalOrders}</h3>
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
                                <AreaChart data={report.dailySales}>
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
                                <BarChart data={report.topItems} layout="vertical" margin={{ left: 40 }}>
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
        const report = reportData.payments;
        if (!report) return null;
        const data = [
            { name: 'Collected', value: Number(report.summary.totalCollected) },
            { name: 'Pending', value: Number(report.summary.totalPending) }
        ];

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Collected Revenue</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">Rs. {Number(report.summary.totalCollected).toLocaleString()}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Pending Payments</p>
                        <h3 className="text-3xl font-black text-amber-500 mt-1">Rs. {Number(report.summary.totalPending).toLocaleString()}</h3>
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
        const report = reportData.inventory;
        if (!report) return null;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Total Items in System</p>
                        <h3 className="text-3xl font-black text-[#2E1A12] mt-1">{report.summary.totalItems}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Low Stock Alerts</p>
                        <h3 className="text-3xl font-black text-red-500 mt-1">{report.summary.lowStockCount}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Est. Inventory Value</p>
                        <h3 className="text-3xl font-black text-[#C8843B] mt-1">Rs. {Number(report.summary.estimatedValue).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-wider">Inventory by Category</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={report.categories} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="count" nameKey="category">
                                        {report.categories.map((entry, index) => (
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
                                {report.lowStockItems.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-4 text-gray-400">No low stock items</td></tr>
                                ) : (
                                    report.lowStockItems.map((item, idx) => (
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
        const report = reportData.bookings;
        if (!report) return null;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Total Bookings</p>
                        <h3 className="text-3xl font-black text-[#2E1A12] mt-1">{report.summary.totalBookings}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Approved Bookings</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">{report.summary.approvedBookings}</h3>
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
                            {report.upcoming.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-6 text-gray-400">No upcoming bookings found.</td></tr>
                            ) : (
                                report.upcoming.map((b, idx) => (
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

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#C8843B]" />
                        Business Reports
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        View and download operational reports.
                    </p>
                </div>
                
                <button 
                    onClick={downloadPDF}
                    className="bg-[#2E1A12] hover:bg-[#C8843B] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
            </div>

            

            {/* Report Content Container */}
            <div className="mt-6 bg-white rounded-2xl p-10 shadow-sm border border-gray-100 max-w-[1100px] mx-auto">
                <div className="border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8">
                    <div>
                        <h3 className="text-3xl font-black text-[#2E1A12] uppercase tracking-wider">
                            Comprehensive Business Report
                        </h3>
                        <span className="text-gray-500 font-bold mt-2 block">Smart Bake Hub</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 mt-4 md:mt-0 bg-gray-50 px-4 py-2 rounded-lg">Generated: {new Date().toLocaleString()}</p>
                </div>

                
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#C8843B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-16 pb-10">
                        <section ref={salesRef} className="bg-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-50 text-[#C8843B] rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Sales & Revenue</h4>
                            </div>
                            {renderSalesTab()}
                        </section>
                        
                        <div className="h-px bg-gray-100"></div>

                        <section ref={paymentsRef} className="bg-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-50 text-[#10B981] rounded-lg"><DollarSign className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Payments</h4>
                            </div>
                            {renderPaymentsTab()}
                        </section>

                        <div className="h-px bg-gray-100"></div>

                        <section ref={inventoryRef} className="bg-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Box className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Inventory Status</h4>
                            </div>
                            {renderInventoryTab()}
                        </section>

                        <div className="h-px bg-gray-100"></div>

                        <section ref={bookingsRef} className="bg-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Calendar className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Event Bookings</h4>
                            </div>
                            {renderBookingsTab()}
                        </section>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
