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
        await pool.query('UPDATE orders SET status = "completed" WHERE id = 1');
        const [totalCollected] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [totalPending] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status != "completed" AND status != "cancelled"');
        console.log({ totalCollected: totalCollected[0].total, totalPending: totalPending[0].total });
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
