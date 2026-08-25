const pool = require('../config/db');

// @desc    Get all beverages
const getBeverages = async (req, res) => {
    try {
        const { keyword, category } = req.query;
        let query = `SELECT m.*, bc.name as beverage_category_name
                     FROM beverages m 
                     LEFT JOIN beverage_categories bc ON m.beverage_category_id = bc.id
                     WHERE 1=1`;
        let queryParams = [];

        if (keyword) {
            query += ' AND (m.name LIKE ? OR m.beverage_code LIKE ?)';
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (category) {
            query += ' AND bc.name = ?';
            queryParams.push(category);
        }

        query += ' GROUP BY m.id ORDER BY m.created_at DESC';

        const [beverages] = await pool.query(query, queryParams);
        res.json(beverages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single beverage with products
const getBeverageById = async (req, res) => {
    try {
        const [beverages] = await pool.query(
            `SELECT m.*, bc.name as beverage_category_name 
             FROM beverages m 
             LEFT JOIN beverage_categories bc ON m.beverage_category_id = bc.id 
             WHERE m.id = ?`,
            [req.params.id]
        );
        
        if (beverages.length === 0) {
            return res.status(404).json({ message: 'Beverage not found' });
        }

        const beverage = beverages[0];

        beverage.products = [];
        res.json(beverage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a beverage
const createBeverage = async (req, res) => {
    const { name, beverage_code, beverage_category_id, portion_type, price, price_small, price_large, price_variants, status = 'active', productItems = [] } = req.body;

    try {
        // Insert beverage
        const [result] = await pool.query(
            'INSERT INTO beverages (beverage_category_id, beverage_code, name, portion_type, price, price_small, price_large, price_variants, status, discount_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [beverage_category_id || null, beverage_code, name, portion_type || 'regular', price || 0, price_small || 0, price_large || 0, price_variants ? JSON.stringify(price_variants) : null, status, discount_percentage]
        );

        const beverageId = result.insertId;

        res.status(201).json({ id: beverageId, message: 'Beverage created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a beverage
const updateBeverage = async (req, res) => {
    const { name, beverage_code, beverage_category_id, portion_type, price, price_small, price_large, price_variants, status, discount_percentage, productItems = [] } = req.body;
    const { id } = req.params;

    try {
        // Update beverage
        await pool.query(
            'UPDATE beverages SET name=?, beverage_code=?, beverage_category_id=?, portion_type=?, price=?, price_small=?, price_large=?, price_variants=?, status=?, discount_percentage=? WHERE id=?',
            [name, beverage_code, beverage_category_id || null, portion_type || 'regular', price || 0, price_small || 0, price_large || 0, price_variants ? JSON.stringify(price_variants) : null, status || 'active', discount_percentage || 0, id]
        );

        res.json({ message: 'Beverage updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle beverage status
const toggleBeverageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT status FROM beverages WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Beverage not found' });
        }
        
        const currentStatus = rows[0].status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        await pool.query('UPDATE beverages SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ message: `Beverage status updated to ${newStatus}`, status: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle beverage availability
const toggleBeverageAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT is_available FROM beverages WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Beverage not found' });
        }
        
        const currentAvailability = rows[0].is_available;
        const newAvailability = currentAvailability ? 0 : 1; // Toggle boolean
        
        await pool.query('UPDATE beverages SET is_available = ? WHERE id = ?', [newAvailability, id]);
        res.json({ message: `Beverage availability updated`, is_available: !!newAvailability });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a beverage
const deleteBeverage = async (req, res) => {
    try {
        // Delete beverage
        await pool.query('DELETE FROM beverages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Beverage deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get next auto-generated dish code
const getNextBeverageCode = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT beverage_code FROM beverages WHERE beverage_code LIKE 'WBB%' ORDER BY id DESC LIMIT 1"
        );
        let nextCode = 'WBB0001';
        if (rows.length > 0 && rows[0].beverage_code) {
            const lastCode = rows[0].beverage_code;
            const numberPart = lastCode.replace('WBB', '');
            const nextNumber = parseInt(numberPart, 10) + 1;
            nextCode = `WBB${nextNumber.toString().padStart(4, '0')}`;
        }
        res.json({ nextCode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get beverage categories
const getBeverageCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM beverage_categories ORDER BY name ASC');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create beverage category
const createBeverageCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Check if category exists
        const [existing] = await pool.query('SELECT * FROM beverage_categories WHERE name = ?', [name]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const [result] = await pool.query(
            'INSERT INTO beverage_categories (name, description) VALUES (?, ?)',
            [name, description || '']
        );
        
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBeverages,
    getBeverageById,
    createBeverage,
    updateBeverage,
    deleteBeverage,
    getNextBeverageCode,
    toggleBeverageStatus,
    toggleBeverageAvailability,
    getBeverageCategories,
    createBeverageCategory
};
