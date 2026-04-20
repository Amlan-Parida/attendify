const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const user = await User.create({ name, email, password });
    console.log('USER CREATED:', user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
      sessionEndDate: user.sessionEndDate,
      token: generateToken(user._id),
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
    const { sessionEndDate } = req.body;
    const user = await User.findById(req.user._id);
    
    if (sessionEndDate) {
      user.sessionEndDate = new Date(sessionEndDate);
    }
    
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

module.exports = { signup, login, getMe, updateSettings };
