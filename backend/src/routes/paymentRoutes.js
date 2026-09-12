const express = require('express');
const router = express.Router();
const { createCheckoutSession, processCardPayment, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/process-card', protect, processCardPayment);
router.get('/confirm/:sessionId', protect, confirmPayment);

module.exports = router;
