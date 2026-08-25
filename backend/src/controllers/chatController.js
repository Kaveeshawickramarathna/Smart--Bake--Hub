const pool = require('../config/db');

// Customer Endpoints
const initSession = async (req, res) => {
    const { session_id, user_id, customer_name } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM chat_sessions WHERE session_id = ?', [session_id]);
        if (existing.length === 0) {
            await pool.query(
                'INSERT INTO chat_sessions (session_id, user_id, customer_name, status) VALUES (?, ?, ?, ?)',
                [session_id, user_id || null, customer_name || 'Guest', 'bot']
            );
            
            // Send initial bot greeting
            const greeting = "Hello! Welcome to Smart Bake Hub. How can I help you today?";
            await pool.query(
                'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
                [session_id, 'bot', greeting]
            );
        }
        res.json({ message: 'Session initialized' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    const { session_id } = req.params;
    try {
        const [messages] = await pool.query('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [session_id]);
        const [sessions] = await pool.query('SELECT status FROM chat_sessions WHERE session_id = ?', [session_id]);
        
        res.json({ 
            messages, 
            status: sessions.length > 0 ? sessions[0].status : 'unknown'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    const { session_id } = req.params;
    const { message, sender } = req.body; // sender should be 'customer'
    try {
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
            [session_id, sender || 'customer', message]
        );
        
        // Update session timestamp
        await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?', [session_id]);

        res.json({ message: 'Message sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const triggerBotReply = async (req, res) => {
    const { session_id } = req.params;
    const { keyword } = req.body;
    try {
        let reply = "I'm not sure about that. Would you like to talk to an admin?";
        
        if (keyword === 'hours') {
            reply = "We are open from 8:00 AM to 8:00 PM every day!";
        } else if (keyword === 'menu') {
            reply = "You can view our menu by navigating to the 'Menu' page from the top navigation bar.";
        } else if (keyword === 'delivery') {
            reply = "We offer both takeaway and dine-in. Delivery options are available for special event bookings.";
        } else if (keyword === 'contact') {
            reply = "You can contact us at 076 8633044 or email us at wijayabakehouse@gmail.com.";
        }

        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
            [session_id, 'bot', reply]
        );

        res.json({ message: 'Bot replied' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const requestAdmin = async (req, res) => {
    const { session_id } = req.params;
    try {
        await pool.query('UPDATE chat_sessions SET status = ? WHERE session_id = ?', ['admin_requested', session_id]);
        
        const reply = "Please wait, an admin will be with you shortly.";
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
            [session_id, 'bot', reply]
        );

        res.json({ message: 'Admin requested' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Endpoints
const getActiveSessions = async (req, res) => {
    try {
        const [sessions] = await pool.query(`
            SELECT c.*, 
            (SELECT message FROM chat_messages m WHERE m.session_id = c.session_id ORDER BY m.created_at DESC LIMIT 1) as last_message 
            FROM chat_sessions c 
            WHERE status != 'closed' 
            ORDER BY updated_at DESC
        `);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendAdminReply = async (req, res) => {
    const { session_id } = req.params;
    const { message } = req.body;
    try {
        await pool.query('UPDATE chat_sessions SET status = ? WHERE session_id = ?', ['admin_active', session_id]);
        
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
            [session_id, 'admin', message]
        );
        res.json({ message: 'Admin reply sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const closeSession = async (req, res) => {
    const { session_id } = req.params;
    try {
        await pool.query('UPDATE chat_sessions SET status = ? WHERE session_id = ?', ['closed', session_id]);
        res.json({ message: 'Session closed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    initSession,
    getMessages,
    sendMessage,
    triggerBotReply,
    requestAdmin,
    getActiveSessions,
    sendAdminReply,
    closeSession
};
