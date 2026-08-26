const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const { getCakeDesigns, createCakeDesign, updateCakeDesignStatus, deleteCakeDesign } = require('../controllers/cakeDesignController');

router.get('/', getCakeDesigns);
router.post('/', protect, admin, upload.single('image'), createCakeDesign);
router.put('/:id/status', protect, admin, updateCakeDesignStatus);
router.delete('/:id', protect, admin, deleteCakeDesign);

module.exports = router;
