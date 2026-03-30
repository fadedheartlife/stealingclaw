import { COINGECKO_API_BASE } from '@/config/constants';

/** Fetch top N coins from CoinGecko */
export async function fetchTopCoins(count = 50, currency = 'usd')
{
    const res = await fetch(
        `${COINGECKO_API_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${count}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
    );
    if (!res.ok) throw new Error('Failed to fetch coin data');
    return res.json();
}

/** Fetch a single coin's price */
export async function fetchCoinPrice(coinId, currency = 'usd')
{
    const res = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_change=true`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[coinId] || null;
}

/** Search coins by name or symbol */
export async function searchCoins(queryStr)
{
    const res = await fetch(`${COINGECKO_API_BASE}/search?query=${encodeURIComponent(queryStr)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.coins || [];
}

/** Fetch OHLC chart data for a coin */
export async function fetchOHLC(coinId, days = 7, currency = 'usd')
{
    const res = await fetch(
        `${COINGECKO_API_BASE}/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}`
    );
    if (!res.ok) return [];
    return res.json();
}
