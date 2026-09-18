const pool = require('../config/db');
const { sendChatCompletion } = require('../utils/aiGateway');

/**
 * Look up order status if an order number is mentioned in customer message
 */
const lookupOrderSummary = async (text) => {
    if (!text) return null;
    const match = text.match(/#?(\d{1,6})/);
    if (!match) return null;

    const orderId = match[1];
    try {
        const [orders] = await pool.query('SELECT id, status, total_amount, created_at FROM orders WHERE id = ?', [orderId]);
        if (orders.length > 0) {
            const o = orders[0];
            return `Order #${o.id} is currently [${o.status.toUpperCase()}]. Total: Rs. ${Number(o.total_amount).toFixed(2)}. Placed on ${new Date(o.created_at).toLocaleDateString()}.`;
        }
    } catch (e) {
        // ignore lookup errors
    }
    return null;
};

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
            
            // Initial AI bot greeting
            const greeting = "Hello! Welcome to Smart Bake Hub. How can I help you today with our bakery items, custom cakes, or event bookings?";
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

/**
 * Generate intelligent AI bot reply using gpt-5.6-luna
 */
const triggerBotReply = async (req, res) => {
    const { session_id } = req.params;
    const { keyword, message: userMsg } = req.body;

    try {
        // Check session status first: if human admin is engaged, skip bot reply
        const [sessions] = await pool.query('SELECT status FROM chat_sessions WHERE session_id = ?', [session_id]);
        const currentStatus = sessions.length > 0 ? sessions[0].status : 'bot';
        if (currentStatus === 'admin_requested' || currentStatus === 'admin_active' || currentStatus === 'closed') {
            return res.json({ message: 'Session handled by admin or closed', status: currentStatus });
        }

        // Fast-path for quick action buttons
        if (keyword === 'hours') {
            const hoursReply = "We are open from 8:00 AM to 8:00 PM every day! Fresh bakery items and meals are served all day.";
            await pool.query('INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)', [session_id, 'bot', hoursReply]);
            return res.json({ message: 'Bot replied', reply: hoursReply });
        }

        if (keyword === 'delivery') {
            const deliveryReply = "We offer Dine-In, Quick Takeaway, and event catering delivery. You can order online through our digital menu or book our catering services!";
            await pool.query('INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)', [session_id, 'bot', deliveryReply]);
            return res.json({ message: 'Bot replied', reply: deliveryReply });
        }

        // Fetch recent conversation history (last 8 messages)
        const [recentMessages] = await pool.query(
            'SELECT sender, message FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 8',
            [session_id]
        );
        const conversationHistory = recentMessages.reverse().map(m => ({
            role: m.sender === 'customer' ? 'user' : 'assistant',
            content: m.message
        }));

        // Determine current customer message
        const currentQuery = userMsg || (conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : 'Hello');

        // Check for order status lookup
        const orderInfo = await lookupOrderSummary(currentQuery);

        // System prompt with bakery domain knowledge
        const systemPrompt = `
You are the intelligent AI Virtual Assistant for Smart Bake Hub (Wijayasiri Fresh Food Pvt Ltd).
You provide warm, polite, and concise answers (maximum 2-3 sentences).

Bakery Knowledge & Services:
- Products: Artisan breads, sourdough, croissants, buns, pastries, custom celebratory cakes, meals, and fresh beverages.
- Smart Deals: Special daily markdowns and discounted items available in the "Smart Deals" menu section.
- Custom Cake Orders: Customers can customize cake designs, tiers, flavors, and icing messages.
- Event Bookings: 3 spaces available (Grand Ballroom - 300 capacity, Sapphire Hall - 150 capacity, Ruby Garden - 100 capacity). Advance booking and deposit required.
- Hours & Location: Open 8:00 AM - 8:00 PM every day. Phone: 076 8633044, Email: wijayabakehouse@gmail.com.
- Payment Options: Cash, Card, Stripe online payments, and QR code pay.
${orderInfo ? `Live Order Database Lookup Result: ${orderInfo}` : ''}

Guidelines:
- Keep responses friendly, helpful, and concise.
- If the customer wants human help or has a complex dispute, invite them to click "Talk to Admin".
`;

        let reply = "Hello! How can I assist you with your bakery order or booking today?";

        try {
            const aiMessages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory
            ];

            // If the latest message isn't in history yet, append it
            if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].content !== currentQuery) {
                aiMessages.push({ role: 'user', content: currentQuery });
            }

            const aiResponse = await sendChatCompletion({
                messages: aiMessages,
                temperature: 0.6,
                max_tokens: 200
            });

            if (aiResponse && aiResponse.content) {
                reply = aiResponse.content.trim();
            }
        } catch (aiErr) {
            console.warn('[AI Chatbot] Gateway response failed, falling back to smart heuristic:', aiErr.message);
            if (orderInfo) {
                reply = orderInfo;
            } else if (currentQuery.toLowerCase().includes('cake')) {
                reply = "We craft custom birthday and wedding cakes! You can browse our cake designs or request custom icing and flavors directly through our website.";
            } else if (currentQuery.toLowerCase().includes('event') || currentQuery.toLowerCase().includes('book')) {
                reply = "We offer 3 beautiful event spaces: Grand Ballroom (300 guests), Sapphire Hall (150 guests), and Ruby Garden (100 guests). Visit our Event Booking page to reserve!";
            } else {
                reply = "Thank you for reaching out! We are delighted to serve you. You can browse our fresh menu, check today's Smart Deals, or click 'Talk to Admin' if you need direct assistance.";
            }
        }

        // Save AI reply into chat_messages
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
            [session_id, 'bot', reply]
        );

        res.json({ message: 'Bot replied', reply });
    } catch (error) {
        console.error('Bot reply error:', error);
        res.status(500).json({ message: error.message });
    }
};

const requestAdmin = async (req, res) => {
    const { session_id } = req.params;
    try {
        await pool.query('UPDATE chat_sessions SET status = ? WHERE session_id = ?', ['admin_requested', session_id]);
        
        const reply = "Please wait, an admin has been notified and will be with you shortly.";
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
