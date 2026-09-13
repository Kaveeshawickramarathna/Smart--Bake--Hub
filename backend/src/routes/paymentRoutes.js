const express = require('express');
const router = express.Router();
const { createCheckoutSession, confirmPayment } = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', optionalAuth, createCheckoutSession);
router.get('/confirm/:sessionId', optionalAuth, confirmPayment);

module.exports = router;
