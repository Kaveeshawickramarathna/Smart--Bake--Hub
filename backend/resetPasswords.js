const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function run() {
    try {
        const c = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            port: 3306,
            database: 'smart_bake_hub'
        });
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);
        
        await c.query('UPDATE users SET password = ?', [hash]);
        await c.query('UPDATE users SET status = "active"');
        
        console.log('Successfully reset all user passwords to: password123');
        c.end();
    } catch (err) {
        console.error(err);
    }
}
run();
