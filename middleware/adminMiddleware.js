'use strict';

const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token is required for authorization.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin.' });
        }

        // Attach user info to request for use in other routes
        req.user = decoded;
        next();
    });
};

module.exports = adminMiddleware;
