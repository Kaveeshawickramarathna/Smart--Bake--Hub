const express = require('express');
const router = express.Router();
const { protect, admin, staff } = require('../middleware/authMiddleware');
const { getAllSettings, setSetting, triggerDailyAiRun } = require('../utils/aiScheduler');

// GET /api/settings - Read system settings
router.get('/', protect, staff, async (req, res) => {
    try {
        const settings = await getAllSettings();
        res.status(200).json(settings);
    } catch (error) {
        console.error('Failed to get settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

// PUT /api/settings - Update a setting
router.put('/', protect, admin, async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) {
            return res.status(400).json({ message: 'Setting key is required' });
        }

        // Validate time format if key is ai_daily_run_time (HH:mm)
        if (key === 'ai_daily_run_time') {
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(value)) {
                return res.status(400).json({ message: 'Invalid time format. Please use 24-hour HH:mm (e.g., 00:00 or 14:30)' });
            }
        }

        await setSetting(key, value);
        const updated = await getAllSettings();
        res.status(200).json({ message: `Setting ${key} updated successfully`, settings: updated });
    } catch (error) {
        console.error('Failed to update setting:', error);
        res.status(500).json({ message: 'Failed to update setting' });
    }
});

// POST /api/settings/run-ai-now - Trigger AI execution immediately
router.post('/run-ai-now', protect, admin, async (req, res) => {
    try {
        const result = await triggerDailyAiRun(true);
        res.status(200).json({ message: 'AI calculations executed successfully', result });
    } catch (error) {
        console.error('Failed to run AI now:', error);
        res.status(500).json({ message: 'Failed to run AI calculations', error: error.message });
    }
});

module.exports = router;
