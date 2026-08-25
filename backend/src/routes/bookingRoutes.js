const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
    checkAvailability,
    getBookedSlots,
    getBookedHalls
} = require('../controllers/bookingController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

// Public availability check
router.get('/check-availability', checkAvailability);
router.get('/booked-slots', getBookedSlots);
router.get('/booked-halls', getBookedHalls);

// Customer bookings
router.route('/')
    .post(protect, createBooking)
    .get(protect, getUserBookings);

// Admin bookings dashboard routes
router.get('/admin', protect, staff, getAllBookings);

router.route('/:id/status')
    .put(protect, staff, updateBookingStatus);

router.route('/:id')
    .delete(protect, admin, deleteBooking);

module.exports = router;
