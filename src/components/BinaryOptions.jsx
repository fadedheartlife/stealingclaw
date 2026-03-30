import { useState, useEffect, useCallback } from 'react';
import { createTrade, subscribeToUserTrades } from '@/services/database';
import { formatNumber, formatTimeAgo } from '@/utils/helpers';

export default function BinaryOptions({ walletAddress })
{
    const [direction, setDirection] = useState('up');
    const [amount, setAmount] = useState('');
    const [timeframe, setTimeframe] = useState(60);
    const [countdown, setCountdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsub = subscribeToUserTrades(walletAddress, (trades) =>
        {
            setHistory(trades.filter((t) => t.type === 'binary'));
        });
        return unsub;
    }, [walletAddress]);

    const timeframes = [
        { label: '30s', value: 30 },
        { label: '1m', value: 60 },
        { label: '5m', value: 300 },
        { label: '15m', value: 900 },
        { label: '1h', value: 3600 },
    ];

    useEffect(() =>
    {
        if (countdown === null || countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleTrade = useCallback(async () =>
    {
        if (!amount || !walletAddress || submitting) return;
        setSubmitting(true);
        try {
            await createTrade({
                walletAddress,
                pair: 'BTC/USD',
                side: direction === 'up' ? 'buy' : 'sell',
                amount: Number(amount),
                price: 0,
                type: 'binary',
                timeframe,
            });
            setCountdown(timeframe);
            setAmount('');
        } catch (err) {
            console.error('Binary options trade failed:', err);
        } finally {
            setSubmitting(false);
        }
    }, [amount, timeframe, walletAddress, submitting, direction]);

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
                <h2 className="mb-2 text-lg font-bold text-white">🎯 Binary Options</h2>
                <p className="text-sm text-gray-400">Predict price direction within a timeframe</p>
            </div>

            {/* Active trade */}
            {countdown !== null && countdown > 0 && (
                <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-6 text-center">
                    <p className="text-sm text-yellow-400">Trade Active</p>
                    <p className="mt-2 text-4xl font-bold text-white">
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                        Direction: <span className={direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                            {direction === 'up' ? '📈 UP' : '📉 DOWN'}
                        </span>
                    </p>
                </div>
            )}

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
                {/* Direction */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setDirection('up')}
                        className={`flex-1 rounded-xl py-4 text-lg font-bold transition-colors ${direction === 'up'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        📈 UP
                    </button>
                    <button
                        onClick={() => setDirection('down')}
                        className={`flex-1 rounded-xl py-4 text-lg font-bold transition-colors ${direction === 'down'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        📉 DOWN
                    </button>
                </div>

                {/* Timeframe */}
                <div>
                    <label className="mb-2 block text-xs text-gray-400">Timeframe</label>
                    <div className="flex gap-2">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className={`flex-1 rounded-lg py-2 text-xs font-medium ${timeframe === tf.value
                                    ? 'bg-violet-600/20 text-violet-400'
                                    : 'bg-gray-800 text-gray-500 hover:text-white'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Amount (USD)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="10.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                    />
                </div>

                {amount && (
                    <div className="rounded-lg bg-gray-800/50 p-3 text-xs text-gray-400">
                        <div className="flex justify-between">
                            <span>Potential Profit (85%)</span>
                            <span className="text-green-400">${(Number(amount) * 0.85).toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleTrade}
                    disabled={!amount || !walletAddress || submitting || (countdown !== null && countdown > 0)}
                    className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500"
                >
                    {submitting ? 'Placing...' : !walletAddress ? 'Connect Wallet' : 'Place Trade'}
                </button>
            </div>

            {/* Trade history — real-time */}
            {history.length > 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <h3 className="text-xs text-gray-500 mb-2">Recent Binary Trades</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {history.slice(0, 8).map((t) => (
                            <div key={t.id} className="flex justify-between text-xs py-1">
                                <span className={t.side === 'buy' ? 'text-green-400' : 'text-red-400'}>{t.side === 'buy' ? 'UP' : 'DOWN'}</span>
                                <span className="text-white font-mono">${formatNumber(t.amount)}</span>
                                <span className={t.status === 'filled' ? 'text-green-400' : 'text-yellow-400'}>{t.status}</span>
                                <span className="text-gray-600">{formatTimeAgo(t.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
