const express = require('express');
const router = express.Router();
const { 
    getSalesReport,
    getPaymentReport,
    getInventoryReport,
    getBookingReport,
    getFoodWasteReport
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/sales', protect, admin, getSalesReport);
router.get('/payments', protect, admin, getPaymentReport);
router.get('/inventory', protect, admin, getInventoryReport);
router.get('/bookings', protect, admin, getBookingReport);
router.get('/waste', protect, admin, getFoodWasteReport);

module.exports = router;
