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
    'tradingLevels',
];

/** Default trading level configs (used as fallback when DB has no config) */
export const DEFAULT_BINARY_LEVELS = [
    { level: 1, name: 'Beginner', profitPercent: 65, tradingTime: 30,   minCapital: 10  },
    { level: 2, name: 'Basic',    profitPercent: 72, tradingTime: 60,   minCapital: 25  },
    { level: 3, name: 'Standard', profitPercent: 80, tradingTime: 300,  minCapital: 50  },
    { level: 4, name: 'Advanced', profitPercent: 85, tradingTime: 900,  minCapital: 100 },
    { level: 5, name: 'Expert',   profitPercent: 92, tradingTime: 3600, minCapital: 250 },
];

export const DEFAULT_ARBITRAGE_LEVELS = [
    { level: 1, name: 'Starter',  profitPercent: 12, tradingTime: 86400, minCapital: 100   },
    { level: 2, name: 'Basic',    profitPercent: 18, tradingTime: 43200, minCapital: 500   },
    { level: 3, name: 'Standard', profitPercent: 25, tradingTime: 21600, minCapital: 1000  },
    { level: 4, name: 'Advanced', profitPercent: 35, tradingTime: 10800, minCapital: 5000  },
    { level: 5, name: 'Elite',    profitPercent: 50, tradingTime: 3600,  minCapital: 10000 },
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
