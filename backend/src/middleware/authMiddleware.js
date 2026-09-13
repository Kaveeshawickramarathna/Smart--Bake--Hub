const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user no longer exists. Please log out and log in again.' });
            }
            
            req.user = users[0];
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const staff = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as staff' });
    }
};

const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
            if (users.length > 0) {
                req.user = users[0];
                return next();
            }
        } catch (error) {
            // Token error, fallback to guest mode
        }
    }
    
    try {
        const [guests] = await pool.query('SELECT * FROM users WHERE role = "customer" ORDER BY id ASC LIMIT 1');
        if (guests.length > 0) {
            req.user = guests[0];
        } else {
            req.user = { id: 1, name: 'Guest Customer', role: 'customer' };
        }
    } catch (e) {
        req.user = { id: 1, name: 'Guest Customer', role: 'customer' };
    }
    next();
};

module.exports = { protect, optionalAuth, admin, staff };
