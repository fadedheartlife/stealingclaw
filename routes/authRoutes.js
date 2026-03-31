'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const User = require('../models/User');

// Apply strict rate limiting to all auth endpoints
router.use(authLimiter);

// Register endpoint
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const user = new User({ username, password, email: email ?? '' });
        await user.save();
        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Login failed.', error: error.message });
    }
});

// User profile endpoint
router.get('/profile', async (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ message: 'Username query parameter is required.' });
    }
    try {
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ message: 'User profile retrieved.', user });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
    }
});

module.exports = router;
