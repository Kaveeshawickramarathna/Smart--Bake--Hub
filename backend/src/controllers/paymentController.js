const pool = require('../config/db');
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isRealStripeKey = stripeSecretKey && stripeSecretKey.startsWith('sk_') && !stripeSecretKey.includes('your_stripe_secret_key_here');
const stripe = isRealStripeKey ? new Stripe(stripeSecretKey) : null;

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
const currency = (process.env.STRIPE_CURRENCY || 'lkr').toLowerCase();

const createCheckoutSession = async (req, res) => {
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

        // If a real Stripe secret key is configured, create a real Stripe checkout session
        if (stripe) {
            try {
                const [items] = await pool.query(
                    `SELECT oi.quantity, oi.price, p.name as product_name, m.name as menu_name, b.name as beverage_name, oi.item_name
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
                        product_data: { name: item.item_name || item.menu_name || item.product_name || item.beverage_name || 'Order item' },
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

                return res.status(200).json({ url: session.url });
            } catch (stripeErr) {
                console.warn('Stripe API call failed, falling back to Demo payment mode:', stripeErr.message);
            }
        }

        // Fallback / Demo payment mode (when using placeholder key or demo mode)
        const demoSessionId = `demo_session_${orderId}_${Date.now()}`;
        await pool.query('UPDATE orders SET stripe_session_id = ? WHERE id = ?', [demoSessionId, orderId]);
        const demoUrl = `${frontendUrl}/checkout/demo?session_id=${demoSessionId}&orderId=${orderId}`;

        return res.status(200).json({ url: demoUrl });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ message: 'Failed to start payment', error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    const { sessionId } = req.params;

    try {
        // If it's a demo session
        if (sessionId.startsWith('demo_session_')) {
            const parts = sessionId.split('_');
            const orderId = parts[2];

            const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
            if (orders.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            await pool.query(
                "UPDATE orders SET payment_status = 'paid', payment_method = 'card' WHERE id = ?",
                [orderId]
            );
            return res.status(200).json({ paid: true, orderId: Number(orderId) });
        }

        // Otherwise check Stripe API if stripe instance is available
        if (stripe) {
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

            return res.status(200).json({ paid: false, orderId: Number(orderId) });
        }

        return res.status(400).json({ message: 'Unknown payment session' });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
    }
};

module.exports = { createCheckoutSession, confirmPayment };

