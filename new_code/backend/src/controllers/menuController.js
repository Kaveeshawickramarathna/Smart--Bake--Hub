const pool = require('../config/db');

// @desc    Get all menus
const getMenus = async (req, res) => {
    try {
        const { keyword, category } = req.query;
        let query = `SELECT m.*, c.name as category_name
                     FROM dishes m 
                     LEFT JOIN dish_categories c ON m.category_id = c.id
                     WHERE 1=1`;
        let queryParams = [];

        if (keyword) {
            query += ' AND (m.name LIKE ? OR m.dish_code LIKE ?)';
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (category) {
            query += ' AND c.name = ?';
            queryParams.push(category);
        }

        query += ' GROUP BY m.id ORDER BY m.created_at DESC';

        const [menus] = await pool.query(query, queryParams);
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single menu with products
const getMenuById = async (req, res) => {
    try {
        const [menus] = await pool.query(
            `SELECT m.*, c.name as category_name 
             FROM dishes m 
             LEFT JOIN dish_categories c ON m.category_id = c.id 
             WHERE m.id = ?`,
            [req.params.id]
        );
        
        if (menus.length === 0) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        const menu = menus[0];

        menu.products = [];
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a menu
const createMenu = async (req, res) => {
    const { name, dish_code, menu_category, category_id, portion_type, price, price_small, price_large, status = 'active', productItems = [] } = req.body;

    try {
        // Insert menu
        const [result] = await pool.query(
            'INSERT INTO dishes (category_id, menu_category, dish_code, name, portion_type, price, price_small, price_large, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id || null, menu_category || null, dish_code, name, portion_type || 'regular', price || 0, price_small || 0, price_large || 0, status]
        );

        const menuId = result.insertId;

        res.status(201).json({ id: menuId, message: 'Menu created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a menu
const updateMenu = async (req, res) => {
    const { name, dish_code, menu_category, category_id, portion_type, price, price_small, price_large, status, productItems = [] } = req.body;
    const { id } = req.params;

    try {
        // Update menu
        await pool.query(
            'UPDATE dishes SET name=?, dish_code=?, menu_category=?, category_id=?, portion_type=?, price=?, price_small=?, price_large=?, status=? WHERE id=?',
            [name, dish_code, menu_category || null, category_id || null, portion_type || 'regular', price || 0, price_small || 0, price_large || 0, status || 'active', id]
        );

        res.json({ message: 'Menu updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle menu status
const toggleMenuStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT status FROM dishes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        
        const currentStatus = rows[0].status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        await pool.query('UPDATE dishes SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ message: `Menu status updated to ${newStatus}`, status: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle menu availability
const toggleMenuAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT is_available FROM dishes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        
        const currentAvailability = rows[0].is_available;
        const newAvailability = currentAvailability ? 0 : 1; // Toggle boolean
        
        await pool.query('UPDATE dishes SET is_available = ? WHERE id = ?', [newAvailability, id]);
        res.json({ message: `Menu availability updated`, is_available: !!newAvailability });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a menu
const deleteMenu = async (req, res) => {
    try {
        // Delete menu
        await pool.query('DELETE FROM dishes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get next auto-generated dish code
const getNextDishCode = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT dish_code FROM dishes WHERE dish_code LIKE 'WBD%' ORDER BY id DESC LIMIT 1"
        );
        let nextCode = 'WBD0001';
        if (rows.length > 0 && rows[0].dish_code) {
            const lastCode = rows[0].dish_code;
            const numberPart = lastCode.replace('WBD', '');
            const nextNumber = parseInt(numberPart, 10) + 1;
            nextCode = `WBD${nextNumber.toString().padStart(4, '0')}`;
        }
        res.json({ nextCode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all dish categories
const getDishCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM dish_categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create dish category
const createDishCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO dish_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getNextDishCode,
    toggleMenuStatus,
    toggleMenuAvailability,
    getDishCategories,
    createDishCategory
};
