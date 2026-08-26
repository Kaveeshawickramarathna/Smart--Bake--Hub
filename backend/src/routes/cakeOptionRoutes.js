const express = require('express');
const router = express.Router();
const cakeOptionController = require('../controllers/cakeOptionController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', cakeOptionController.getOptions);
router.post('/', verifyToken, isAdmin, cakeOptionController.addOption);
router.put('/:id/status', verifyToken, isAdmin, cakeOptionController.toggleStatus);
router.delete('/:id', verifyToken, isAdmin, cakeOptionController.deleteOption);

module.exports = router;
