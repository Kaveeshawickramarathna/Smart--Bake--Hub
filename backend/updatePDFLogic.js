const fs = require('fs');

let content = fs.readFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', 'utf8');

// Update imports
content = content.replace(/import html2canvas from 'html2canvas';/, "import autoTable from 'jspdf-autotable';");

// Replace downloadPDF
const downloadPDFNew = `    const downloadPDF = async () => {
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
            pdf.text(\`Date: \${new Date().toLocaleDateString()}\`, pageWidth - 15 - 30, 16);

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
            pdf.text(\`Total Revenue: Rs. \${Number(reportData.sales.summary.totalRevenue).toLocaleString()}\`, 15, yPos);
            pdf.text(\`Total Orders: \${reportData.sales.summary.totalOrders}\`, 100, yPos);
            
            yPos += 10;
            if (reportData.sales.topItems && reportData.sales.topItems.length > 0) {
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Top Selling Item', 'Total Sold', 'Revenue']],
                    body: reportData.sales.topItems.map(item => [item.item_name, item.total_sold, \`Rs. \${Number(item.revenue).toLocaleString()}\`]),
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
            pdf.text(\`Collected Revenue: Rs. \${Number(reportData.payments.summary.totalCollected).toLocaleString()}\`, 15, yPos);
            pdf.text(\`Pending Payments: Rs. \${Number(reportData.payments.summary.totalPending).toLocaleString()}\`, 100, yPos);
            
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
            pdf.text(\`Total Items: \${reportData.inventory.summary.totalItems}\`, 15, yPos);
            pdf.text(\`Low Stock Alerts: \${reportData.inventory.summary.lowStockCount}\`, 80, yPos);
            pdf.text(\`Est. Value: Rs. \${Number(reportData.inventory.summary.estimatedValue).toLocaleString()}\`, 140, yPos);
            
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
            pdf.text(\`Total Bookings: \${reportData.bookings.summary.totalBookings}\`, 15, yPos);
            pdf.text(\`Approved Bookings: \${reportData.bookings.summary.approvedBookings}\`, 80, yPos);
            
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
                pdf.text(\`Page \${i} of \${pageCount}\`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }

            pdf.save('SmartBakeHub_Comprehensive_Business_Report.pdf');
            toast.success('Professional PDF Downloaded!', { id: 'pdf-toast' });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF', { id: 'pdf-toast' });
        }
    };`;

const regex = /const downloadPDF = async \(\) => \{[\s\S]*?toast\.error\('Failed to generate PDF', \{ id: 'pdf-toast' \}\);\s*\}\s*\};/m;
content = content.replace(regex, downloadPDFNew);

fs.writeFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', content);
console.log("Updated downloadPDF to use programmatic jsPDF structure");
