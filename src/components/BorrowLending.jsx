import { useState, useEffect } from 'react';
import { createTrade, subscribeToUserTrades } from '@/services/database';
import { formatNumber, formatTimeAgo } from '@/utils/helpers';

export default function BorrowLending({ walletAddress })
{
    const [tab, setTab] = useState('lend');
    const [submitting, setSubmitting] = useState(false);
    const [userPositions, setUserPositions] = useState([]);

    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsub = subscribeToUserTrades(walletAddress, (trades) =>
        {
            setUserPositions(trades.filter((t) => t.type === 'lend' || t.type === 'borrow'));
        });
        return unsub;
    }, [walletAddress]);

    const handlePoolAction = async (pool) =>
    {
        if (!walletAddress || submitting) return;
        setSubmitting(true);
        try {
            await createTrade({
                walletAddress,
                pair: `${pool.asset}/USD`,
                side: tab === 'lend' ? 'buy' : 'sell',
                amount: 0,
                price: 0,
                type: tab,
            });
        } catch (err) {
            console.error(`${tab} action failed:`, err);
        } finally {
            setSubmitting(false);
        }
    };

    const pools = [
        { asset: 'USDC', supplyApy: '4.2%', borrowApy: '6.8%', tvl: '$12.4M', available: '$5.2M' },
        { asset: 'ETH', supplyApy: '2.1%', borrowApy: '4.5%', tvl: '$8.7M', available: '$3.1M' },
        { asset: 'WBTC', supplyApy: '1.8%', borrowApy: '3.9%', tvl: '$5.3M', available: '$2.0M' },
        { asset: 'DAI', supplyApy: '3.5%', borrowApy: '5.2%', tvl: '$4.1M', available: '$1.8M' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">\ud83c\udfe6 Borrow / Lending</h2>
                <div className="flex gap-1 rounded-lg bg-gray-800/50 p-1">
                    <button
                        onClick={() => setTab('lend')}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === 'lend' ? 'bg-violet-600/20 text-violet-400' : 'text-gray-500'
                            }`}
                    >
                        Lend
                    </button>
                    <button
                        onClick={() => setTab('borrow')}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === 'borrow' ? 'bg-violet-600/20 text-violet-400' : 'text-gray-500'
                            }`}
                    >
                        Borrow
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Your Supply</p>
                    <p className="mt-1 text-lg font-bold text-white">$0.00</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Your Borrow</p>
                    <p className="mt-1 text-lg font-bold text-white">$0.00</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs text-gray-500">Net APY</p>
                    <p className="mt-1 text-lg font-bold text-green-400">0.0%</p>
                </div>
            </div>

            {/* Pools table */}
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800 bg-gray-900/50">
                        <tr className="text-left text-xs text-gray-500">
                            <th className="px-4 py-3">Asset</th>
                            <th className="px-4 py-3 text-right">{tab === 'lend' ? 'Supply APY' : 'Borrow APY'}</th>
                            <th className="hidden px-4 py-3 text-right md:table-cell">TVL</th>
                            <th className="px-4 py-3 text-right">Available</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pools.map((pool) => (
                            <tr key={pool.asset} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-medium text-white">{pool.asset}</td>
                                <td className="px-4 py-3 text-right text-green-400">
                                    {tab === 'lend' ? pool.supplyApy : pool.borrowApy}
                                </td>
                                <td className="hidden px-4 py-3 text-right text-gray-400 md:table-cell">{pool.tvl}</td>
                                <td className="px-4 py-3 text-right text-gray-400">{pool.available}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handlePoolAction(pool)}
                                        disabled={submitting || !walletAddress}
                                        className="rounded-lg bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-400 hover:bg-violet-600/30 disabled:opacity-50"
                                    >
                                        {submitting ? '...' : tab === 'lend' ? 'Supply' : 'Borrow'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
