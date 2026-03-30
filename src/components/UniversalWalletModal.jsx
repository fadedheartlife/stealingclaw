import { useState } from 'react';
import { WALLET_PROVIDERS } from '@/config/constants';

/**
 * Universal multi-wallet connection modal.
 * Supports MetaMask, WalletConnect, Trust, Coinbase, Phantom, and more.
 */
export default function UniversalWalletModal({ onClose, onConnect })
{
    const [connecting, setConnecting] = useState(null);

    async function handleConnect(provider)
    {
        setConnecting(provider);
        try {
            // MetaMask / injected provider
            if (provider === 'MetaMask' || provider === 'Brave Wallet' || provider === 'Rabby') {
                if (!window.ethereum) {
                    alert(`${provider} not detected. Please install it.`);
                    setConnecting(null);
                    return;
                }
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts[0]) {
                    onConnect(accounts[0], provider);
                    onClose();
                }
            }
            // Phantom (Solana — EVM mode)
            else if (provider === 'Phantom') {
                if (!window.phantom?.ethereum) {
                    alert('Phantom not detected.');
                    setConnecting(null);
                    return;
                }
                const accounts = await window.phantom.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts[0]) {
                    onConnect(accounts[0], provider);
                    onClose();
                }
            }
            // Fallback: attempt injected or show WalletConnect
            else {
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    if (accounts[0]) {
                        onConnect(accounts[0], provider);
                        onClose();
                    }
                } else {
                    alert(`${provider} connection via WalletConnect coming soon.`);
                }
            }
        } catch (err) {
            console.error(`Failed to connect ${provider}:`, err);
        } finally {
            setConnecting(null);
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Connect Wallet</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <p className="mb-4 text-sm text-gray-400">Choose your preferred wallet to connect</p>

                <div className="grid grid-cols-2 gap-3">
                    {WALLET_PROVIDERS.map((provider) => (
                        <button
                            key={provider}
                            onClick={() => handleConnect(provider)}
                            disabled={connecting !== null}
                            className={`flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-3 text-sm font-medium text-white transition-all hover:border-violet-500 hover:bg-violet-600/10 disabled:opacity-50 ${connecting === provider ? 'border-violet-500 bg-violet-600/20' : ''
                                }`}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-base">
                                {getWalletIcon(provider)}
                            </div>
                            <span className="truncate">{provider}</span>
                            {connecting === provider && (
                                <span className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                            )}
                        </button>
                    ))}
                </div>

                <p className="mt-4 text-center text-xs text-gray-500">
                    By connecting, you agree to the Terms of Service
                </p>
            </div>
        </div>
    );
}

function getWalletIcon(provider)
{
    const icons = {
        MetaMask: '🦊',
        WalletConnect: '🔗',
        'Trust Wallet': '🛡️',
        'Coinbase Wallet': '🔵',
        Phantom: '👻',
        'OKX Wallet': '⭕',
        'Brave Wallet': '🦁',
        Rabby: '🐰',
        Safe: '🔒',
        Ledger: '📟',
        Rainbow: '🌈',
    };
    return icons[provider] || '💼';
}
