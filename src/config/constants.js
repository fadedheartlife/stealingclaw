export const APP_NAME = 'Wallet dApp Trading';
export const DEFAULT_SLIPPAGE = 0.5;
export const MAX_SLIPPAGE = 50;
export const PRICE_REFRESH_INTERVAL = 15_000;
export const QUOTE_DEBOUNCE_MS = 500;
export const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/** Admin role hierarchy */
export const ADMIN_ROLES = {
    MASTER: 'master',
    ADMIN: 'admin',
    USER: 'user',
};

/** All available admin permissions */
export const ADMIN_PERMISSIONS = [
    'manageUsers',
    'manageBalances',
    'manageKYC',
    'manageTrades',
    'viewReports',
    'manageDeposits',
    'manageWithdrawals',
    'customerService',
    'viewLogs',
    'siteSettings',
    'createAdmins',
];

/** Wallet providers supported */
export const WALLET_PROVIDERS = [
    'MetaMask',
    'WalletConnect',
    'Trust Wallet',
    'Coinbase Wallet',
    'Phantom',
    'OKX Wallet',
    'Brave Wallet',
    'Rabby',
    'Safe',
    'Ledger',
    'Rainbow',
];
