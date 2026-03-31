const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'filled', 'cancelled'],
            default: 'open',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);