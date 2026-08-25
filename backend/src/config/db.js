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

const ready = (async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const connection = await internalPool.getConnection();
            console.log(`MySQL connection established on ${configBase.host}:${configBase.port} (DB: ${configBase.database}).`);
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
