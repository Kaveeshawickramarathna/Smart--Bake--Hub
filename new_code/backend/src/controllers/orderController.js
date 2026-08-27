const pool = require('../config/db');

const placeOrder = async (req, res) => {
    const { items, order_type } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order items cannot be empty' });
    }

    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_amount, order_type, table_number, status) VALUES (?, ?, ?, ?, ?)',
            [userId, totalAmount, order_type || 'takeaway', req.body.table_number || null, 'pending']
        );
        const orderId = orderResult.insertId;

        // Create order items
        for (const item of items) {
            // item can be a product, a menu dish, or a beverage
            const productId = item.productId || null;
            const menuId = item.menuId || null;
            const beverageId = item.beverageId || null;

            await pool.query(
                'INSERT INTO order_items (order_id, product_id, menu_id, beverage_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, productId, menuId, beverageId, item.quantity, item.price]
            );
        }

        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        // Fetch items for each order
        for (let order of orders) {
            const [items] = await pool.query(`
                SELECT oi.*, p.name as product_name, m.name as menu_name, b.name as beverage_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN dishes m ON oi.menu_id = m.id
                LEFT JOIN beverages b ON oi.beverage_id = b.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await pool.query(`
            SELECT * FROM orders 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        for (let order of orders) {
            const [items] = await pool.query(`
                SELECT oi.*, p.name as product_name, m.name as menu_name, b.name as beverage_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN dishes m ON oi.menu_id = m.id
                LEFT JOIN beverages b ON oi.beverage_id = b.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    placeOrder,
    getAllOrders,
    getMyOrders,
    updateOrderStatus
};
