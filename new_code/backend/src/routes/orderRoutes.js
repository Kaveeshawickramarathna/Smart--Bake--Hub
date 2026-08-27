const express = require('express');
const router = express.Router();
const { placeOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/', protect, admin, getAllOrders);
router.get('/my-orders', protect, getMyOrders);
router.patch('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
