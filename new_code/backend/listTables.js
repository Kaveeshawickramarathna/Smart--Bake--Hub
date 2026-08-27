const pool = require('./src/config/db');

async function listTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        const dbName = Object.values(rows[0] || {})[0] ? Object.keys(rows[0])[0] : 'Tables';
        const tables = rows.map(r => r[dbName]);
        
        console.log("TABLES FOUND:");
        for (const table of tables) {
            const [count] = await pool.query(`SELECT COUNT(*) as c FROM ${table}`);
            console.log(`- ${table} (${count[0].c} rows)`);
        }
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
listTables();
