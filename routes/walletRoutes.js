'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Apply rate limiting then auth to all wallet routes
router.use(apiLimiter);
router.use(authMiddleware);

// GET endpoint for getting balance
router.get('/balance', (req, res) => {
    // TODO: Implement logic to retrieve balance for req.userId
    res.json({ balance: 0 });
});

// GET endpoint for deposit address
router.get('/deposit-address', (req, res) => {
    // TODO: Implement logic to retrieve deposit address for req.userId
    res.json({ address: '0x1234567890abcdef' });
});

// GET endpoint for transactions
router.get('/transactions', (req, res) => {
    // TODO: Implement logic to retrieve transactions for req.userId
    res.json([{ date: '2026-03-24', amount: 100 }, { date: '2026-03-23', amount: 50 }]);
});

module.exports = router;