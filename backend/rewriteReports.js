const fs = require('fs');

let content = fs.readFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', 'utf8');

// 1. Remove waste tab and its references
content = content.replace(/\{ id: 'waste', label: 'Food Waste \(AI\)', icon: Trash2 \},?\s*/, '');
content = content.replace(/\{activeTab === 'waste' && renderWasteTab\(\)\}\s*/, '');
content = content.replace(/const renderWasteTab = \(\) => \{[\s\S]*?\};\s*(?=return \()/g, '');
content = content.replace(/import \{.*?Trash2.*?\} from 'lucide-react';/, match => match.replace(/Trash2,?\s*/, ''));
content = content.replace(/View and download AI-driven insights and operational reports\./, 'View and download operational reports.');

// 2. Change state to hold all reports
content = content.replace(/const \[activeTab, setActiveTab\] = useState\('sales'\);\s*/, '');
content = content.replace(/const \[reportData, setReportData\] = useState\(null\);/, `const [reportData, setReportData] = useState({ sales: null, payments: null, inventory: null, bookings: null });`);

// 3. Update useEffect and fetch function
content = content.replace(/useEffect\(\(\) => \{\s*fetchReportData\(activeTab\);\s*\}, \[activeTab\]\);/, `useEffect(() => { fetchAllReports(); }, []);`);

const fetchAllReportsFunc = `
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
`;
content = content.replace(/const fetchReportData = async \(tab\) => \{[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};/, fetchAllReportsFunc);

// 4. Update the render methods to use specific reportData slices
content = content.replace(/const renderSalesTab = \(\) => \{\s*if \(!reportData\) return null;/g, `const renderSalesTab = () => {\n        const data = reportData.sales;\n        if (!data) return null;`);
content = content.replace(/const renderPaymentsTab = \(\) => \{\s*if \(!reportData\) return null;/g, `const renderPaymentsTab = () => {\n        const data = reportData.payments;\n        if (!data) return null;`);
content = content.replace(/const renderInventoryTab = \(\) => \{\s*if \(!reportData\) return null;/g, `const renderInventoryTab = () => {\n        const data = reportData.inventory;\n        if (!data) return null;`);
content = content.replace(/const renderBookingsTab = \(\) => \{\s*if \(!reportData\) return null;/g, `const renderBookingsTab = () => {\n        const data = reportData.bookings;\n        if (!data) return null;`);

// Find all reportData. inside the render methods and replace with data.
// We'll do this for each method block individually.
const sections = ['Sales', 'Payments', 'Inventory', 'Bookings'];
for (const sec of sections) {
    const regex = new RegExp(`const render${sec}Tab = \\(\\) => \\{[\\s\\S]*?\\};`, 'g');
    content = content.replace(regex, match => match.replace(/reportData\./g, 'data.'));
}

// 5. Remove Tabs UI
content = content.replace(/\{\/\* Tabs \*\/\}\s*<div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">[\s\S]*?<\/div>/, '');

// 6. Update Render container
const renderContainer = `
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#C8843B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-16 pb-10">
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-50 text-[#C8843B] rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Sales & Revenue</h4>
                            </div>
                            {renderSalesTab()}
                        </section>
                        
                        <div className="h-px bg-gray-100"></div>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-50 text-[#10B981] rounded-lg"><DollarSign className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Payments</h4>
                            </div>
                            {renderPaymentsTab()}
                        </section>

                        <div className="h-px bg-gray-100"></div>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Box className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Inventory Status</h4>
                            </div>
                            {renderInventoryTab()}
                        </section>

                        <div className="h-px bg-gray-100"></div>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Calendar className="w-5 h-5"/></div>
                                <h4 className="text-xl font-bold text-[#2E1A12]">Event Bookings</h4>
                            </div>
                            {renderBookingsTab()}
                        </section>
                    </div>
                )}
`;

content = content.replace(/\{isLoading \? \([\s\S]*?\) : \([\s\S]*?<div>\s*\{activeTab === 'sales' && renderSalesTab\(\)\}[\s\S]*?<\/div>\s*\)\}/, renderContainer);

// Update headers
content = content.replace(/<h3 className="text-lg font-black text-\[#2E1A12\] uppercase tracking-wider">\s*\{activeTab\} Report <span className="text-gray-400 font-medium text-sm capitalize">\/ Smart Bake Hub<\/span>\s*<\/h3>/, `<h3 className="text-2xl font-black text-[#2E1A12] uppercase tracking-wider">\n                        Comprehensive Business Report\n                    </h3>\n                    <span className="text-gray-500 font-medium mt-1 block">Smart Bake Hub</span>`);

// Update PDF name
content = content.replace(/pdf\.save\(`SmartBakeHub_\$\{activeTab\.charAt\(0\)\.toUpperCase\(\) \+ activeTab\.slice\(1\)\}_Report\.pdf`\);/, `pdf.save('SmartBakeHub_Comprehensive_Business_Report.pdf');`);

fs.writeFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', content);
console.log("Successfully updated Reports.jsx");
