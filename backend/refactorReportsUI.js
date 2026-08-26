const fs = require('fs');

let content = fs.readFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', 'utf8');

// 1. We need more lucide icons
content = content.replace(/import { (.*?) } from 'lucide-react';/, "import { $1, Info, Search, Bell, MoreHorizontal, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';");

// 2. We need to construct the new component structure
const newRenderLogic = `
    const renderCardHeader = (title) => (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#2E1A12] text-[15px]">{title}</h4>
                <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-[#F59E0B] text-sm font-semibold hover:text-[#D97706] transition-colors">
                    <Search className="w-4 h-4" /> Explore
                </button>
                <div className="flex items-center gap-3 text-gray-500">
                    <Bell className="w-4 h-4 hover:text-gray-800 cursor-pointer" />
                    <MoreHorizontal className="w-4 h-4 hover:text-gray-800 cursor-pointer" />
                </div>
            </div>
        </div>
    );

    const renderCardFooter = (total) => (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer hover:bg-gray-50">
                    <span>20</span>
                    <ChevronDown className="w-3 h-3" />
                </div>
                <span className="text-xs">All of {total}</span>
            </div>
            <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                <div className="w-6 h-6 bg-[#F59E0B] text-white flex items-center justify-center rounded text-xs font-bold shadow-sm">1</div>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        End of Day Report
                    </h2>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-4">
                        <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">Admin features</span>
                    </div>
                    <Bell className="w-5 h-5 text-gray-600" />
                    <FileText className="w-5 h-5 text-gray-600" />
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
                    
                    {/* Panel 1: Top Selling Items (Table) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
                        {renderCardHeader("Top Selling Items")}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-gray-800 font-bold border-b-2 border-gray-100">
                                        <th className="pb-3 pt-2">Item Name <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                        <th className="pb-3 pt-2 text-right">Qty Sold <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                        <th className="pb-3 pt-2 text-right">Revenue <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.sales?.topItems?.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-3 font-medium text-gray-800">{item.item_name}</td>
                                            <td className="py-3 text-right font-medium">{item.total_sold}</td>
                                            <td className="py-3 text-right text-gray-600">Rs. {Number(item.revenue).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {renderCardFooter(reportData.sales?.topItems?.length || 0)}
                    </div>

                    {/* Panel 2: Upcoming Bookings (Table) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
                        {renderCardHeader("Upcoming Event Bookings")}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-gray-800 font-bold border-b-2 border-gray-100">
                                        <th className="pb-3 pt-2">Date <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                        <th className="pb-3 pt-2">Event Type <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                        <th className="pb-3 pt-2 text-right">Guests <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.bookings?.upcoming?.map((b, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-3 font-medium text-gray-800">{new Date(b.event_date).toLocaleDateString()}</td>
                                            <td className="py-3 text-gray-600 capitalize">{b.event_type}</td>
                                            <td className="py-3 text-right font-bold text-[#F59E0B]">{b.number_of_guests}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {renderCardFooter(reportData.bookings?.upcoming?.length || 0)}
                    </div>

                    {/* Panel 3: Daily Sales Trend (Bar Chart) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
                        {renderCardHeader("Daily Revenue Trend - Last 7 Days")}
                        <div className="flex-1 h-64 mt-4">
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

                    {/* Panel 4: Low Stock Alerts (Table) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
                        {renderCardHeader("Low Stock Inventory Alerts")}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-gray-800 font-bold border-b-2 border-gray-100">
                                        <th className="pb-3 pt-2">Item <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                        <th className="pb-3 pt-2">Category <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                        <th className="pb-3 pt-2 text-right">Stock <span className="text-gray-300 ml-1 text-[10px]">▼</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.inventory?.lowStockItems?.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-6 text-gray-400">No low stock items</td></tr>
                                    ) : (
                                        reportData.inventory?.lowStockItems?.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="py-3 font-medium text-gray-800">{item.item_name}</td>
                                                <td className="py-3 text-gray-600 capitalize">{item.category.replace('_', ' ')}</td>
                                                <td className="py-3 text-right font-bold text-red-500">{item.stock_quantity}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderCardFooter(reportData.inventory?.lowStockItems?.length || 0)}
                    </div>

                </div>
            )}
        </div>
    );
};

export default Reports;`;

// Replace everything from the first render function down to the end of the file.
// We'll use a regex to match from `const renderSalesTab = () => {` to the end of the file.
const regex = /const renderSalesTab = \(\) => \{[\s\S]*export default Reports;/m;
content = content.replace(regex, newRenderLogic);

fs.writeFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', content);
console.log("Updated UI to match End of Day Report dashboard structure");
