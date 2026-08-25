const express = require('express');
const router = express.Router();
const { 
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addTransaction,
    getInventoryAlerts 
} = require('../controllers/inventoryController');

// Ensure you have authentication/authorization middleware if needed.
// For now, these are basic routes. You can add protect/admin middleware as needed.
// const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getInventoryItems)
    .post(createInventoryItem);

router.route('/alerts')
    .get(getInventoryAlerts);

router.route('/transaction')
    .post(addTransaction);

router.route('/:id')
    .get(getInventoryItemById)
    .put(updateInventoryItem)
    .delete(deleteInventoryItem);

module.exports = router;
