const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword, checkSetupStatus, checkOtp } = require('../controllers/authController');

router.get('/setup-status', checkSetupStatus);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/check-otp', checkOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
