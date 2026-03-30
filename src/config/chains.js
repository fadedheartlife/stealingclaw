/** Supported chains and their RPC endpoints */
export const CHAINS = {
    1: {
        id: 1,
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || ''}`,
        explorer: 'https://etherscan.io',
        logo: '/chains/eth.svg',
    },
    56: {
        id: 56,
        name: 'BSC',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorer: 'https://bscscan.com',
        logo: '/chains/bsc.svg',
    },
    137: {
        id: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || ''}`,
        explorer: 'https://polygonscan.com',
        logo: '/chains/polygon.svg',
    },
    42161: {
        id: 42161,
        name: 'Arbitrum',
        symbol: 'ETH',
        rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || ''}`,
        explorer: 'https://arbiscan.io',
        logo: '/chains/arbitrum.svg',
    },
    8453: {
        id: 8453,
        name: 'Base',
        symbol: 'ETH',
        rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || ''}`,
        explorer: 'https://basescan.org',
        logo: '/chains/base.svg',
    },
};

export const DEFAULT_CHAIN_ID = 1;
