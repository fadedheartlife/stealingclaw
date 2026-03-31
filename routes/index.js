'use strict';

const express = require('express');
const router = express.Router();

// Mount all route modules
const authRouter = require('./authRoutes');
const adminRouter = require('./adminRoutes');
const tradingRouter = require('./tradingRoutes');
const walletRouter = require('./walletRoutes');
const withdrawalRouter = require('./withdrawalRoutes');

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/trading', tradingRouter);
router.use('/wallet', walletRouter);
router.use('/withdrawals', withdrawalRouter);

module.exports = router;
