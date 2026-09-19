const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const configBase = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
    database: process.env.DB_NAME || 'smart_bake_hub',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
};

const internalPool = mysql.createPool(configBase);

const pool = {
    query: async (sql, params = []) => {
        try {
            const [rows, fields] = await internalPool.query(sql, params);
            return [rows, fields];
        } catch (error) {
            console.error('SQL Error:', error.message, 'Query:', sql, 'Params:', params);
            throw error;
        }
    },
    execute: async (sql, params) => pool.query(sql, params),
    end: async () => internalPool.end()
};

const ensureColumnExists = async (connection, table, column, columnDef) => {
    try {
        const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
        if (cols.length === 0) {
            await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${columnDef}`);
            console.log(`Added missing column '${column}' to table '${table}'.`);
        }
    } catch (err) {
        console.error(`Error ensuring column '${column}' on table '${table}':`, err.message);
    }
};

const ready = (async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const connection = await internalPool.getConnection();
            console.log(`MySQL connection established on ${configBase.host}:${configBase.port} (DB: ${configBase.database}).`);
            
            await ensureColumnExists(connection, 'dishes', 'image_url', 'varchar(255) DEFAULT NULL');
            await ensureColumnExists(connection, 'dishes', 'discount_percentage', 'decimal(5,2) DEFAULT 0.00');
            await ensureColumnExists(connection, 'beverages', 'image_url', 'varchar(255) DEFAULT NULL');
            await ensureColumnExists(connection, 'beverages', 'discount_percentage', 'decimal(5,2) DEFAULT 0.00');
            await ensureColumnExists(connection, 'orders', 'payment_method', "varchar(50) DEFAULT 'cash'");
            await ensureColumnExists(connection, 'orders', 'payment_status', "varchar(50) DEFAULT 'pending'");
            await ensureColumnExists(connection, 'orders', 'stripe_session_id', 'varchar(255) DEFAULT NULL');
            
            try {
                await connection.query('ALTER TABLE orders MODIFY COLUMN user_id INT DEFAULT NULL');
            } catch (e) {}
            
            try {
                await connection.query('UPDATE dishes SET discount_percentage = 0.00 WHERE discount_percentage > 0 AND name LIKE "%vegitable fride rice%"');
            } catch (e) {}

            connection.release();
            return;
        } catch (err) {
            console.error(`MySQL connection failed (retries left: ${retries - 1}):`, err.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error('Could not connect to MySQL after multiple attempts.');
})();

module.exports = pool;
module.exports.ready = ready;
