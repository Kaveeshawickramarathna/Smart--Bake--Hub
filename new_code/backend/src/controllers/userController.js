const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, status, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'User status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        if (email && email !== user.email) {
            const [emailExists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            if (emailExists.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        let hashedPassword = user.password;
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return res.status(400).json({ message: 'Incorrect current password' });
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(newPassword, salt);
        }

        await pool.query(
            'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
            [name || user.name, email || user.email, hashedPassword, req.user.id]
        );

        res.json({
            id: user.id,
            name: name || user.name,
            email: email || user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminCreateUser = async (req, res) => {
    const { name, email, password, role = 'customer', status = 'active' } = req.body;
    try {
        const [userExists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, status]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role,
            status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminUpdateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        if (email && email !== user.email) {
            const [emailExists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            if (emailExists.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        await pool.query(
            'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?',
            [name || user.name, email || user.email, role || user.role, status || user.status, id]
        );

        res.json({
            id: parseInt(id),
            name: name || user.name,
            email: email || user.email,
            role: role || user.role,
            status: status || user.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { 
    getUsers, 
    updateUserStatus, 
    updateUserRole, 
    getUserProfile, 
    updateUserProfile, 
    adminCreateUser, 
    adminUpdateUser
};
