const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// @desc    Get all cake designs
const getCakeDesigns = async (req, res) => {
    try {
        const query = `SELECT * FROM cake_designs ORDER BY created_at DESC`;
        const [designs] = await pool.query(query);
        
        res.json({
            success: true,
            data: designs.map(d => ({
                ...d,
                pricing_options: typeof d.pricing_options === 'string' ? JSON.parse(d.pricing_options) : d.pricing_options
            }))
        });
    } catch (error) {
        console.error('Error fetching cake designs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cake designs'
        });
    }
};

// @desc    Create a cake design
const createCakeDesign = async (req, res) => {
    try {
        const { name, weight_kg, price, pricing_options } = req.body;
        const image = req.file;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        let parsedPricingOptions = null;
        if (pricing_options) {
            parsedPricingOptions = typeof pricing_options === 'string' ? pricing_options : JSON.stringify(pricing_options);
        }

        const imageUrl = `/uploads/${image.filename}`;
        const query = `INSERT INTO cake_designs (name, image_url, weight_kg, price, pricing_options) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [name, imageUrl, weight_kg || null, price || null, parsedPricingOptions]);

        res.status(201).json({
            success: true,
            message: 'Cake design created successfully',
            data: {
                id: result.insertId,
                name,
                image_url: imageUrl,
                weight_kg,
                price,
                pricing_options: parsedPricingOptions ? JSON.parse(parsedPricingOptions) : null,
                status: 'active'
            }
        });
    } catch (error) {
        console.error('Error creating cake design:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating cake design'
        });
    }
};

// @desc    Update cake design status
const updateCakeDesignStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const query = `UPDATE cake_designs SET status = ? WHERE id = ?`;
        const [result] = await pool.query(query, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cake design not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully'
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
};

// @desc    Delete cake design
const deleteCakeDesign = async (req, res) => {
    try {
        const { id } = req.params;

        // First get the image url to delete the file
        const [rows] = await pool.query(`SELECT image_url FROM cake_designs WHERE id = ?`, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cake design not found'
            });
        }

        // Delete from database
        await pool.query(`DELETE FROM cake_designs WHERE id = ?`, [id]);

        // Delete file from filesystem
        const imageUrl = rows[0].image_url;
        if (imageUrl) {
            const filePath = path.join(__dirname, '../../', imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({
            success: true,
            message: 'Cake design deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cake design:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting cake design'
        });
    }
};

module.exports = {
    getCakeDesigns,
    createCakeDesign,
    updateCakeDesignStatus,
    deleteCakeDesign
};
