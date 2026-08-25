const pool = require('../config/db');

// @desc    Get all products
const getProducts = async (req, res) => {
    try {
        const { keyword, category, discounted } = req.query;
        const userRole = req.user?.role || 'customer'; // Get user role from token or default to customer
        
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

        if (discounted === 'true') {
            query += ' AND p.discount_percentage > 0 ORDER BY p.discount_percentage DESC';
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
    const { name, description, price, category_id, availability, discount_percentage } = req.body;
    const { id } = req.params;

    try {
        let query = 'UPDATE products SET name=?, description=?, price=?, category_id=?, availability=?, discount_percentage=?';
        let params = [name, description, price, category_id || null, availability || 'available', discount_percentage || 0];

        if (req.file) {
            query += ', image_url=?';
            params.push(`/uploads/${req.file.filename}`);
        }

        query += ' WHERE id=?';
        params.push(id);

        await pool.query(query, params);
        res.json({ message: 'Product updated' });
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
