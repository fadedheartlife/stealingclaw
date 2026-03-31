const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const Withdrawal = require('../models/Withdrawal');

// Apply rate limiting then auth to all withdrawal routes
router.use(apiLimiter);
router.use(authMiddleware);

// Create a withdrawal request
router.post('/', async (req, res) => {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ message: 'A valid amount is required.' });
    }
    try {
        const withdrawal = new Withdrawal({
            userId: new mongoose.Types.ObjectId(req.userId),
            amount: Number(amount),
            status: 'pending',
        });
        await withdrawal.save();
        res.status(201).json({ message: 'Withdrawal request created successfully.', withdrawal });
    } catch (error) {
        res.status(500).json({ message: 'Error creating withdrawal request', error: error.message });
    }
});

// Get all withdrawal requests for the authenticated user
router.get('/', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving withdrawal requests', error: error.message });
    }
});

// Get a specific withdrawal request
router.get('/:id', async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found.' });
        if (withdrawal.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving withdrawal request', error: error.message });
    }
});

// Update a pending withdrawal request (user can only update their own pending requests)
router.put('/:id', async (req, res) => {
    const { amount } = req.body;
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found.' });
        if (withdrawal.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending requests can be updated.' });
        }
        if (amount !== undefined) withdrawal.amount = Number(amount);
        await withdrawal.save();
        res.status(200).json({ message: 'Withdrawal request updated successfully.', withdrawal });
    } catch (error) {
        res.status(500).json({ message: 'Error updating withdrawal request', error: error.message });
    }
});

// Delete (cancel) a pending withdrawal request
router.delete('/:id', async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found.' });
        if (withdrawal.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending requests can be cancelled.' });
        }
        await withdrawal.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting withdrawal request', error: error.message });
    }
});

module.exports = router;