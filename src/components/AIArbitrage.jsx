import { useState, useEffect } from 'react';
import { getTradeAnalysis } from '@/services/agent';
import { subscribeToTradingLevelConfigs } from '@/services/database';
import { DEFAULT_ARBITRAGE_LEVELS } from '@/config/constants';

function formatTime(seconds)
{
    if (seconds < 3600) return `${seconds / 60}m`;
    if (seconds < 86400) return `${seconds / 3600}h`;
    return `${seconds / 86400}d`;
}

export default function AIArbitrage({ walletAddress })
{
    const [investAmounts, setInvestAmounts] = useState({});
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisSymbol, setAnalysisSymbol] = useState('BTC');
    const [levels, setLevels] = useState(DEFAULT_ARBITRAGE_LEVELS);
    const [activeInvestments, setActiveInvestments] = useState({});

    // Load level configs from DB (with live updates)
    useEffect(() =>
    {
        const unsub = subscribeToTradingLevelConfigs('arbitrage', (dbLevels) =>
        {
            if (dbLevels && dbLevels.length === 5) {
                setLevels(dbLevels.sort((a, b) => a.level - b.level));
            }
        });
        return unsub;
    }, []);

    async function runAnalysis()
    {
        setAnalysisLoading(true);
        setAnalysis(null);
        try {
            const result = await getTradeAnalysis(analysisSymbol, '1h');
            setAnalysis(result);
        } catch {
            setAnalysis({ error: 'Failed to get analysis. Agent may be offline.' });
        } finally {
            setAnalysisLoading(false);
        }
    }

    function handleInvest(level)
    {
        const amount = Number(investAmounts[level.level] || '');
        if (!amount || amount < level.minCapital) return;
        // Record active investment locally (in a real app this would be persisted)
        setActiveInvestments((prev) => ({
            ...prev,
            [level.level]: {
                amount,
                startedAt: Date.now(),
                endAt: Date.now() + level.tradingTime * 1000,
                profit: (amount * level.profitPercent) / 100,
            },
        }));
        setInvestAmounts((prev) => ({ ...prev, [level.level]: '' }));
    }

    const riskLabel = (lvl) =>
    {
        if (lvl <= 2) return { label: 'Low', cls: 'text-green-400' };
        if (lvl === 3) return { label: 'Medium', cls: 'text-yellow-400' };
        return { label: 'High', cls: 'text-red-400' };
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gradient-to-r from-violet-900/30 to-blue-900/30 p-6">
                <h2 className="text-xl font-bold text-white">🤖 AI Arbitrage</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Automated cross-exchange arbitrage powered by AI algorithms
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Total Invested</p>
                    <p className="mt-1 text-lg font-bold text-white">
                        ${Object.values(activeInvestments).reduce((s, i) => s + i.amount, 0).toLocaleString()}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Projected Profit</p>
                    <p className="mt-1 text-lg font-bold text-green-400">
                        ${Object.values(activeInvestments).reduce((s, i) => s + i.profit, 0).toFixed(2)}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Active Levels</p>
                    <p className="mt-1 text-lg font-bold text-white">{Object.keys(activeInvestments).length}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Last Trade</p>
                    <p className="mt-1 text-lg font-bold text-white">—</p>
                </div>
            </div>

            {/* AI Agent Analysis */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                <h3 className="mb-3 font-semibold text-white">AI Market Analysis</h3>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={analysisSymbol}
                        onChange={(e) => setAnalysisSymbol(e.target.value.toUpperCase())}
                        placeholder="BTC"
                        className="w-24 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                        onClick={runAnalysis}
                        disabled={analysisLoading}
                        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:bg-gray-700"
                    >
                        {analysisLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {analysis && (
                    <div className="rounded-lg bg-gray-800/50 p-3 text-sm text-gray-300 whitespace-pre-wrap">
                        {analysis.error || analysis.reply || JSON.stringify(analysis, null, 2)}
                    </div>
                )}
            </div>

            {/* 5-Level Strategies */}
            <div>
                <h3 className="mb-3 font-semibold text-white">Investment Levels</h3>
                <div className="grid gap-4 md:grid-cols-5">
                    {levels.map((lvl) =>
                    {
                        const risk = riskLabel(lvl.level);
                        const active = activeInvestments[lvl.level];
                        const inputAmt = Number(investAmounts[lvl.level] || '');
                        const belowMin = inputAmt > 0 && inputAmt < lvl.minCapital;
                        return (
                            <div
                                key={lvl.level}
                                className={`rounded-xl border p-4 flex flex-col ${active
                                    ? 'border-violet-500 bg-violet-900/20'
                                    : 'border-gray-800 bg-gray-900/50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-400">Lv.{lvl.level}</span>
                                    {active && (
                                        <span className="rounded-full bg-green-700/30 px-2 py-0.5 text-xs text-green-400">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-bold text-white text-sm">{lvl.name}</h4>
                                <p className="mt-1 text-xl font-bold text-violet-400">{lvl.profitPercent}%</p>
                                <p className="text-xs text-gray-500 mb-2">Profit Rate</p>
                                <div className="space-y-1 text-xs text-gray-400 flex-1">
                                    <div className="flex justify-between">
                                        <span>Risk</span>
                                        <span className={risk.cls}>{risk.label}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Duration</span>
                                        <span className="text-white">{formatTime(lvl.tradingTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Min Capital</span>
                                        <span className="text-white">${lvl.minCapital.toLocaleString()}</span>
                                    </div>
                                    {active && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Est. Profit</span>
                                            <span>+${active.profit.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder={`Min $${lvl.minCapital.toLocaleString()}`}
                                        value={investAmounts[lvl.level] || ''}
                                        onChange={(e) =>
                                            setInvestAmounts((prev) => ({
                                                ...prev,
                                                [lvl.level]: e.target.value.replace(/[^0-9.]/g, ''),
                                            }))
                                        }
                                        className={`mb-1 w-full rounded-lg bg-gray-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-violet-500 ${belowMin ? 'ring-1 ring-red-500' : ''}`}
                                    />
                                    {belowMin && (
                                        <p className="text-xs text-red-400 mb-1">Min ${lvl.minCapital}</p>
                                    )}
                                    <button
                                        onClick={() => handleInvest(lvl)}
                                        disabled={!walletAddress || !investAmounts[lvl.level] || belowMin}
                                        className="w-full rounded-lg bg-violet-600 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500"
                                    >
                                        {!walletAddress ? 'Connect' : 'Invest'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
