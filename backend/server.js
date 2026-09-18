const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const db = require('./src/config/db');

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const beverageRoutes = require('./src/routes/beverageRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const cateringRoutes = require('./src/routes/cateringRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const addonRoutes = require('./src/routes/addonRoutes');
const cakeDesignRoutes = require('./src/routes/cakeDesignRoutes');
const cakeOptionRoutes = require('./src/routes/cakeOptionRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const { initAiScheduler } = require('./src/utils/aiScheduler');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/beverages', beverageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/addons', addonRoutes);
app.use('/api/cake-designs', cakeDesignRoutes);
app.use('/api/cake-options', cakeOptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.get('/', (req, res) => {
    res.send('Smart Bake Hub API is running...');
});

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await db.ready;
    } catch (error) {
        console.warn('Database connection failed. Starting server in degraded mode.');
        console.warn(error && error.message ? error.message : error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        initAiScheduler();
    });
})();
