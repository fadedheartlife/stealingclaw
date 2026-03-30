import { useState } from 'react';
import { getTradeAnalysis } from '@/services/agent';

export default function AIArbitrage()
{
    const [investAmount, setInvestAmount] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisSymbol, setAnalysisSymbol] = useState('BTC');

    const strategies = [
        { name: 'Conservative', apy: '12-18%', risk: 'Low', minInvest: 100 },
        { name: 'Balanced', apy: '25-35%', risk: 'Medium', minInvest: 500 },
        { name: 'Aggressive', apy: '50-80%', risk: 'High', minInvest: 1000 },
    ];

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
                    <p className="mt-1 text-lg font-bold text-white">$0.00</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Current Profit</p>
                    <p className="mt-1 text-lg font-bold text-green-400">$0.00</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Active Strategies</p>
                    <p className="mt-1 text-lg font-bold text-white">0</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Last Trade</p>
                    <p className="mt-1 text-lg font-bold text-white">—</p>
                </div>
            </div>

            {/* AI Agent Analysis */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                <h3 className="mb-3 font-semibold text-white">AI Market Analysis (Back4App Agent)</h3>
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

            {/* Strategies */}
            <div className="grid gap-4 md:grid-cols-3">
                {strategies.map((s) => (
                    <div key={s.name} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                        <h3 className="font-bold text-white">{s.name}</h3>
                        <p className="mt-1 text-2xl font-bold text-violet-400">{s.apy}</p>
                        <p className="text-xs text-gray-500">Estimated APY</p>
                        <div className="mt-3 space-y-1 text-xs text-gray-400">
                            <div className="flex justify-between">
                                <span>Risk Level</span>
                                <span
                                    className={
                                        s.risk === 'Low'
                                            ? 'text-green-400'
                                            : s.risk === 'Medium'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                    }
                                >
                                    {s.risk}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Min. Investment</span>
                                <span className="text-white">${s.minInvest}</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder={`Min $${s.minInvest}`}
                                value={investAmount}
                                onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                className="mb-2 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500"
                            />
                            <button className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500">
                                Invest
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
