const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    updateUserStatus, 
    updateUserRole, 
    getUserProfile, 
    updateUserProfile, 
    adminCreateUser, 
    adminUpdateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// User self profile routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin-only user management routes
router.route('/')
    .get(protect, admin, getUsers)
    .post(protect, admin, adminCreateUser);

router.route('/:id')
    .put(protect, admin, adminUpdateUser);

router.route('/:id/status')
    .put(protect, admin, updateUserStatus);

router.route('/:id/role')
    .put(protect, admin, updateUserRole);

module.exports = router;
