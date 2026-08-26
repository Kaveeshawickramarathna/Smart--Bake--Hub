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
        const [dailySalesRaw] = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as amount 
            FROM orders 
            WHERE status = "completed" AND created_at >= DATE(NOW()) - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Ensure all 7 days are present
        const dailySales = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailySalesRaw.find(row => {
                const rowDateStr = new Date(row.date).toISOString().split('T')[0];
                return rowDateStr === dateStr;
            });
            dailySales.push({
                date: dateStr,
                amount: found ? Number(found.amount) : 0
            });
        }
        console.log(dailySales);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
