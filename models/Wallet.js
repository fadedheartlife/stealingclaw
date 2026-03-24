const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    deposit_address: {
        type: String,
        required: true
    },
    private_key_encrypted: {
        type: String,
        required: true
    },
    wallet_type: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    locked_balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;