const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const configBase = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
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

const ready = (async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const connection = await internalPool.getConnection();
            console.log(`MySQL connection established on ${configBase.host}:${configBase.port} (DB: ${configBase.database}).`);
            await runAutoMigrations(connection);
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

const runAutoMigrations = async (connection) => {
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS daily_forecasts (
                id INT NOT NULL AUTO_INCREMENT,
                forecast_date DATE NOT NULL,
                source VARCHAR(20) DEFAULT 'heuristic',
                payload JSON NOT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY forecast_date (forecast_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        const columnExists = async (table, column) => {
            const [rows] = await connection.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
            `, [configBase.database, table, column]);
            return rows.length > 0;
        };

        if (!(await columnExists('order_items', 'beverage_id'))) {
            await connection.query('ALTER TABLE order_items ADD COLUMN beverage_id INT DEFAULT NULL AFTER menu_id');
            await connection.query('ALTER TABLE order_items ADD CONSTRAINT fk_order_items_beverage FOREIGN KEY (beverage_id) REFERENCES beverages(id) ON DELETE SET NULL');
        }

        if (!(await columnExists('orders', 'payment_status'))) {
            await connection.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid' AFTER status");
        }
        if (!(await columnExists('orders', 'payment_method'))) {
            await connection.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL AFTER payment_status");
        }
        if (!(await columnExists('orders', 'stripe_session_id'))) {
            await connection.query("ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255) DEFAULT NULL AFTER payment_method");
        }
    } catch (migErr) {
        console.error('Auto migration error:', migErr.message);
    }
};

module.exports = pool;
module.exports.ready = ready;

