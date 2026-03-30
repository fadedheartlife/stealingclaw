import { useState, useEffect } from 'react';
import { subscribeToUserTrades, createTrade } from '@/services/database';
import { formatNumber } from '@/utils/helpers';

export default function C2CTrading({ walletAddress })
{
    const [tab, setTab] = useState('buy');

    const [c2cTrades, setC2cTrades] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() =>
    {
        if (!walletAddress) return;
        const unsub = subscribeToUserTrades(walletAddress, (trades) =>
        {
            setC2cTrades(trades.filter((t) => t.type === 'c2c'));
        });
        return unsub;
    }, [walletAddress]);

    const handleC2CTrade = async (offer) =>
    {
        if (!walletAddress || submitting) return;
        setSubmitting(true);
        try {
            await createTrade({
                walletAddress,
                pair: 'USDT/USD',
                side: tab,
                amount: offer.min,
                price: offer.price,
                type: 'c2c',
            });
        } catch (err) {
            console.error('C2C trade failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const mockOffers = [
        { id: 1, seller: '0xAb12...cD34', price: 1.01, min: 100, max: 10000, method: 'Bank Transfer', completion: '98%' },
        { id: 2, seller: '0xEf56...gH78', price: 1.00, min: 50, max: 5000, method: 'PayPal', completion: '95%' },
        { id: 3, seller: '0xIj90...kL12', price: 0.99, min: 200, max: 20000, method: 'Wise', completion: '99%' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">\ud83e\udd1d C2C Trading</h2>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
                    Post Offer
                </button>
            </div>

            <div className="flex gap-1 rounded-lg bg-gray-800/50 p-1">
                <button
                    onClick={() => setTab('buy')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium ${tab === 'buy' ? 'bg-green-600/20 text-green-400' : 'text-gray-500'
                        }`}
                >
                    Buy USDT
                </button>
                <button
                    onClick={() => setTab('sell')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium ${tab === 'sell' ? 'bg-red-600/20 text-red-400' : 'text-gray-500'
                        }`}
                >
                    Sell USDT
                </button>
            </div>

            <div className="space-y-3">
                {mockOffers.map((offer) => (
                    <div
                        key={offer.id}
                        className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4"
                    >
                        <div>
                            <p className="font-mono text-sm text-violet-400">{offer.seller}</p>
                            <p className="mt-1 text-xs text-gray-500">
                                {offer.method} \u00b7 {offer.completion} completion
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">${offer.price}</p>
                            <p className="text-xs text-gray-500">
                                ${offer.min} \u2013 ${offer.max.toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => handleC2CTrade(offer)}
                            disabled={submitting || !walletAddress}
                            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${tab === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                                }`}
                        >
                            {submitting ? '...' : tab === 'buy' ? 'Buy' : 'Sell'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
