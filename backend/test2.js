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
        const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [totalOrders] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = "completed"');
        const [dailySales] = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as amount 
            FROM orders 
            WHERE status = "completed" AND created_at >= DATE(NOW()) - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        const [topItems] = await pool.query(`
            SELECT COALESCE(p.name, m.name, 'Unknown Item') as item_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN menus m ON oi.menu_id = m.id
            WHERE o.status = "completed"
            GROUP BY item_name
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        console.log("Success");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
