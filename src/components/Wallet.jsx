import { useState, useEffect } from 'react';
import { shortenAddress, formatCurrency, formatNumber, formatTimeAgo } from '@/utils/helpers';
import
    {
        subscribeToUserPortfolio,
        subscribeToUserDeposits,
        subscribeToUserWithdrawals,
        subscribeToUserTrades,
        createDeposit,
        createWithdrawal,
    } from '@/services/database';

export default function Wallet({ walletAddress, walletProvider, userId })
{
    const [activeTab, setActiveTab] = useState('assets');
    const [portfolio, setPortfolio] = useState(null);
    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [trades, setTrades] = useState([]);

    // Deposit form
    const [depToken, setDepToken] = useState('USDT');
    const [depAmount, setDepAmount] = useState('');
    const [depNetwork, setDepNetwork] = useState('Ethereum');
    const [depSubmitting, setDepSubmitting] = useState(false);

    // Withdraw form
    const [wdToken, setWdToken] = useState('USDT');
    const [wdAmount, setWdAmount] = useState('');
    const [wdAddress, setWdAddress] = useState('');
    const [wdNetwork, setWdNetwork] = useState('Ethereum');
    const [wdSubmitting, setWdSubmitting] = useState(false);

    // Real-time subscriptions
    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsubs = [
            subscribeToUserPortfolio(walletAddress, setPortfolio),
            subscribeToUserDeposits(walletAddress, setDeposits),
            subscribeToUserWithdrawals(walletAddress, setWithdrawals),
            subscribeToUserTrades(walletAddress, setTrades),
        ];
        return () => unsubs.forEach((fn) => fn());
    }, [walletAddress]);

    const totalBalance = portfolio?.totalBalance ?? 0;

    const handleDeposit = async (e) =>
    {
        e.preventDefault();
        if (!depAmount || depSubmitting) return;
        setDepSubmitting(true);
        try {
            await createDeposit({
                walletAddress,
                token: depToken,
                amount: Number(depAmount),
                network: depNetwork,
            });
            setDepAmount('');
        } catch (err) {
            console.error('Deposit failed:', err);
        } finally {
            setDepSubmitting(false);
        }
    };

    const handleWithdraw = async (e) =>
    {
        e.preventDefault();
        if (!wdAmount || !wdAddress || wdSubmitting) return;
        setWdSubmitting(true);
        try {
            await createWithdrawal({
                walletAddress,
                token: wdToken,
                amount: Number(wdAmount),
                toAddress: wdAddress,
                network: wdNetwork,
            });
            setWdAmount('');
            setWdAddress('');
        } catch (err) {
            console.error('Withdrawal failed:', err);
        } finally {
            setWdSubmitting(false);
        }
    };

    const networks = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Base'];
    const tokens = ['USDT', 'BTC', 'ETH', 'BNB', 'MATIC', 'USDC'];

    const [historyFilter, setHistoryFilter] = useState('all');

    const tabs = [
        { id: 'assets', label: 'Assets' },
        { id: 'deposit', label: 'Deposit' },
        { id: 'withdraw', label: 'Withdraw' },
        { id: 'history', label: 'History' },
    ];

    if (!walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">\ud83d\udc5b</div>
                <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
                <p className="mt-2 text-sm text-gray-400">
                    Connect a wallet to view your assets, deposit, and withdraw.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Wallet info header */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Connected via {walletProvider || 'Unknown'}</p>
                        <p className="mt-1 font-mono text-lg text-violet-400">{shortenAddress(walletAddress, 6)}</p>
                        {userId && (
                            <p className="mt-1 font-mono text-xs text-gray-500">UID: {userId}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Total Balance</p>
                        <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-gray-800/50 p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-violet-600/20 text-violet-400'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                {/* ASSETS TAB */}
                {activeTab === 'assets' && (
                    <div>
                        {portfolio?.assets?.length > 0 ? (
                            <div className="space-y-2">
                                {portfolio.assets.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-800/30">
                                        <div>
                                            <span className="font-medium text-white">{a.token}</span>
                                            <span className="ml-2 text-xs text-gray-500">{a.network}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-white">{formatNumber(a.amount)}</p>
                                            <p className="text-xs text-gray-500">{formatCurrency(a.valueUsd)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p className="text-4xl mb-2">\ud83d\udcca</p>
                                <p>No assets found. Deposit tokens to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* DEPOSIT TAB */}
                {activeTab === 'deposit' && (
                    <form onSubmit={handleDeposit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Token</label>
                            <select value={depToken} onChange={(e) => setDepToken(e.target.value)} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500">
                                {tokens.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Network</label>
                            <select value={depNetwork} onChange={(e) => setDepNetwork(e.target.value)} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500">
                                {networks.map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Amount</label>
                            <input type="text" inputMode="decimal" placeholder="0.00" value={depAmount} onChange={(e) => setDepAmount(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <p className="text-xs text-gray-500">Send {depToken} on {depNetwork} to:</p>
                        <p className="font-mono text-sm text-violet-400 break-all">{walletAddress}</p>
                        <button type="submit" disabled={depSubmitting} className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50">
                            {depSubmitting ? 'Submitting...' : 'Submit Deposit'}
                        </button>

                        {/* Recent deposits */}
                        {deposits.length > 0 && (
                            <div className="mt-4 border-t border-gray-800 pt-4">
                                <h4 className="text-xs text-gray-500 mb-2">Recent Deposits</h4>
                                {deposits.slice(0, 5).map((d) => (
                                    <div key={d.id} className="flex justify-between text-xs py-1">
                                        <span className="text-gray-400">{d.token} \u2014 {formatNumber(d.amount)}</span>
                                        <span className={d.status === 'approved' ? 'text-green-400' : d.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>{d.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                )}

                {/* WITHDRAW TAB */}
                {activeTab === 'withdraw' && (
                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Token</label>
                            <select value={wdToken} onChange={(e) => setWdToken(e.target.value)} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500">
                                {tokens.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Network</label>
                            <select value={wdNetwork} onChange={(e) => setWdNetwork(e.target.value)} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500">
                                {networks.map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Recipient Address</label>
                            <input type="text" placeholder="0x..." value={wdAddress} onChange={(e) => setWdAddress(e.target.value)} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-gray-400">Amount</label>
                            <input type="text" inputMode="decimal" placeholder="0.00" value={wdAmount} onChange={(e) => setWdAmount(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <button type="submit" disabled={wdSubmitting} className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50">
                            {wdSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
                        </button>

                        {/* Recent withdrawals */}
                        {withdrawals.length > 0 && (
                            <div className="mt-4 border-t border-gray-800 pt-4">
                                <h4 className="text-xs text-gray-500 mb-2">Recent Withdrawals</h4>
                                {withdrawals.slice(0, 5).map((w) => (
                                    <div key={w.id} className="flex justify-between text-xs py-1">
                                        <span className="text-gray-400">{w.token} \u2014 {formatNumber(w.amount)}</span>
                                        <span className={w.status === 'approved' ? 'text-green-400' : w.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>{w.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <div>
                        {/* Filter buttons */}
                        <div className="mb-3 flex gap-1 flex-wrap">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'deposit', label: 'Deposits' },
                                { value: 'withdrawal', label: 'Withdrawals' },
                                { value: 'trade', label: 'Trades' },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setHistoryFilter(f.value)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${historyFilter === f.value
                                        ? 'bg-violet-600/30 text-violet-400'
                                        : 'bg-gray-800 text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {trades.length > 0 || deposits.length > 0 || withdrawals.length > 0 ? (
                            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                                {[
                                    ...deposits.map((d) => ({ ...d, _type: 'deposit' })),
                                    ...withdrawals.map((w) => ({ ...w, _type: 'withdrawal' })),
                                    ...trades.map((t) => ({ ...t, _type: 'trade' })),
                                ]
                                    .filter((item) => historyFilter === 'all' || item._type === historyFilter)
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .map((item) => (
                                        <div key={`${item._type}-${item.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-gray-800/30">
                                            <span className={`rounded px-2 py-0.5 font-medium ${item._type === 'deposit' ? 'bg-green-900/30 text-green-400' : item._type === 'withdrawal' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                                {item._type}
                                            </span>
                                            <span className="text-gray-300">{item.token || item.pair}</span>
                                            <span className="font-mono text-white">{formatNumber(item.amount)}</span>
                                            <span className={item.status === 'approved' || item.status === 'filled' ? 'text-green-400' : item.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>
                                                {item.status}
                                            </span>
                                            <span className="text-gray-600">{formatTimeAgo(item.createdAt)}</span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p className="text-4xl mb-2">📋</p>
                                <p>No transaction history yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
