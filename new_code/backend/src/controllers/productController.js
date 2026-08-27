const pool = require('../config/db');

// @desc    Get all products
const getProducts = async (req, res) => {
    try {
        const { keyword, category, discounted } = req.query;
        const userRole = req.user?.role || 'customer'; // Get user role from token or default to customer
        
        if (discounted === 'true') {
            try { await pool.query('ALTER TABLE dishes ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0.00'); } catch (e) {}
            try { await pool.query('ALTER TABLE beverages ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0.00'); } catch (e) {}

            const discountQuery = `
                SELECT 
                    p.id, 
                    p.name, 
                    COALESCE(p.description, 'Freshly prepared item with special discount') as description, 
                    p.price, 
                    p.image_url, 
                    p.discount_percentage, 
                    COALESCE(c.name, 'Bakery') as category_name,
                    'product' as item_type
                FROM products p 
                LEFT JOIN product_categories c ON p.category_id = c.id 
                WHERE p.discount_percentage > 0

                UNION ALL

                SELECT 
                    d.id, 
                    d.name, 
                    COALESCE(d.menu_category, 'Special Dish') as description, 
                    COALESCE(d.price, 350) as price, 
                    NULL as image_url, 
                    d.discount_percentage, 
                    COALESCE(dc.name, 'Meals') as category_name,
                    'dish' as item_type
                FROM dishes d 
                LEFT JOIN dish_categories dc ON d.category_id = dc.id 
                WHERE d.discount_percentage > 0

                UNION ALL

                SELECT 
                    b.id, 
                    b.name, 
                    'Refreshing Beverage' as description, 
                    COALESCE(b.price, 200) as price, 
                    NULL as image_url, 
                    b.discount_percentage, 
                    COALESCE(bc.name, 'Beverages') as category_name,
                    'beverage' as item_type
                FROM beverages b 
                LEFT JOIN beverage_categories bc ON b.beverage_category_id = bc.id 
                WHERE b.discount_percentage > 0

                ORDER BY discount_percentage DESC
            `;
            const [discountedItems] = await pool.query(discountQuery);
            return res.json(discountedItems);
        }

        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE 1=1';
        let queryParams = [];

        // Filter by availability for non-admin and non-staff users
        if (userRole !== 'admin' && userRole !== 'staff') {
            query += ' AND p.availability = ?';
            queryParams.push('available');
        }

        if (keyword) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (category) {
            query += ' AND c.name = ?';
            queryParams.push(category);
        }

        const [products] = await pool.query(query, queryParams);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
const getProductById = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE p.id = ?', [req.params.id]);
        if (products.length > 0) {
            res.json(products[0]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
const createProduct = async (req, res) => {
    const { name, description, price, category_id, availability, discount_percentage } = req.body;
    let image_url = '';
    
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, category_id, image_url, availability, discount_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category_id || null, image_url, availability || 'available', discount_percentage || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Product created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
const updateProduct = async (req, res) => {
    const { name, description, price, category_id, availability, discount_percentage, item_type } = req.body;
    const { id } = req.params;

    try {
        if (item_type === 'dish') {
            try { await pool.query('ALTER TABLE dishes ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0.00'); } catch (e) {}
            await pool.query('UPDATE dishes SET discount_percentage=? WHERE id=?', [discount_percentage || 0, id]);
            return res.json({ message: 'Dish updated' });
        } else if (item_type === 'beverage') {
            try { await pool.query('ALTER TABLE beverages ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0.00'); } catch (e) {}
            await pool.query('UPDATE beverages SET discount_percentage=? WHERE id=?', [discount_percentage || 0, id]);
            return res.json({ message: 'Beverage updated' });
        }

        const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (existing.length > 0) {
            const current = existing[0];
            const updatedName = name !== undefined ? name : current.name;
            const updatedDescription = description !== undefined ? description : current.description;
            const updatedPrice = price !== undefined ? price : current.price;
            const updatedCategoryId = category_id !== undefined ? category_id : current.category_id;
            const updatedAvailability = availability !== undefined ? availability : current.availability;
            const updatedDiscount = discount_percentage !== undefined ? discount_percentage : current.discount_percentage;
            let image_url = current.image_url;

            if (req.file) {
                image_url = `/uploads/${req.file.filename}`;
            }

            await pool.query(
                'UPDATE products SET name=?, description=?, price=?, category_id=?, availability=?, discount_percentage=?, image_url=? WHERE id=?',
                [updatedName, updatedDescription, updatedPrice, updatedCategoryId, updatedAvailability, updatedDiscount, image_url, id]
            );
            return res.json({ message: 'Product updated' });
        }

        try {
            await pool.query('ALTER TABLE dishes ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0.00');
            const [dishExist] = await pool.query('SELECT * FROM dishes WHERE id = ?', [id]);
            if (dishExist.length > 0) {
                await pool.query('UPDATE dishes SET discount_percentage=? WHERE id=?', [discount_percentage || 0, id]);
                return res.json({ message: 'Dish updated' });
            }
        } catch (e) {}

        try {
            await pool.query('ALTER TABLE beverages ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0.00');
            const [bevExist] = await pool.query('SELECT * FROM beverages WHERE id = ?', [id]);
            if (bevExist.length > 0) {
                await pool.query('UPDATE beverages SET discount_percentage=? WHERE id=?', [discount_percentage || 0, id]);
                return res.json({ message: 'Beverage updated' });
            }
        } catch (e) {}

        if (name) {
            await pool.query(
                'INSERT INTO products (name, description, price, availability, discount_percentage) VALUES (?, ?, ?, ?, ?)',
                [name, description || 'Freshly baked daily special with waste reduction markdown', price || 250, 'available', discount_percentage || 10]
            );
            return res.json({ message: 'Product created with discount' });
        }

        res.status(404).json({ message: 'Item not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
const deleteProduct = async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM product_categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO product_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product discount percentage
// @route   PUT /api/products/:id/discount
// @access  Private (Staff/Admin)
const updateProductDiscount = async (req, res) => {
    const { discount_percentage } = req.body;
    const { id } = req.params;

    try {
        await pool.query(
            'UPDATE products SET discount_percentage = ? WHERE id = ?',
            [discount_percentage !== undefined ? discount_percentage : 0, id]
        );
        res.json({ message: 'Product discount updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateProductDiscount
};
