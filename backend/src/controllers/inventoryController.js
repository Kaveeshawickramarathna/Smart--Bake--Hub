const pool = require('../config/db');

// @desc    Get all inventory items
const getInventoryItems = async (req, res) => {
    try {
        const [items] = await pool.query('SELECT * FROM inventory_items ORDER BY created_at DESC');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single inventory item
const getInventoryItemById = async (req, res) => {
    try {
        const [item] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [req.params.id]);
        if (item.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new inventory item
const createInventoryItem = async (req, res) => {
    try {
        const { item_name, category, sku, stock_quantity, low_stock_threshold, expiry_date, status } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO inventory_items (item_name, category, sku, stock_quantity, low_stock_threshold, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item_name, category, sku, stock_quantity || 0, low_stock_threshold || 10, expiry_date || null, status || 'active']
        );
        
        res.status(201).json({ message: 'Inventory item created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update inventory item
const updateInventoryItem = async (req, res) => {
    try {
        const { item_name, category, sku, stock_quantity, low_stock_threshold, expiry_date, status } = req.body;
        const [result] = await pool.query(
            'UPDATE inventory_items SET item_name=?, category=?, sku=?, stock_quantity=?, low_stock_threshold=?, expiry_date=?, status=? WHERE id=?',
            [item_name, category, sku, stock_quantity, low_stock_threshold, expiry_date, status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Inventory item updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete inventory item
const deleteInventoryItem = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM inventory_items WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Inventory item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add inventory transaction (Stock In/Out)
const addTransaction = async (req, res) => {
    try {
        const { item_id, transaction_type, quantity, remarks } = req.body;
        const user_id = req.user?.id || null;

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Check current stock
            const [item] = await connection.query('SELECT stock_quantity FROM inventory_items WHERE id = ? FOR UPDATE', [item_id]);
            if (item.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ message: 'Item not found' });
            }

            let newStock = parseFloat(item[0].stock_quantity);
            const qty = parseFloat(quantity);

            if (transaction_type === 'stock_in') {
                newStock += qty;
            } else if (transaction_type === 'stock_out' || transaction_type === 'waste' || transaction_type === 'sale') {
                if (newStock < qty) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ message: 'Insufficient stock' });
                }
                newStock -= qty;
            } else if (transaction_type === 'adjustment') {
                newStock = qty; // Setting explicit quantity
            }

            // Update item stock
            await connection.query('UPDATE inventory_items SET stock_quantity = ? WHERE id = ?', [newStock, item_id]);

            // Record transaction
            await connection.query(
                'INSERT INTO inventory_transactions (item_id, transaction_type, quantity, remarks, user_id) VALUES (?, ?, ?, ?, ?)',
                [item_id, transaction_type, quantity, remarks, user_id]
            );

            await connection.commit();
            connection.release();
            res.status(201).json({ message: 'Transaction successful', new_stock: newStock });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get inventory alerts (Low stock or near expiry)
const getInventoryAlerts = async (req, res) => {
    try {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const [alerts] = await pool.query(
            `SELECT id, item_name, stock_quantity, low_stock_threshold, expiry_date 
             FROM inventory_items 
             WHERE status = 'active' 
             AND (stock_quantity <= low_stock_threshold OR (expiry_date IS NOT NULL AND expiry_date <= ?))
             ORDER BY expiry_date ASC, stock_quantity ASC`,
            [nextWeek]
        );
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addTransaction,
    getInventoryAlerts
};
