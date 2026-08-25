const pool = require('../config/db');

// Helper function to format dates
const getFormattedDate = (date) => date.toISOString().split('T')[0];

const getSalesReport = async (req, res) => {
    try {
        const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [totalOrders] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = "completed"');
        
        // Sales over last 7 days
        const [dailySales] = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as amount 
            FROM orders 
            WHERE status = "completed" AND created_at >= DATE(NOW()) - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Top 5 selling items
        const [topItems] = await pool.query(`
            SELECT item_name, SUM(quantity) as total_sold, SUM(quantity * price) as revenue
            FROM order_items
            JOIN orders ON order_items.order_id = orders.id
            WHERE orders.status = "completed"
            GROUP BY item_name
            ORDER BY total_sold DESC
            LIMIT 5
        `);

        res.json({
            summary: {
                totalRevenue: totalRevenue[0].total || 0,
                totalOrders: totalOrders[0].total || 0
            },
            dailySales,
            topItems
        });
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPaymentReport = async (req, res) => {
    try {
        // Simplified payment report using order data since there's no complex payments table yet
        const [totalCollected] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [totalPending] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status != "completed" AND status != "cancelled"');
        
        res.json({
            summary: {
                totalCollected: totalCollected[0].total || 0,
                totalPending: totalPending[0].total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching payment report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getInventoryReport = async (req, res) => {
    try {
        const [totalItems] = await pool.query('SELECT COUNT(*) as total FROM inventory_items');
        const [lowStockItems] = await pool.query('SELECT * FROM inventory_items WHERE stock_quantity <= low_stock_threshold');
        const [totalValue] = await pool.query(`
            SELECT SUM(i.stock_quantity * p.price) as value 
            FROM inventory_items i
            JOIN products p ON i.item_name = p.name
        `);

        // Category distribution
        const [categories] = await pool.query('SELECT category, COUNT(*) as count FROM inventory_items GROUP BY category');

        res.json({
            summary: {
                totalItems: totalItems[0].total || 0,
                lowStockCount: lowStockItems.length || 0,
                estimatedValue: totalValue[0].value || 0
            },
            lowStockItems,
            categories
        });
    } catch (error) {
        console.error('Error fetching inventory report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getBookingReport = async (req, res) => {
    try {
        const [totalBookings] = await pool.query('SELECT COUNT(*) as total FROM event_bookings');
        const [approvedBookings] = await pool.query('SELECT COUNT(*) as total FROM event_bookings WHERE status = "approved"');
        
        // Upcoming bookings
        const [upcoming] = await pool.query('SELECT event_date, event_type, number_of_guests FROM event_bookings WHERE event_date >= DATE(NOW()) AND status = "approved" ORDER BY event_date ASC LIMIT 5');

        res.json({
            summary: {
                totalBookings: totalBookings[0].total || 0,
                approvedBookings: approvedBookings[0].total || 0
            },
            upcoming
        });
    } catch (error) {
        console.error('Error fetching booking report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getFoodWasteReport = async (req, res) => {
    try {
        // We'll calculate a mock waste risk based on expiry dates and stock levels
        const [items] = await pool.query('SELECT item_name, stock_quantity, expiry_date FROM inventory_items WHERE expiry_date IS NOT NULL');
        
        const today = new Date();
        const highRisk = [];
        const mediumRisk = [];

        items.forEach(item => {
            if (!item.expiry_date) return;
            const expiry = new Date(item.expiry_date);
            const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 2 && item.stock_quantity > 0) {
                highRisk.push({...item, daysLeft});
            } else if (daysLeft <= 5 && item.stock_quantity > 0) {
                mediumRisk.push({...item, daysLeft});
            }
        });

        res.json({
            summary: {
                highRiskCount: highRisk.length,
                mediumRiskCount: mediumRisk.length
            },
            highRisk,
            mediumRisk
        });
    } catch (error) {
        console.error('Error fetching food waste report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getSalesReport,
    getPaymentReport,
    getInventoryReport,
    getBookingReport,
    getFoodWasteReport
};
