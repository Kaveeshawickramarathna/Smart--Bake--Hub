const db = require('../config/db');

// Get all options
exports.getOptions = (req, res) => {
    const sql = 'SELECT * FROM cake_options ORDER BY category, id';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
        res.status(200).json({ success: true, data: results });
    });
};

// Add new option
exports.addOption = (req, res) => {
    const { category, value } = req.body;
    if (!category || !value) {
        return res.status(400).json({ success: false, message: 'Category and value are required' });
    }

    const sql = 'INSERT INTO cake_options (category, value) VALUES (?, ?)';
    db.query(sql, [category, value], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
        res.status(201).json({ 
            success: true, 
            message: 'Option added successfully',
            data: { id: result.insertId, category, value, status: 'active' }
        });
    });
};

// Toggle status
exports.toggleStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const sql = 'UPDATE cake_options SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Option not found' });
        res.status(200).json({ success: true, message: `Option status updated to ${status}` });
    });
};

// Delete option
exports.deleteOption = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM cake_options WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Option not found' });
        res.status(200).json({ success: true, message: 'Option deleted successfully' });
    });
};
