const pool = require('../config/db');

// @desc    Get all premium add-ons
const getAddons = async (req, res) => {
    try {
        const query = `SELECT * FROM premium_addons ORDER BY created_at ASC`;
        const [addons] = await pool.query(query);
        
        res.json({
            success: true,
            data: addons
        });
    } catch (error) {
        console.error('Error fetching add-ons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching add-ons'
        });
    }
};

// @desc    Create a premium add-on
const createAddon = async (req, res) => {
    try {
        const { id, name, price } = req.body;

        if (!id || !name || !price) {
            return res.status(400).json({
                success: false,
                message: 'ID, name, and price are required'
            });
        }

        const query = `INSERT INTO premium_addons (id, name, price) VALUES (?, ?, ?)`;
        await pool.query(query, [id, name, price]);

        res.status(201).json({
            success: true,
            message: 'Add-on created successfully',
            data: { id, name, price, status: 'active' }
        });
    } catch (error) {
        console.error('Error creating add-on:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'An add-on with this ID already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating add-on'
        });
    }
};

// @desc    Update premium add-on status
const updateAddonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const query = `UPDATE premium_addons SET status = ? WHERE id = ?`;
        const [result] = await pool.query(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Add-on not found'
            });
        }

        res.json({
            success: true,
            message: 'Add-on status updated successfully'
        });
    } catch (error) {
        console.error('Error updating add-on status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating add-on status'
        });
    }
};

module.exports = {
    getAddons,
    createAddon,
    updateAddonStatus
};
