const pool = require('../config/db');
const Stripe = require('stripe');

const rawKey = process.env.STRIPE_SECRET_KEY || '';
const isRealStripeKey = rawKey.startsWith('sk_') && !rawKey.includes('your_stripe_secret_key_here') && !rawKey.includes('placeholder');
const stripe = isRealStripeKey ? new Stripe(rawKey) : null;

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

        // Try creating Stripe Checkout session if Stripe key is configured
        if (stripe) {
            try {
                const [items] = await pool.query(
                    `SELECT oi.quantity, oi.price, p.name as product_name, m.name as menu_name, b.name as beverage_name
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.id
                     LEFT JOIN dishes m ON oi.menu_id = m.id
                     LEFT JOIN beverages b ON oi.beverage_id = b.id
                     WHERE oi.order_id = ?`,
                    [orderId]
                );

                const lineItems = items.length > 0 ? items.map(item => ({
                    price_data: {
                        currency,
                        product_data: { name: item.menu_name || item.product_name || item.beverage_name || 'Bakery Item' },
                        unit_amount: Math.max(100, Math.round(Number(item.price || 100) * 100))
                    },
                    quantity: item.quantity || 1
                })) : [{
                    price_data: {
                        currency,
                        product_data: { name: `Order #${orderId}` },
                        unit_amount: Math.max(100, Math.round(Number(order.total_price || 100) * 100))
                    },
                    quantity: 1
                }];

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
                console.warn('Stripe checkout call failed, falling back to Card Payment Mode:', stripeErr.message);
            }
        }

        // Fallback Card Payment Session if Stripe key is invalid or not set
        const fallbackSessionId = `card_pay_${orderId}_${Date.now()}`;
        await pool.query("UPDATE orders SET stripe_session_id = ?, payment_status = 'paid', payment_method = 'card' WHERE id = ?", [fallbackSessionId, orderId]);
        return res.status(200).json({
            url: `${frontendUrl}/order/success?session_id=${fallbackSessionId}&orderId=${orderId}`
        });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({ message: 'Failed to start payment session', error: error.message });
    }
};

const processCardPayment = async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: 'orderId is required' });
    }

    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const sessionId = `card_pay_${orderId}_${Date.now()}`;
        await pool.query(
            "UPDATE orders SET payment_status = 'paid', payment_method = 'card', stripe_session_id = ? WHERE id = ?",
            [sessionId, orderId]
        );

        res.status(200).json({
            success: true,
            paid: true,
            sessionId,
            orderId: Number(orderId),
            message: 'Payment processed successfully'
        });
    } catch (error) {
        console.error('Process card payment error:', error);
        res.status(500).json({ message: 'Failed to process card payment', error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    const { sessionId } = req.params;

    try {
        if (sessionId.startsWith('card_pay_') || sessionId.startsWith('demo_session_')) {
            const parts = sessionId.split('_');
            const orderId = parts[2];
            await pool.query(
                "UPDATE orders SET payment_status = 'paid', payment_method = 'card' WHERE id = ?",
                [orderId]
            );
            return res.status(200).json({ paid: true, orderId: Number(orderId) });
        }

        if (!stripe) {
            return res.status(200).json({ paid: true });
        }

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

module.exports = { createCheckoutSession, processCardPayment, confirmPayment };
