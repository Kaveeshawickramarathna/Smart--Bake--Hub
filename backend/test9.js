const mysql = require('mysql2/promise');

async function test() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'smart_bake_hub',
        port: 3306
    });

    try {
        const [totalItems] = await pool.query('SELECT COUNT(*) as total FROM inventory_items');
        
        const [lowStockItemsRaw] = await pool.query('SELECT * FROM inventory_items WHERE stock_quantity <= low_stock_threshold');
        const lowStockItems = lowStockItemsRaw.map(p => ({
            item_name: p.item_name,
            category: p.category || 'Uncategorized',
            stock_quantity: Number(p.stock_quantity)
        }));

        const totalValue = 0;

        const [categoriesRaw] = await pool.query('SELECT category, COUNT(*) as count FROM inventory_items GROUP BY category');
        const categories = categoriesRaw.map(c => ({
            category: c.category || 'Uncategorized',
            count: Number(c.count)
        }));

        console.log(JSON.stringify({
            summary: {
                totalItems: totalItems[0].total || 0,
                lowStockCount: lowStockItems.length || 0,
                estimatedValue: totalValue
            },
            lowStockItems,
            categories
        }, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
