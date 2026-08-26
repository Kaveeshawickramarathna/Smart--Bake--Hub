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
        await pool.query('UPDATE orders SET status = "completed" WHERE id = 2');
        console.log("Updated order 2 to completed");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
