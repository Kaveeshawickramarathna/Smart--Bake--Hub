const express = require('express');
const router = express.Router();
const { 
    getMenus, getMenuById, createMenu, updateMenu, deleteMenu, getNextDishCode, toggleMenuStatus, toggleMenuAvailability, getDishCategories, createDishCategory 
} = require('../controllers/menuController');
const { protect, staff, admin } = require('../middleware/authMiddleware');

// Menus
router.route('/')
    .get(getMenus)
    .post(protect, staff, createMenu);

router.route('/next-code')
    .get(protect, staff, getNextDishCode);

router.route('/categories')
    .get(getDishCategories)
    .post(protect, staff, createDishCategory);

router.route('/:id')
    .get(getMenuById)
    .put(protect, staff, updateMenu)
    .delete(protect, admin, deleteMenu);

router.route('/:id/status')
    .put(protect, staff, toggleMenuStatus);

router.route('/:id/availability')
    .put(protect, staff, toggleMenuAvailability);

module.exports = router;
