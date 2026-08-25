const express = require('express');
const router = express.Router();
const { generateForecast, getWasteSuggestions } = require('../controllers/aiController');

// In a real app, you would add auth middleware here (e.g., protect)
router.get('/forecast', generateForecast);
router.get('/waste-suggestions', getWasteSuggestions);

module.exports = router;
