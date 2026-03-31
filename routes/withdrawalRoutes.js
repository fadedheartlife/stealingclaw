const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Apply rate limiting then auth to all withdrawal routes
router.use(apiLimiter);
router.use(authMiddleware);

// Endpoint to create a withdrawal request
router.post('/', (req, res) => {
    // Logic to create a withdrawal request
    res.status(201).send({ message: 'Withdrawal request created successfully.' });
});

// Endpoint to get all withdrawal requests
router.get('/', (req, res) => {
    // Logic to get all withdrawal requests
    res.status(200).send({ message: 'Retrieved all withdrawal requests.' });
});

// Endpoint to get a specific withdrawal request
router.get('/:id', (req, res) => {
    const { id } = req.params;
    // Logic to get a specific withdrawal request by ID
    res.status(200).send({ message: `Retrieved withdrawal request ${id}.` });
});

// Endpoint to update a withdrawal request
router.put('/:id', (req, res) => {
    const { id } = req.params;
    // Logic to update a withdrawal request by ID
    res.status(200).send({ message: `Withdrawal request ${id} updated successfully.` });
});

// Endpoint to delete a withdrawal request
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    // Logic to delete a withdrawal request by ID — 204 No Content must not include a body
    res.status(204).send();
});

module.exports = router;