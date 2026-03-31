const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { adminLimiter } = require('../middleware/rateLimitMiddleware');

const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const SystemSettings = require('../models/SystemSettings');

// Apply rate limiting and admin auth to all routes in this file
router.use(adminLimiter);
router.use(adminMiddleware);

// User Management Endpoints

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
});

// DELETE user by id
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Withdrawal Approval Endpoints

// GET all pending withdrawals
router.get('/withdrawals/pending', async (req, res) => {
    try {
        const pendingWithdrawals = await Withdrawal.find({ status: 'pending' });
        res.status(200).json(pendingWithdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving withdrawals', error: error.message });
    }
});

// Approve withdrawal by id
router.patch('/withdrawals/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        const withdrawal = await Withdrawal.findByIdAndUpdate(
            id,
            { status: 'approved', approvedBy: req.userId },
            { new: true }
        );
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: 'Error approving withdrawal', error: error.message });
    }
});

// Reject withdrawal by id
router.patch('/withdrawals/:id/reject', async (req, res) => {
    const { id } = req.params;
    try {
        const withdrawal = await Withdrawal.findByIdAndUpdate(
            id,
            { status: 'rejected', approvedBy: req.userId },
            { new: true }
        );
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting withdrawal', error: error.message });
    }
});

// System Control Endpoints

// GET current system settings
router.get('/settings', async (req, res) => {
    try {
        let settings = await SystemSettings.findOne({ key: 'global' });
        if (!settings) {
            settings = await SystemSettings.create({ key: 'global' });
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving system settings', error: error.message });
    }
});

// PUT to update system settings
router.put('/settings', async (req, res) => {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ message: 'Invalid settings payload' });
    }
    const allowed = ['platformName', 'maintenanceMode', 'maxWithdrawalAmount', 'minDepositAmount', 'supportEmail'];
    const updates = {};
    for (const key of allowed) {
        if (key in settings) updates[key] = settings[key];
    }
    try {
        const updated = await SystemSettings.findOneAndUpdate(
            { key: 'global' },
            { $set: updates },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: 'System settings updated', settings: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating system settings', error: error.message });
    }
});

// GET system status
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'System is operational', timestamp: new Date().toISOString() });
});

module.exports = router;