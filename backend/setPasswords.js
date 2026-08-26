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
        
        // Admin password
        const adminHash = await bcrypt.hash('kaveesha123', salt);
        await c.query('UPDATE users SET password = ? WHERE role = "admin"', [adminHash]);
        
        // Staff password
        const staffHash = await bcrypt.hash('uma123', salt);
        await c.query('UPDATE users SET password = ? WHERE role = "staff"', [staffHash]);
        
        // Let's set customers to something known just in case, like customer123
        const customerHash = await bcrypt.hash('customer123', salt);
        await c.query('UPDATE users SET password = ? WHERE role = "customer"', [customerHash]);

        console.log('Successfully updated passwords for admin and staff!');
        c.end();
    } catch (err) {
        console.error(err);
    }
}
run();
