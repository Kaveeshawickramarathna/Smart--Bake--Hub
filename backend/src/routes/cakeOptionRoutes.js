const express = require('express');
const router = express.Router();
const cakeOptionController = require('../controllers/cakeOptionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', cakeOptionController.getOptions);
router.post('/', protect, admin, cakeOptionController.addOption);
router.put('/:id/status', protect, admin, cakeOptionController.toggleStatus);
router.delete('/:id', protect, admin, cakeOptionController.deleteOption);

module.exports = router;
