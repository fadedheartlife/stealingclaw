'use strict';

const express = require('express');
const router = express.Router();

// Mounting all route modules
const usersRouter = require('./users');
const productsRouter = require('./products');
const ordersRouter = require('./orders');

router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);

module.exports = router;
