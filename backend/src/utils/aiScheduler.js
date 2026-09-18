const db = require('../config/db');

let isRunning = false;
let lastRunDate = null;

/**
 * Ensure system_settings table exists and seed defaults
 */
const initSettingsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            INSERT INTO system_settings (setting_key, setting_value)
            VALUES 
                ('ai_daily_run_time', '00:00'),
                ('ai_auto_run_enabled', 'true')
            ON DUPLICATE KEY UPDATE setting_key = setting_key
        `);
    } catch (err) {
        console.error('[AI Scheduler] Failed to initialize system_settings table:', err.message);
    }
};

const getSetting = async (key, defaultValue = '') => {
    try {
        const [rows] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = ?', [key]);
        if (rows.length > 0) return rows[0].setting_value;
        return defaultValue;
    } catch (err) {
        return defaultValue;
    }
};

const setSetting = async (key, value) => {
    await db.query(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP',
        [key, String(value)]
    );
};

const getAllSettings = async () => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value, updated_at FROM system_settings');
        const map = {
            ai_daily_run_time: '00:00',
            ai_auto_run_enabled: 'true',
            ai_last_run_timestamp: null,
            ai_last_run_status: 'Ready'
        };
        rows.forEach(r => {
            map[r.setting_key] = r.setting_value;
        });
        return map;
    } catch (err) {
        return {
            ai_daily_run_time: '00:00',
            ai_auto_run_enabled: 'true',
            ai_last_run_timestamp: null,
            ai_last_run_status: 'Ready'
        };
    }
};

/**
 * Execute the automated daily AI computation
 */
const triggerDailyAiRun = async (isManual = false) => {
    if (isRunning) {
        console.log('[AI Scheduler] AI calculations already running. Skipping duplicate trigger.');
        return { message: 'AI calculation already in progress' };
    }

    isRunning = true;
    const now = new Date();
    try {
        console.log(`[AI Scheduler] Starting ${isManual ? 'MANUAL' : 'SCHEDULED'} daily AI calculation at ${now.toISOString()}...`);
        
        // Lazy load aiController to avoid circular dependency
        const { runDailyAiCalculations } = require('../controllers/aiController');
        if (typeof runDailyAiCalculations === 'function') {
            await runDailyAiCalculations(true);
        }

        const timestampStr = now.toISOString();
        await setSetting('ai_last_run_timestamp', timestampStr);
        await setSetting('ai_last_run_status', 'Success');

        // Create Admin Notification
        try {
            await db.query(
                'INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)',
                [
                    'Daily AI Analysis Completed',
                    `Daily AI demand forecasting and waste reduction analysis ran successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                    'ai'
                ]
            );
        } catch (notifErr) {
            console.warn('[AI Scheduler] Notification insert warning:', notifErr.message);
        }

        console.log(`[AI Scheduler] Daily AI calculation completed successfully.`);
        return { success: true, timestamp: timestampStr };
    } catch (error) {
        console.error('[AI Scheduler] Daily AI calculation failed:', error);
        await setSetting('ai_last_run_status', `Error: ${error.message}`);
        throw error;
    } finally {
        isRunning = false;
    }
};

/**
 * Background loop checking time every 30 seconds
 */
const checkAndRunSchedule = async () => {
    try {
        const enabled = await getSetting('ai_auto_run_enabled', 'true');
        if (enabled !== 'true') return;

        const scheduledTime = await getSetting('ai_daily_run_time', '00:00'); // format "HH:mm"
        
        // Get current local time "HH:mm" and date "YYYY-MM-DD"
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        const todayDate = now.toISOString().slice(0, 10);

        if (currentTime === scheduledTime && lastRunDate !== todayDate) {
            lastRunDate = todayDate;
            console.log(`[AI Scheduler] Scheduled time (${scheduledTime}) reached for ${todayDate}. Triggering daily AI job...`);
            await triggerDailyAiRun(false);
        }
    } catch (err) {
        console.error('[AI Scheduler] Error during schedule check:', err.message);
    }
};

const initAiScheduler = async () => {
    await initSettingsTable();
    console.log('[AI Scheduler] Initialized. Checking schedule every 30 seconds...');
    // Run check every 30s
    setInterval(checkAndRunSchedule, 30 * 1000);
};

module.exports = {
    initAiScheduler,
    getSetting,
    setSetting,
    getAllSettings,
    triggerDailyAiRun
};
