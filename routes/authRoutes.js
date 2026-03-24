'use strict';

const express = require('express');
const router = express.Router();

// Mock database
const users = [];

// Register endpoint
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    // Simple validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
    }
    // Add new user
    users.push({ username, password });
    return res.status(201).json({ message: 'User registered successfully.' });
});

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    return res.status(200).json({ message: 'Login successful!', user });
});

// User profile endpoint
router.get('/profile', (req, res) => {
    // In a real application, you would fetch user data from a database
    // Assuming credentials have been checked and we have a valid session
    const username = req.query.username; // This should come from a validated session in a real app
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ message: 'User profile retrieved.', user });
});

module.exports = router;
