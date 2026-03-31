'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const Order = require('../models/Order');

// Apply rate limiting then auth to all trading routes
router.use(apiLimiter);
router.use(authMiddleware);

// Place a new order
router.post('/orders', async (req, res) => {
    const { type, amount, price } = req.body;
    if (!type || !amount || !price) {
        return res.status(400).json({ message: 'type, amount, and price are required.' });
    }
    try {
        const order = new Order({
            userId: new mongoose.Types.ObjectId(req.userId),
            type,
            amount: Number(amount),
            price: Number(price),
        });
        await order.save();
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error: error.message });
    }
});

// Get a specific order by ID
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Users can only view their own orders
        if (order.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// Update an order (e.g. cancel it or modify price/amount while still open)
router.put('/orders/:id', async (req, res) => {
    const { amount, price, status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (order.status !== 'open') {
            return res.status(400).json({ message: 'Only open orders can be modified' });
        }
        if (amount !== undefined) order.amount = Number(amount);
        if (price !== undefined) order.price = Number(price);
        if (status !== undefined) order.status = status;
        await order.save();
        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

// Cancel (delete) an order
router.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (order.status !== 'open') {
            return res.status(400).json({ message: 'Only open orders can be cancelled' });
        }
        order.status = 'cancelled';
        await order.save();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});

module.exports = router;