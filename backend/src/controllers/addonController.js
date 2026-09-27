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
        let { id, name, price } = req.body;

        if (!name || price === undefined || price === null || price === '') {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required'
            });
        }

        if (!id || id.trim() === '') {
            id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '_' + Date.now();
        }

        const query = `INSERT INTO premium_addons (id, name, price, status) VALUES (?, ?, ?, 'active')`;
        await pool.query(query, [id, name, parseFloat(price) || 0]);

        res.status(201).json({
            success: true,
            message: 'Add-on created successfully',
            data: { id, name, price: parseFloat(price) || 0, status: 'active' }
        });
    } catch (error) {
        console.error('Error creating add-on:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'An add-on with this ID or name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating add-on'
        });
    }
};

// @desc    Delete a premium add-on
const deleteAddon = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM premium_addons WHERE id = ?`;
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Add-on not found'
            });
        }

        res.json({
            success: true,
            message: 'Add-on deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting add-on:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting add-on'
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
    deleteAddon,
    updateAddonStatus
};
