const mysql = require('mysql2/promise');
const fs = require('fs');

async function test() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'smart_bake_hub',
        port: 3306,
        multipleStatements: true
    });

    try {
        const sql = fs.readFileSync('d:/Project - II/Smart--Bake--Hub/database/inventory_init.sql', 'utf8');
        await pool.query(sql);
        console.log("Executed inventory_init.sql successfully");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
