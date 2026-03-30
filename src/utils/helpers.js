/** Format a large number with commas */
export function formatNumber(num)
{
    if (num == null) return '0';
    return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Format currency */
export function formatCurrency(amount, currency = 'USD')
{
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/** Truncate an address: 0x1234...5678 */
export function shortenAddress(address, chars = 4)
{
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Validate Ethereum address format */
export function isValidAddress(address)
{
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/** Block explorer URL for tx */
export function getExplorerTxUrl(txHash, chainId = 1)
{
    const explorers = {
        1: 'https://etherscan.io',
        56: 'https://bscscan.com',
        137: 'https://polygonscan.com',
        42161: 'https://arbiscan.io',
        8453: 'https://basescan.org',
    };
    return `${explorers[chainId] || explorers[1]}/tx/${txHash}`;
}

/** Format relative time: "2 min ago", "1 hr ago" */
export function formatTimeAgo(timestamp)
{
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
