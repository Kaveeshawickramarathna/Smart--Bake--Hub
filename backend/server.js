const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const db = require('./src/config/db');

// Middleware
app.use(cors());
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
    });
})();
