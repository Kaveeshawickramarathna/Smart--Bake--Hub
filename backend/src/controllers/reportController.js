const pool = require('../config/db');

// Helper function to format dates
const getFormattedDate = (date) => date.toISOString().split('T')[0];

const getSalesReport = async (req, res) => {
    try {
        const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [totalOrders] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = "completed"');
        
        // Sales over last 7 days
        const [dailySalesRaw] = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as amount 
            FROM orders 
            WHERE status = "completed" AND created_at >= DATE(NOW()) - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Ensure all 7 days are present
        const dailySales = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailySalesRaw.find(row => {
                // row.date could be a Date object or string depending on mysql2 config
                const rowDateStr = new Date(row.date).toISOString().split('T')[0];
                return rowDateStr === dateStr;
            });
            dailySales.push({
                date: dateStr,
                amount: found ? Number(found.amount) : 0
            });
        }

        // Top 5 selling items
        const [topItems] = await pool.query(`
            SELECT COALESCE(p.name, m.name, b.name, oi.item_name, 'Unknown Item') as item_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN dishes m ON oi.menu_id = m.id
            LEFT JOIN beverages b ON oi.beverage_id = b.id
            WHERE o.status = "completed"
            GROUP BY COALESCE(p.name, m.name, b.name, oi.item_name, 'Unknown Item')
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
        
        // Low stock items based on threshold
        const [lowStockItemsRaw] = await pool.query('SELECT * FROM inventory_items WHERE stock_quantity <= low_stock_threshold');
        const lowStockItems = lowStockItemsRaw.map(p => ({
            item_name: p.item_name,
            category: p.category || 'Uncategorized',
            stock_quantity: Number(p.stock_quantity)
        }));

        // No price in inventory_items currently, so value is 0
        const totalValue = 0;

        // Category distribution
        const [categoriesRaw] = await pool.query('SELECT category, COUNT(*) as count FROM inventory_items GROUP BY category');
        const categories = categoriesRaw.map(c => ({
            category: c.category || 'Uncategorized',
            count: Number(c.count)
        }));

        res.json({
            summary: {
                totalItems: totalItems[0].total || 0,
                lowStockCount: lowStockItems.length || 0,
                estimatedValue: totalValue
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
        const [approvedBookings] = await pool.query('SELECT COUNT(*) as total FROM event_bookings WHERE booking_status = "approved"');
        
        // Upcoming bookings
        const [upcoming] = await pool.query(`
            SELECT eb.event_date, ep.name as event_type, eb.guest_count as number_of_guests 
            FROM event_bookings eb
            LEFT JOIN event_packages ep ON eb.event_package_id = ep.id
            WHERE eb.event_date >= DATE(NOW()) AND eb.booking_status = "approved" 
            ORDER BY eb.event_date ASC 
            LIMIT 5
        `);

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
        const [items] = await pool.query('SELECT name as item_name, stock as stock_quantity, expiry_date FROM products WHERE expiry_date IS NOT NULL');
        
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
