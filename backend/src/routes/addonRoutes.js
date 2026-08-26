const express = require('express');
const router = express.Router();
const { getAddons, createAddon, updateAddonStatus } = require('../controllers/addonController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAddons);
router.post('/', protect, admin, createAddon);
router.put('/:id/status', protect, admin, updateAddonStatus);

module.exports = router;
