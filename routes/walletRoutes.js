'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Apply rate limiting then auth to all wallet routes
router.use(apiLimiter);
router.use(authMiddleware);

// GET balance for the authenticated user
router.get('/balance', async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user_id: req.userId.toString() });
        if (!wallet) {
            return res.json({ balance: 0, locked_balance: 0 });
        }
        res.json({ balance: wallet.balance, locked_balance: wallet.locked_balance });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving balance', error: error.message });
    }
});

// GET deposit address for the authenticated user
router.get('/deposit-address', async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user_id: req.userId.toString() });
        if (!wallet) {
            return res.status(404).json({ message: 'No wallet found for this user' });
        }
        res.json({ address: wallet.deposit_address, wallet_type: wallet.wallet_type });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving deposit address', error: error.message });
    }
});

// GET transaction history for the authenticated user
router.get('/transactions', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const transactions = await Transaction.find({ userId })
            .sort({ date: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
    }
});

module.exports = router;