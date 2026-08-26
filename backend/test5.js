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
        const [orders] = await pool.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        for (let order of orders) {
            const [items] = await pool.query(`
                SELECT oi.*, p.name as product_name, m.name as menu_name, b.name as beverage_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN dishes m ON oi.menu_id = m.id
                LEFT JOIN beverages b ON oi.beverage_id = b.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        console.log("Success");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
