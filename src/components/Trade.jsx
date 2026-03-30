import { useState, useEffect, useCallback } from 'react';
import { fetchTopCoins } from '@/services/prices';
import { createTrade, subscribeToUserTrades } from '@/services/database';
import { formatCurrency, formatNumber, formatTimeAgo } from '@/utils/helpers';

export default function Trade({ walletAddress })
{
    const [coins, setCoins] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [orderType, setOrderType] = useState('buy');
    const [amount, setAmount] = useState('');
    const [orderMode, setOrderMode] = useState('market');
    const [submitting, setSubmitting] = useState(false);
    const [recentTrades, setRecentTrades] = useState([]);

    useEffect(() =>
    {
        fetchTopCoins(50).then((data) =>
        {
            setCoins(data);
            if (data.length > 0) setSelectedCoin(data[0]);
        });
    }, []);

    // Real-time user trade history
    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsub = subscribeToUserTrades(walletAddress, setRecentTrades);
        return unsub;
    }, [walletAddress]);

    const handleSubmit = useCallback(
        async (e) =>
        {
            e.preventDefault();
            if (!selectedCoin || !amount || !walletAddress || submitting) return;
            setSubmitting(true);
            try {
                await createTrade({
                    walletAddress,
                    pair: `${selectedCoin.symbol.toUpperCase()}/USD`,
                    side: orderType,
                    amount: Number(amount),
                    price: selectedCoin.current_price,
                    type: orderMode,
                });
                setAmount('');
            } catch (err) {
                console.error('Trade failed:', err);
            } finally {
                setSubmitting(false);
            }
        },
        [selectedCoin, amount, orderType, orderMode, walletAddress, submitting]
    );

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart area */}
            <div className="lg:col-span-2">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {selectedCoin && (
                                <>
                                    <img src={selectedCoin.image} alt="" className="h-8 w-8 rounded-full" />
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            {selectedCoin.symbol.toUpperCase()}/USD
                                        </h2>
                                        <span className="text-sm text-gray-400">{selectedCoin.name}</span>
                                    </div>
                                    <span className="ml-4 text-2xl font-bold text-white">
                                        {formatCurrency(selectedCoin.current_price)}
                                    </span>
                                    <span
                                        className={`text-sm ${selectedCoin.price_change_percentage_24h >= 0
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                            }`}
                                    >
                                        {selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Placeholder chart */}
                    <div className="flex h-80 items-center justify-center rounded-lg bg-gray-800/50 text-gray-500">
                        <div className="text-center">
                            <p className="text-4xl mb-2">📈</p>
                            <p>Candlestick chart area</p>
                            <p className="text-xs mt-1">Integrate TradingView lightweight-charts or recharts</p>
                        </div>
                    </div>
                </div>

                {/* Coin list */}
                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <h3 className="mb-3 font-semibold text-white">Markets</h3>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {coins.map((coin) => (
                            <button
                                key={coin.id}
                                onClick={() => setSelectedCoin(coin)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${selectedCoin?.id === coin.id
                                    ? 'bg-violet-600/20 text-violet-400'
                                    : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <img src={coin.image} alt="" className="h-5 w-5 rounded-full" />
                                    <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono">{formatCurrency(coin.current_price)}</span>
                                    <span
                                        className={`ml-2 text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}
                                    >
                                        {coin.price_change_percentage_24h?.toFixed(1)}%
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order panel */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                {/* Buy/Sell toggle */}
                <div className="mb-4 flex rounded-lg bg-gray-800 p-1">
                    <button
                        onClick={() => setOrderType('buy')}
                        className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${orderType === 'buy' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Buy
                    </button>
                    <button
                        onClick={() => setOrderType('sell')}
                        className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${orderType === 'sell' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Sell
                    </button>
                </div>

                {/* Order mode */}
                <div className="mb-4 flex gap-2 text-xs">
                    {['market', 'limit', 'stop-limit'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setOrderMode(mode)}
                            className={`rounded-md px-3 py-1 capitalize ${orderMode === mode
                                ? 'bg-violet-600/20 text-violet-400'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {orderMode !== 'market' && (
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Price (USD)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder={selectedCoin ? formatCurrency(selectedCoin.current_price) : '0.00'}
                                className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs text-gray-400">Amount (USD)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <div className="mt-2 flex gap-2">
                            {['25%', '50%', '75%', '100%'].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    className="flex-1 rounded bg-gray-800 py-1 text-xs text-gray-400 hover:bg-gray-700 hover:text-white"
                                >
                                    {pct}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedCoin && amount && (
                        <div className="rounded-lg bg-gray-800/50 px-3 py-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                                <span>Est. quantity</span>
                                <span className="text-white">
                                    {(Number(amount) / selectedCoin.current_price).toFixed(6)}{' '}
                                    {selectedCoin.symbol.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !walletAddress}
                        className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-50 ${orderType === 'buy'
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'bg-red-600 hover:bg-red-500'
                            }`}
                    >
                        {submitting
                            ? 'Placing Order...'
                            : !walletAddress
                                ? 'Connect Wallet'
                                : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selectedCoin?.symbol.toUpperCase() || ''}`}
                    </button>
                </form>

                {/* Recent trades — real-time */}
                {recentTrades.length > 0 && (
                    <div className="mt-6 border-t border-gray-800 pt-4">
                        <h4 className="text-xs text-gray-500 mb-2">Your Recent Orders</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {recentTrades.slice(0, 10).map((t) => (
                                <div key={t.id} className="flex items-center justify-between text-xs py-1">
                                    <span className={t.side === 'buy' ? 'text-green-400' : 'text-red-400'}>{t.side?.toUpperCase()}</span>
                                    <span className="text-gray-300">{t.pair}</span>
                                    <span className="font-mono text-white">${formatNumber(t.amount)}</span>
                                    <span className={t.status === 'filled' ? 'text-green-400' : 'text-yellow-400'}>{t.status}</span>
                                    <span className="text-gray-600">{formatTimeAgo(t.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
