const express = require('express');
const router = express.Router();
const { getCateringPackages, createCateringPackage, deleteCateringPackage, toggleCateringPackageStatus } = require('../controllers/cateringController');

// Routes
router.get('/', getCateringPackages);
router.post('/', createCateringPackage);
router.delete('/:id', deleteCateringPackage);
router.put('/:id/status', toggleCateringPackageStatus);

module.exports = router;
