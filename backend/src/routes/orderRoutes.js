const express = require('express');
const router = express.Router();
const { placeOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/', protect, staff, getAllOrders);
router.get('/my-orders', protect, getMyOrders);
router.patch('/:id/status', protect, staff, updateOrderStatus);

module.exports = router;
