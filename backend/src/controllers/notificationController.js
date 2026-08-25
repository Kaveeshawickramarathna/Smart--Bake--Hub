const pool = require('../config/db');

const getNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.query(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
        );
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE');
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
