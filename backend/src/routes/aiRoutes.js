const express = require('express');
const router = express.Router();
const { generateForecast, getWasteSuggestions } = require('../controllers/aiController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.get('/forecast', protect, admin, generateForecast);
router.get('/waste', protect, staff, getWasteSuggestions);
router.get('/waste-suggestions', protect, staff, getWasteSuggestions);

module.exports = router;
