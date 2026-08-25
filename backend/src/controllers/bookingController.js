const pool = require('../config/db');

// @desc    Create an event booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const {
        customer_name,
        customer_email,
        customer_phone,
        event_type,
        event_date,
        start_time,
        end_time,
        guest_count,
        hall_name,
        package_name,
        add_ons,
        total_price,
        special_notes
    } = req.body;

    const user_id = req.user ? req.user.id : null;

    try {
        // Validate required fields
        if (!customer_name || !customer_email || !customer_phone || !event_type || !event_date || !start_time || !end_time || !guest_count || !hall_name || !package_name || !total_price) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate business hours
        if (start_time < '09:00' || end_time > '22:00') {
            return res.status(400).json({ message: 'Bookings are only allowed between 09:00 AM and 10:00 PM.' });
        }

        // Check if the selected hall is already booked for the given date and time overlap
        const [existing] = await pool.query(
            `SELECT id FROM bookings 
             WHERE event_date = ? 
             AND hall_name = ? 
             AND status != ? 
             AND (start_time < ? AND end_time > ?)`,
            [event_date, hall_name, 'cancelled', end_time, start_time]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'The selected hall is already booked for the chosen time slot.' });
        }

        // Convert add_ons array/object to JSON string for storage
        const addOnsStr = add_ons ? JSON.stringify(add_ons) : null;

        const [result] = await pool.query(
            `INSERT INTO bookings (user_id, customer_name, customer_email, customer_phone, event_type, event_date, event_session, start_time, end_time, guest_count, hall_name, package_name, add_ons, total_price, special_notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, customer_name, customer_email, customer_phone, event_type, event_date, 'Custom', start_time, end_time, guest_count, hall_name, package_name, addOnsStr, total_price, special_notes || null]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Your event booking inquiry has been submitted successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's event bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(
            'SELECT * FROM bookings WHERE user_id = ? ORDER BY event_date DESC',
            [req.user.id]
        );
        
        // Parse add_ons back to JSON object if stringified
        const formatted = bookings.map(b => ({
            ...b,
            add_ons: b.add_ons ? JSON.parse(b.add_ons) : []
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all event bookings (Admin/Staff only)
// @route   GET /api/bookings/admin
// @access  Private (Admin/Staff)
const getAllBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(
            'SELECT * FROM bookings ORDER BY event_date DESC'
        );

        // Parse add_ons
        const formatted = bookings.map(b => ({
            ...b,
            add_ons: b.add_ons ? JSON.parse(b.add_ons) : []
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status (Admin/Staff only)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin/Staff)
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid booking status' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM bookings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Booking status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a booking (Admin only)
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
const deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query('SELECT id FROM bookings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check hall availability for a date/session
// @route   GET /api/bookings/check-availability
// @access  Public
const checkAvailability = async (req, res) => {
    const { date, start_time, end_time, hall } = req.query;

    if (!date || !start_time || !end_time || !hall) {
        return res.status(400).json({ message: 'Please specify date, start time, end time, and hall' });
    }

    if (start_time < '09:00' || end_time > '22:00') {
        return res.status(400).json({ message: 'Bookings are only allowed between 09:00 AM and 10:00 PM.' });
    }

    try {
        const [existing] = await pool.query(
            `SELECT id FROM bookings 
             WHERE event_date = ? 
             AND hall_name = ? 
             AND status != ? 
             AND (start_time < ? AND end_time > ?)`,
            [date, hall, 'cancelled', end_time, start_time]
        );

        res.json({ available: existing.length === 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booked time slots for a specific date and hall
// @route   GET /api/bookings/booked-slots
// @access  Public
const getBookedSlots = async (req, res) => {
    const { date, hall } = req.query;

    if (!date || !hall) {
        return res.status(400).json({ message: 'Please specify date and hall' });
    }

    try {
        const [existing] = await pool.query(
            `SELECT start_time, end_time FROM bookings 
             WHERE event_date = ? 
             AND hall_name = ? 
             AND status NOT IN ('cancelled', 'rejected')
             ORDER BY start_time ASC`,
            [date, hall]
        );

        res.json({ bookedSlots: existing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booked halls for a specific date and time range
// @route   GET /api/bookings/booked-halls
// @access  Public
const getBookedHalls = async (req, res) => {
    const { date, start_time, end_time } = req.query;

    if (!date || !start_time || !end_time) {
        return res.status(400).json({ message: 'Please specify date, start time, and end time' });
    }

    try {
        const [existing] = await pool.query(
            `SELECT DISTINCT hall_name FROM bookings 
             WHERE event_date = ? 
             AND status NOT IN ('cancelled', 'rejected')
             AND (start_time < ? AND end_time > ?)`,
            [date, end_time, start_time]
        );

        res.json({ bookedHalls: existing.map(row => row.hall_name) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
    checkAvailability,
    getBookedSlots,
    getBookedHalls
};
