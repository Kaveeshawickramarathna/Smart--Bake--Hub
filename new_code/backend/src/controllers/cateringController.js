const pool = require('../config/db');

// @desc    Get all catering packages
const getCateringPackages = async (req, res) => {
    try {
        const query = `SELECT * FROM catering_packages ORDER BY price ASC`;
        const [packages] = await pool.query(query);
        
        // Parse the JSON items if they are returned as string
        const parsedPackages = packages.map(pkg => ({
            ...pkg,
            items: typeof pkg.items === 'string' ? JSON.parse(pkg.items) : pkg.items
        }));

        res.json({
            success: true,
            data: parsedPackages
        });
    } catch (error) {
        console.error('Error fetching catering packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching catering packages'
        });
    }
};

// @desc    Create a catering package
const createCateringPackage = async (req, res) => {
    try {
        const { name, price, description, items } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required'
            });
        }

        const itemsJson = JSON.stringify(items || []);

        const query = `INSERT INTO catering_packages (name, price, description, items) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(query, [name, price, description || '', itemsJson]);

        res.status(201).json({
            success: true,
            message: 'Catering package created successfully',
            data: {
                id: result.insertId,
                name,
                price,
                description,
                items
            }
        });
    } catch (error) {
        console.error('Error creating catering package:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating catering package'
        });
    }
};

// @desc    Delete a catering package
const deleteCateringPackage = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM catering_packages WHERE id = ?`;
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Catering package not found'
            });
        }

        res.json({
            success: true,
            message: 'Catering package deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting catering package:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting catering package'
        });
    }
};
// @desc    Toggle package status
const toggleCateringPackageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const query = `UPDATE catering_packages SET status = ? WHERE id = ?`;
        const [result] = await pool.query(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
};

module.exports = {
    getCateringPackages,
    createCateringPackage,
    deleteCateringPackage,
    toggleCateringPackageStatus
};
