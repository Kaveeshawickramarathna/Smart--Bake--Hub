const db = require('../config/db');

// Get all options
exports.getOptions = async (req, res) => {
    try {
        const sql = 'SELECT * FROM cake_options ORDER BY category, id';
        const [results] = await db.query(sql);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
};

// Add new option
exports.addOption = async (req, res) => {
    try {
        const { category, value } = req.body;
        if (!category || !value) {
            return res.status(400).json({ success: false, message: 'Category and value are required' });
        }

        const sql = 'INSERT INTO cake_options (category, value) VALUES (?, ?)';
        const [result] = await db.query(sql, [category, value]);
        res.status(201).json({ 
            success: true, 
            message: 'Option added successfully',
            data: { id: result.insertId, category, value, status: 'active' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
};

// Toggle status
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const sql = 'UPDATE cake_options SET status = ? WHERE id = ?';
        const [result] = await db.query(sql, [status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Option not found' });
        res.status(200).json({ success: true, message: `Option status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
};

// Delete option
exports.deleteOption = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM cake_options WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Option not found' });
        res.status(200).json({ success: true, message: 'Option deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
};
