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
        const [topItems] = await pool.query(`
            SELECT COALESCE(p.name, m.name, b.name, oi.item_name, 'Unknown Item') as item_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN dishes m ON oi.menu_id = m.id
            LEFT JOIN beverages b ON oi.beverage_id = b.id
            WHERE o.status = "completed"
            GROUP BY COALESCE(p.name, m.name, b.name, oi.item_name, 'Unknown Item')
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        console.log("Success:", topItems);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
