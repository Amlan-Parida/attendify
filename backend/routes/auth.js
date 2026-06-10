const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateSettings, verifyOTP, resendOTP, forgotPassword, resetPassword, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);
module.exports = router;
