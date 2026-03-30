import { useState, useEffect } from 'react';
import { fetchTopCoins } from '@/services/prices';
import { subscribeToLiveMarketFeed, subscribeToPlatformStats } from '@/services/database';
import { formatCurrency, formatNumber, formatTimeAgo } from '@/utils/helpers';
import { PRICE_REFRESH_INTERVAL } from '@/config/constants';

export default function Dashboard({ walletAddress })
{
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [liveTrades, setLiveTrades] = useState([]);
    const [platformStats, setPlatformStats] = useState(null);

    // CoinGecko price data (polling)
    useEffect(() =>
    {
        let mounted = true;

        async function load()
        {
            try {
                const data = await fetchTopCoins(100);
                if (mounted) setCoins(data);
            } catch (err) {
                console.error('Failed to fetch market data:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        const interval = setInterval(load, PRICE_REFRESH_INTERVAL);
        return () =>
        {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // Real-time trade feed from Back4App
    useEffect(() =>
    {
        const unsub = subscribeToLiveMarketFeed(setLiveTrades);
        return unsub;
    }, []);

    // Real-time platform stats from Back4App
    useEffect(() =>
    {
        const unsub = subscribeToPlatformStats(setPlatformStats);
        return unsub;
    }, []);

    const filtered = coins.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Total Coins" value={coins.length} />
                <StatCard label="BTC Price" value={formatCurrency(coins.find((c) => c.id === 'bitcoin')?.current_price)} />
                <StatCard label="ETH Price" value={formatCurrency(coins.find((c) => c.id === 'ethereum')?.current_price)} />
                <StatCard
                    label="Platform Users"
                    value={platformStats?.totalUsers ?? '\u2014'}
                />
            </div>

            {/* Live trade feed \u2014 real-time from Back4App */}
            {liveTrades.length > 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <h3 className="font-semibold text-white">Live Trade Feed</h3>
                        <span className="text-xs text-gray-500">Real-time</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {liveTrades.slice(0, 15).map((t) => (
                            <div key={t.id} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs hover:bg-gray-800/30">
                                <span className="font-mono text-gray-400">{t.walletAddress?.slice(0, 8)}...</span>
                                <span className="font-medium text-white">{t.pair}</span>
                                <span className={t.side === 'buy' ? 'text-green-400' : 'text-red-400'}>{t.side?.toUpperCase()}</span>
                                <span className="text-gray-400">${formatNumber(t.amount)}</span>
                                <span className="text-gray-600">{formatTimeAgo(t.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Live Market</h2>
                <input
                    type="text"
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ml-auto w-64 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-violet-500"
                />
            </div>

            {/* Coin table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-800 bg-gray-900/50">
                            <tr className="text-left text-xs text-gray-500">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Coin</th>
                                <th className="px-4 py-3 text-right">Price</th>
                                <th className="hidden px-4 py-3 text-right md:table-cell">24h %</th>
                                <th className="hidden px-4 py-3 text-right lg:table-cell">Market Cap</th>
                                <th className="hidden px-4 py-3 text-right lg:table-cell">Volume (24h)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((coin, i) => (
                                <tr key={coin.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                                            <span className="font-medium text-white">{coin.name}</span>
                                            <span className="text-xs text-gray-500 uppercase">{coin.symbol}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-white">
                                        {formatCurrency(coin.current_price)}
                                    </td>
                                    <td className={`hidden px-4 py-3 text-right md:table-cell ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {coin.price_change_percentage_24h?.toFixed(2)}%
                                    </td>
                                    <td className="hidden px-4 py-3 text-right text-gray-400 lg:table-cell">
                                        {formatCurrency(coin.market_cap)}
                                    </td>
                                    <td className="hidden px-4 py-3 text-right text-gray-400 lg:table-cell">
                                        {formatCurrency(coin.total_volume)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value })
{
    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-bold text-white">{value}</p>
        </div>
    );
}
