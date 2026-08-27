const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendOtpEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const checkSetupStatus = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
        const count = parseInt(rows[0].count, 10);
        const isFirstSetup = count === 0;
        res.json({ isFirstSetup });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if there is an active admin in the system
        const [adminCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
        const count = parseInt(adminCount[0].count, 10);
        const isFirstUser = count === 0;
        
        // Force role: first user is always admin, subsequent are customers
        const role = isFirstUser ? 'admin' : 'customer';

        const [userExists] = await pool.query('SELECT id, status, role FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            if (userExists[0].status === 'pending_verification') {
                const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
                await pool.query('UPDATE users SET verification_token = ? WHERE id = ?', [verificationToken, userExists[0].id]);
                const emailSent = await sendOtpEmail(email, verificationToken);
                if (!emailSent) {
                    console.log(`\n=========================================\n[FALLBACK] YOUR OTP CODE FOR ${email} IS: [ ${verificationToken} ]\n=========================================\n`);
                }
                return res.status(200).json({
                    message: 'OTP sent to your email!',
                    id: userExists[0].id,
                    name,
                    email,
                    role: userExists[0].role,
                    status: 'pending_verification',
                    devOtp: !emailSent ? verificationToken : null
                });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const finalPassword = password || crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        // Everyone requires verification
        const status = 'pending_verification';
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, status, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, status, verificationToken]
        );
        
        // Send actual OTP email, fallback to console if it fails
        const emailSent = await sendOtpEmail(email, verificationToken);
        if (!emailSent) {
            console.log(`\n=========================================\n[FALLBACK] YOUR OTP CODE FOR ${email} IS: [ ${verificationToken} ]\n=========================================\n`);
        }

        res.status(201).json({
            message: 'Registration successful! Please check your email for the OTP.',
            id: result.insertId,
            name,
            email,
            role,
            status,
            devOtp: !emailSent ? verificationToken : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        if (user.status === 'pending_verification') {
            return res.status(403).json({ message: 'Please verify your email before logging in. Check your email (or terminal logs) for the link.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        if (user.status === 'active') {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        if (user.verification_token !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await pool.query(
                'UPDATE users SET status = ?, verification_token = NULL, password = ? WHERE id = ?',
                ['active', hashedPassword, user.id]
            );
        } else {
            await pool.query(
                'UPDATE users SET status = ?, verification_token = NULL WHERE id = ?',
                ['active', user.id]
            );
        }

        // Auto-login after successful verification
        res.status(200).json({
            message: 'Email verified successfully!',
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [users] = await pool.query('SELECT verification_token, status FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (users[0].status === 'active') {
            return res.status(400).json({ message: 'Account is already verified' });
        }
        if (users[0].verification_token !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }
        res.json({ valid: true, message: 'OTP is valid' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        if (user.status === 'active') {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.query(
            'UPDATE users SET verification_token = ? WHERE id = ?',
            [newOtp, user.id]
        );

        const emailSent = await sendOtpEmail(email, newOtp);
        if (!emailSent) {
            console.log(`\n=========================================\n[FALLBACK - RESEND] YOUR OTP CODE FOR ${email} IS: [ ${newOtp} ]\n=========================================\n`);
        }

        res.status(200).json({ 
            message: 'A new OTP has been sent to your email.',
            devOtp: !emailSent ? newOtp : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
            [resetToken, tokenExpiry, email]
        );

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        console.log(`\n=========================================\nPASSWORD RESET LINK for ${email}:\n${resetUrl}\n=========================================\n`);

        res.json({ message: 'Password reset link simulated! Check server console log.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = users[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword, checkSetupStatus, checkOtp };
