const pool = require('../config/db');

const getNotifications = async (req, res) => {
    try {
        let query = 'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50';
        let params = [];

        if (req.user.role === 'admin' || req.user.role === 'staff') {
            query = 'SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 50';
        } else {
            query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
            params = [req.user.id];
        }

        const [notifications] = await pool.query(query, params);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        // Technically should check if notification belongs to user or if admin
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'staff') {
            await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id IS NULL');
        } else {
            await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
        }
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
