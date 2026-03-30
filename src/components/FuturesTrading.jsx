import { useState, useEffect, useCallback } from 'react';
import { createTrade, subscribeToUserTrades } from '@/services/database';
import { formatNumber, formatTimeAgo } from '@/utils/helpers';

export default function FuturesTrading({ walletAddress })
{
    const [leverage, setLeverage] = useState(10);
    const [position, setPosition] = useState('long');
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [positions, setPositions] = useState([]);

    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsub = subscribeToUserTrades(walletAddress, (trades) =>
        {
            setPositions(trades.filter((t) => t.type === 'futures'));
        });
        return unsub;
    }, [walletAddress]);

    const handleOpenPosition = useCallback(async () =>
    {
        if (!amount || !walletAddress || submitting) return;
        setSubmitting(true);
        try {
            await createTrade({
                walletAddress,
                pair: 'BTC/USD',
                side: position === 'long' ? 'buy' : 'sell',
                amount: Number(amount),
                price: 0,
                type: 'futures',
                leverage,
            });
            setAmount('');
        } catch (err) {
            console.error('Futures trade failed:', err);
        } finally {
            setSubmitting(false);
        }
    }, [amount, walletAddress, submitting, position, leverage]);

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <h2 className="mb-4 text-lg font-bold text-white">\u26a1 Futures Trading</h2>
                    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-800/50 text-gray-500">
                        <p>Futures chart \u2014 Perpetual contracts</p>
                    </div>
                </div>

                {/* Open positions \u2014 real-time */}
                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <h3 className="mb-3 font-semibold text-white">Open Positions</h3>
                    {positions.length > 0 ? (
                        <div className="space-y-1">
                            {positions.slice(0, 10).map((p) => (
                                <div key={p.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2 hover:bg-gray-800/30">
                                    <span className={p.side === 'buy' ? 'text-green-400' : 'text-red-400'}>{p.side === 'buy' ? 'LONG' : 'SHORT'}</span>
                                    <span className="text-gray-300">{p.pair}</span>
                                    <span className="text-white font-mono">${formatNumber(p.amount)}</span>
                                    <span className="text-violet-400">{p.leverage || 1}x</span>
                                    <span className={p.status === 'filled' ? 'text-green-400' : 'text-yellow-400'}>{p.status}</span>
                                    <span className="text-gray-600">{formatTimeAgo(p.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-sm text-gray-500">
                            No open positions. Place your first futures trade.
                        </div>
                    )}
                </div>
            </div>

            {/* Order panel */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                <div className="mb-4 flex rounded-lg bg-gray-800 p-1">
                    <button
                        onClick={() => setPosition('long')}
                        className={`flex-1 rounded-md py-2 text-sm font-semibold ${position === 'long' ? 'bg-green-600 text-white' : 'text-gray-400'
                            }`}
                    >
                        Long
                    </button>
                    <button
                        onClick={() => setPosition('short')}
                        className={`flex-1 rounded-md py-2 text-sm font-semibold ${position === 'short' ? 'bg-red-600 text-white' : 'text-gray-400'
                            }`}
                    >
                        Short
                    </button>
                </div>

                {/* Leverage slider */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Leverage</span>
                        <span className="font-bold text-white">{leverage}x</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        value={leverage}
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>1x</span>
                        <span>25x</span>
                        <span>50x</span>
                        <span>100x</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400">Margin (USD)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            placeholder="0.00"
                            className="mt-1 w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                        />
                    </div>
                    {amount && (
                        <div className="rounded-lg bg-gray-800/50 p-3 text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                                <span>Position Size</span>
                                <span className="text-white">${(Number(amount) * leverage).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Liquidation Price</span>
                                <span className="text-yellow-400">Calculated on submit</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleOpenPosition}
                        disabled={submitting || !walletAddress}
                        className={`w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50 ${position === 'long' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                            }`}
                    >
                        {submitting ? 'Opening...' : !walletAddress ? 'Connect Wallet' : `Open ${position === 'long' ? 'Long' : 'Short'}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
