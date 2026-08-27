const pool = require('../config/db');
const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
const currency = (process.env.STRIPE_CURRENCY || 'lkr').toLowerCase();

const createCheckoutSession = async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ message: 'Payments are not configured on this server yet.' });
    }

    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: 'orderId is required' });
    }

    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = orders[0];

        if (order.payment_status === 'paid') {
            return res.status(400).json({ message: 'This order has already been paid for' });
        }

        const [items] = await pool.query(
            `SELECT oi.quantity, oi.price, p.name as product_name, m.name as menu_name, b.name as beverage_name
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN dishes m ON oi.menu_id = m.id
             LEFT JOIN beverages b ON oi.beverage_id = b.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        const lineItems = items.map(item => ({
            price_data: {
                currency,
                product_data: { name: item.menu_name || item.product_name || item.beverage_name || 'Order item' },
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: lineItems,
            success_url: `${frontendUrl}/order/success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
            cancel_url: `${frontendUrl}/order?payment=cancelled`,
            metadata: { orderId: String(orderId) }
        });

        await pool.query('UPDATE orders SET stripe_session_id = ? WHERE id = ?', [session.id, orderId]);

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout session error:', error);
        res.status(500).json({ message: 'Failed to start payment', error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ message: 'Payments are not configured on this server yet.' });
    }

    const { sessionId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const orderId = session.metadata?.orderId;

        if (!orderId) {
            return res.status(400).json({ message: 'Session has no associated order' });
        }

        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (session.payment_status === 'paid') {
            await pool.query(
                "UPDATE orders SET payment_status = 'paid', payment_method = 'card' WHERE id = ?",
                [orderId]
            );
            return res.status(200).json({ paid: true, orderId: Number(orderId) });
        }

        res.status(200).json({ paid: false, orderId: Number(orderId) });
    } catch (error) {
        console.error('Stripe confirm payment error:', error);
        res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
    }
};

module.exports = { createCheckoutSession, confirmPayment };
