const fs = require('fs');

let content = fs.readFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', 'utf8');

// Fix the `const data = data.sales;` issue
content = content.replace(/const data = data\.sales;/g, 'const report = reportData.sales;');
content = content.replace(/const data = data\.payments;/g, 'const report = reportData.payments;');
content = content.replace(/const data = data\.inventory;/g, 'const report = reportData.inventory;');
content = content.replace(/const data = data\.bookings;/g, 'const report = reportData.bookings;');

// Since I broke `renderPaymentsTab` by having two `data` variables, I will replace the first one with `report`
// And for all usages of `data.summary`, change it to `report.summary` (except inside the pie chart where it might be `data`)

const fixBlock = (block, section) => {
    // block is the entire renderXYZTab function
    // replace `data.summary` with `report.summary`, etc
    let fixed = block.replace(/data\.summary/g, 'report.summary');
    fixed = fixed.replace(/data\.dailySales/g, 'report.dailySales');
    fixed = fixed.replace(/data\.topItems/g, 'report.topItems');
    fixed = fixed.replace(/data\.categories/g, 'report.categories');
    fixed = fixed.replace(/data\.lowStockItems/g, 'report.lowStockItems');
    fixed = fixed.replace(/data\.upcoming/g, 'report.upcoming');
    
    // In renderPaymentsTab, there is `const data = [` which is valid. We leave it as is.
    return fixed;
};

// Apply to each block
const sections = ['Sales', 'Payments', 'Inventory', 'Bookings'];
for (const sec of sections) {
    const regex = new RegExp(`const render${sec}Tab = \\(\\) => \\{[\\s\\S]*?\\};`, 'g');
    content = content.replace(regex, match => fixBlock(match, sec));
}

// Fix the `if (!data)` to `if (!report)`
content = content.replace(/if \(!data\) return null;/g, 'if (!report) return null;');

fs.writeFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', content);
console.log("Successfully fixed Reports.jsx");
