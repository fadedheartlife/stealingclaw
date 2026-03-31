import { useState, useEffect, useCallback } from 'react';
import { createTrade, subscribeToUserTrades, subscribeToTradingLevelConfigs } from '@/services/database';
import { formatNumber, formatTimeAgo } from '@/utils/helpers';
import { DEFAULT_BINARY_LEVELS } from '@/config/constants';

function formatTime(seconds)
{
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${seconds / 60}m`;
    return `${seconds / 3600}h`;
}

export default function BinaryOptions({ walletAddress })
{
    const [activeTab, setActiveTab] = useState('trade');
    const [direction, setDirection] = useState('up');
    const [amount, setAmount] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [countdown, setCountdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState([]);
    const [levels, setLevels] = useState(DEFAULT_BINARY_LEVELS);

    // Load level configs from DB (with live updates)
    useEffect(() =>
    {
        const unsub = subscribeToTradingLevelConfigs('binary', (dbLevels) =>
        {
            if (dbLevels && dbLevels.length === 5) {
                setLevels(dbLevels.sort((a, b) => a.level - b.level));
            }
        });
        return unsub;
    }, []);

    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsub = subscribeToUserTrades(walletAddress, (trades) =>
        {
            setHistory(trades.filter((t) => t.type === 'binary'));
        });
        return unsub;
    }, [walletAddress]);

    useEffect(() =>
    {
        if (countdown === null || countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const currentLevel = levels.find((l) => l.level === selectedLevel) || levels[0];

    const handleTrade = useCallback(async () =>
    {
        if (!amount || !walletAddress || submitting) return;
        if (Number(amount) < currentLevel.minCapital) return;
        setSubmitting(true);
        try {
            await createTrade({
                walletAddress,
                pair: 'BTC/USD',
                side: direction === 'up' ? 'buy' : 'sell',
                amount: Number(amount),
                price: 0,
                type: 'binary',
                timeframe: currentLevel.tradingTime,
                level: currentLevel.level,
                profitPercent: currentLevel.profitPercent,
            });
            setCountdown(currentLevel.tradingTime);
            setAmount('');
        } catch (err) {
            console.error('Binary options trade failed:', err);
        } finally {
            setSubmitting(false);
        }
    }, [amount, currentLevel, walletAddress, submitting, direction]);

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
                <h2 className="mb-1 text-lg font-bold text-white">🎯 Binary Options</h2>
                <p className="text-sm text-gray-400">Predict price direction within a timeframe</p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 rounded-lg bg-gray-800/50 p-1">
                {[{ id: 'trade', label: 'Trade' }, { id: 'history', label: 'History' }].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${activeTab === t.id
                            ? 'bg-violet-600/20 text-violet-400'
                            : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* TRADE TAB */}
            {activeTab === 'trade' && (
                <>
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

                    {/* Level selection */}
                    <div>
                        <p className="mb-2 text-xs text-gray-400 font-medium uppercase tracking-wider">Select Level</p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {levels.map((lvl) => (
                                <button
                                    key={lvl.level}
                                    onClick={() => setSelectedLevel(lvl.level)}
                                    className={`rounded-xl border p-3 text-center transition-colors ${selectedLevel === lvl.level
                                        ? 'border-violet-500 bg-violet-600/20 text-violet-300'
                                        : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                                    }`}
                                >
                                    <p className="text-xs font-bold">Lv.{lvl.level}</p>
                                    <p className="mt-0.5 text-xs text-gray-500 truncate">{lvl.name}</p>
                                    <p className="mt-1 text-sm font-bold text-green-400">{lvl.profitPercent}%</p>
                                    <p className="text-xs text-gray-500">{formatTime(lvl.tradingTime)}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level details */}
                    {currentLevel && (
                        <div className="rounded-xl border border-violet-800/50 bg-violet-900/10 p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm sm:flex sm:flex-wrap sm:gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Level</p>
                                    <p className="font-bold text-white">{currentLevel.level} — {currentLevel.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Profit</p>
                                    <p className="font-bold text-green-400">{currentLevel.profitPercent}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Trading Time</p>
                                    <p className="font-bold text-white">{formatTime(currentLevel.tradingTime)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Min Capital</p>
                                    <p className="font-bold text-white">${currentLevel.minCapital}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-4">
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

                        {/* Amount */}
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">
                                Amount (USD) — Min ${currentLevel?.minCapital ?? 10}
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder={`Min $${currentLevel?.minCapital ?? 10}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                            />
                        </div>

                        {amount && (
                            <div className="rounded-lg bg-gray-800/50 p-3 text-xs text-gray-400 space-y-1">
                                <div className="flex justify-between">
                                    <span>Potential Profit ({currentLevel?.profitPercent ?? 85}%)</span>
                                    <span className="text-green-400">
                                        ${(Number(amount) * (currentLevel?.profitPercent ?? 85) / 100).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Return</span>
                                    <span className="text-white">
                                        ${(Number(amount) * (1 + (currentLevel?.profitPercent ?? 85) / 100)).toFixed(2)}
                                    </span>
                                </div>
                                {Number(amount) < (currentLevel?.minCapital ?? 10) && (
                                    <p className="text-red-400">
                                        Minimum capital for Level {currentLevel?.level} is ${currentLevel?.minCapital}
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleTrade}
                            disabled={
                                !amount ||
                                !walletAddress ||
                                submitting ||
                                (countdown !== null && countdown > 0) ||
                                Number(amount) < (currentLevel?.minCapital ?? 10)
                            }
                            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500"
                        >
                            {submitting ? 'Placing...' : !walletAddress ? 'Connect Wallet' : 'Place Trade'}
                        </button>
                    </div>
                </>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">Binary Options History</h3>
                    {history.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            <p className="text-3xl mb-2">🎯</p>
                            <p className="text-sm">{walletAddress ? 'No binary trades yet.' : 'Connect wallet to view history.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {history.map((t) => (
                                <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs">
                                    <span className={`rounded px-2 py-0.5 font-bold ${t.side === 'buy' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {t.side === 'buy' ? '📈 UP' : '📉 DOWN'}
                                    </span>
                                    <span className="text-gray-400">Lv.{t.level ?? '—'}</span>
                                    <span className="font-mono text-white">${formatNumber(t.amount)}</span>
                                    <span className={t.status === 'filled' ? 'text-green-400' : t.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>
                                        {t.status}
                                    </span>
                                    <span className="text-gray-600">{formatTimeAgo(t.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
