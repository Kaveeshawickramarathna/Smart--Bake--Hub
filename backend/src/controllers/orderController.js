const pool = require('../config/db');

const placeOrder = async (req, res) => {
    const { items, order_type, special_note } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order items cannot be empty' });
    }

    const { append_to_order_id } = req.body;

    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let orderId = null;
        let isAppended = false;

        // Check if we should append to an existing order
        if (append_to_order_id) {
            const [existingOrders] = await pool.query(
                'SELECT id, status, special_note FROM orders WHERE id = ? AND user_id = ? AND status = "pending" AND created_at >= NOW() - INTERVAL 5 MINUTE',
                [append_to_order_id, userId]
            );

            if (existingOrders.length > 0) {
                orderId = existingOrders[0].id;
                isAppended = true;
                const oldNote = existingOrders[0].special_note;
                
                // Combine notes if there's a new one
                let newNote = oldNote;
                if (special_note) {
                    newNote = oldNote ? `${oldNote} | ${special_note}` : special_note;
                }

                // Update total amount and note
                await pool.query(
                    'UPDATE orders SET total_amount = total_amount + ?, special_note = ? WHERE id = ?',
                    [totalAmount, newNote, orderId]
                );
            }
        }

        // Create new order if appending failed or wasn't requested
        if (!isAppended) {
            const [orderResult] = await pool.query(
                'INSERT INTO orders (user_id, total_amount, order_type, table_number, status, special_note) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, totalAmount, order_type || 'takeaway', req.body.table_number || null, 'pending', special_note || null]
            );
            orderId = orderResult.insertId;
        }

        // Create order items
        for (const item of items) {
            const productId = item.productId || null;
            const menuId = item.menuId || null;
            const beverageId = item.beverageId || null;
            const itemName = item.name || null;

            await pool.query(
                'INSERT INTO order_items (order_id, product_id, menu_id, beverage_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [orderId, productId, menuId, beverageId, itemName, item.quantity, item.price]
            );

            // Auto Stock-Out: Deduct from inventory if the item exists in inventory_items
            if (itemName) {
                try {
                    await pool.query(
                        'UPDATE inventory_items SET stock_quantity = stock_quantity - ? WHERE item_name = ?',
                        [item.quantity, itemName]
                    );
                } catch (err) {
                    console.error('Failed to deduct inventory for:', itemName, err);
                }
            }
        }

        // Insert Notification for Admin
        if (isAppended) {
            await pool.query(
                'INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)',
                [`Order #${orderId} Updated`, `Customer appended new items for Rs. ${totalAmount.toFixed(2)}.`, 'order']
            );
            res.status(201).json({ message: 'Order updated successfully', appendedOrderId: orderId });
        } else {
            await pool.query(
                'INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)',
                [`New Order #${orderId}`, `A customer has placed a new ${order_type || 'takeaway'} order for Rs. ${totalAmount.toFixed(2)}.`, 'order']
            );
            res.status(201).json({ message: 'Order placed successfully', orderId });
        }

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
    const { status, prep_time } = req.body;
    
    try {
        if (prep_time) {
            await pool.query('UPDATE orders SET status = ?, prep_time = ? WHERE id = ?', [status, prep_time, id]);
        } else {
            await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        }
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
