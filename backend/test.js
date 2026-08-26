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
        const [totalBookings] = await pool.query('SELECT COUNT(*) as total FROM event_bookings');
        const [approvedBookings] = await pool.query('SELECT COUNT(*) as total FROM event_bookings WHERE booking_status = "approved"');
        
        const [upcoming] = await pool.query(`
            SELECT eb.event_date, ep.name as event_type, eb.guest_count as number_of_guests 
            FROM event_bookings eb
            LEFT JOIN event_packages ep ON eb.event_package_id = ep.id
            WHERE eb.event_date >= DATE(NOW()) AND eb.booking_status = "approved" 
            ORDER BY eb.event_date ASC 
            LIMIT 5
        `);

        console.log("Success:", JSON.stringify({ upcoming }, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
test();
