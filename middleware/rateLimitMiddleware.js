'use strict';

const rateLimit = require('express-rate-limit');

/** General API rate limiter: 100 req / min */
const apiLimiter = rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});

/** Strict limiter for auth endpoints: 10 req / min */
const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts. Please wait before trying again.' },
});

/** Admin limiter: 60 req / min */
const adminLimiter = rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter, adminLimiter };
