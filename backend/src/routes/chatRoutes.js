const express = require('express');
const router = express.Router();
const {
    initSession,
    getMessages,
    sendMessage,
    triggerBotReply,
    requestAdmin,
    getActiveSessions,
    sendAdminReply,
    closeSession
} = require('../controllers/chatController');
const { protect, staff } = require('../middleware/authMiddleware');

// Customer Routes
router.post('/init', initSession);
router.get('/:session_id/messages', getMessages);
router.post('/:session_id/send', sendMessage);
router.post('/:session_id/bot-reply', triggerBotReply);
router.post('/:session_id/request-admin', requestAdmin);

// Admin Routes (Protected by auth middleware)
router.get('/admin/sessions', protect, staff, getActiveSessions);
router.post('/admin/:session_id/reply', protect, staff, sendAdminReply);
router.post('/admin/:session_id/close', protect, staff, closeSession);

module.exports = router;
