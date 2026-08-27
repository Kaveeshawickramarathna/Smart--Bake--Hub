const express = require('express');
const router = express.Router();
const { 
    getBeverages, getBeverageById, createBeverage, updateBeverage, deleteBeverage, getNextBeverageCode, toggleBeverageStatus, toggleBeverageAvailability, getBeverageCategories, createBeverageCategory 
} = require('../controllers/beverageController');
const { protect, staff, admin } = require('../middleware/authMiddleware');

// Beverages
router.route('/')
    .get(getBeverages)
    .post(protect, staff, createBeverage);

router.route('/next-code')
    .get(protect, staff, getNextBeverageCode);

router.route('/categories')
    .get(getBeverageCategories)
    .post(protect, staff, createBeverageCategory);

router.route('/:id')
    .get(getBeverageById)
    .put(protect, staff, updateBeverage)
    .delete(protect, admin, deleteBeverage);

router.route('/:id/status')
    .put(protect, staff, toggleBeverageStatus);

router.route('/:id/availability')
    .put(protect, staff, toggleBeverageAvailability);

module.exports = router;
