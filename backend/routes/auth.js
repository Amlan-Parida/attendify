const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateSettings, verifyOtp, resendOtp } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);

module.exports = router;
