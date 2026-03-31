const mongoose = require('mongoose');

/**
 * Single-document settings store.
 * There is always exactly one document in this collection (upserted by key='global').
 */
const systemSettingsSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'global', unique: true },
        platformName: { type: String, default: 'OnchainWeb' },
        maintenanceMode: { type: Boolean, default: false },
        maxWithdrawalAmount: { type: Number, default: 100000 },
        minDepositAmount: { type: Number, default: 1 },
        supportEmail: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
