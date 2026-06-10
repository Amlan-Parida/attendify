const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Helper to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    console.log('SIGNUP ATTEMPT:', { name, email });
    const existingUser = await User.findOne({ email });
    console.log('EXISTING USER CHECK:', !!existingUser);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    console.log('CREATING USER...');
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const user = await User.create({ 
      name, 
      email, 
      password,
      isVerified: false,
      otp,
      otpExpires
    });
    console.log('USER CREATED (Unverified):', user._id);

    // Send Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to Attendify!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address and complete your registration:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; color: #111827; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        await sendEmail({
          email: user.email,
          subject: 'Attendify - Verify Your Email',
          html: emailHtml,
        });
      } else {
        console.warn('⚠️ SMTP credentials not set. Falling back to console OTP logging.');
        console.log(`\n============================\n🔐 DEVELOPMENT OTP FOR ${user.email}: ${otp}\n============================\n`);
      }
    } catch (err) {
      console.error('Email sending failed, but user was created:', err);
      // We don't fail the request, we just let them use the resend button later
    }

    res.status(201).json({
      message: 'User registered. Please verify your email.',
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('CRITICAL SIGNUP ERROR:', error);
    // Handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({ message });
    }
    // Handle Duplicate Key Errors
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }
    res.status(500).json({ 
      message: 'Server error during signup', 
      debug: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address first', 
        requiresVerification: true,
        email: user.email 
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
      sessionEndDate: user.sessionEndDate,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    onboardingComplete: req.user.onboardingComplete,
    sessionEndDate: req.user.sessionEndDate,
  });
};

// @desc    Update user settings (e.g. sessionEndDate)
// @route   PUT /api/auth/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { sessionEndDate, college, year, section, onboardingComplete } = req.body;
    const user = await User.findById(req.user._id);
    
    if (sessionEndDate) {
      user.sessionEndDate = new Date(sessionEndDate);
    }
    if (college !== undefined) user.college = college;
    if (year !== undefined) user.year = year;
    if (section !== undefined) user.section = section;
    if (onboardingComplete !== undefined) user.onboardingComplete = onboardingComplete;
    
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      year: user.year,
      section: user.section,
      onboardingComplete: user.onboardingComplete,
      sessionEndDate: user.sessionEndDate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating settings', error: error.message });
  }
};

// @desc    Verify Email via OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // OTP is valid
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { isVerified: true },
        $unset: { otp: 1, otpExpires: 1 }
      }
    );

    res.status(200).json({
      message: 'Email verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
      sessionEndDate: user.sessionEndDate,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await User.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpires } }
    );

    // Send Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Attendify Verification</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a new verification code. Here is your new One-Time Password (OTP):</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; color: #111827; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      </div>
    `;

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        await sendEmail({
          email: user.email,
          subject: 'Attendify - New Verification Code',
          html: emailHtml,
        });
      } else {
        console.warn('⚠️ SMTP credentials not set. Falling back to console OTP logging.');
        console.log(`\n============================\n🔐 DEVELOPMENT NEW OTP FOR ${user.email}: ${otp}\n============================\n`);
      }
    } catch (err) {
      console.error('Email resending failed:', err);
    }

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP resend' });
  }
};

module.exports = { signup, login, getMe, updateSettings, verifyOTP, resendOTP };
