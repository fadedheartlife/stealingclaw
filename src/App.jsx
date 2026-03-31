import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import AdminAutoDetector from './components/AdminAutoDetector';
import UniversalWalletModal from './components/UniversalWalletModal';

import Dashboard from './components/Dashboard';
import Trade from './components/Trade';
import FuturesTrading from './components/FuturesTrading';
import BinaryOptions from './components/BinaryOptions';
import C2CTrading from './components/C2CTrading';
import AIArbitrage from './components/AIArbitrage';
import BorrowLending from './components/BorrowLending';
import Wallet from './components/Wallet';
import CustomerService from './components/CustomerService';

import AdminLogin from './components/AdminLogin';
import AdminRouteGuard from './components/AdminRouteGuard';
import AdminPanel from './components/AdminPanel';
import { registerWalletUser } from './services/database';

const SESSION_KEY = 'wallet_session';

/** Persist the wallet session to localStorage */
function saveSession(address, provider, uid)
{
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ address, provider, uid }));
    } catch (err) {
        console.debug('saveSession: localStorage write failed', err);
    }
}

/** Remove the wallet session from localStorage */
function clearSession()
{
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (err) {
        console.debug('clearSession: localStorage remove failed', err);
    }
}

/** Read the persisted session (returns null if none) */
function loadSession()
{
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default function App()
{
    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [walletProvider, setWalletProvider] = useState(null);
    const [userId, setUserId] = useState(null);
    const [toast, setToast] = useState(null);
    const [autoConnecting, setAutoConnecting] = useState(true);

    const handleConnect = useCallback(async (address, provider) =>
    {
        // Addresses are stored and compared in lowercase throughout the app
        const normalized = address.toLowerCase();
        const resolvedProvider = provider || 'Unknown';
        setConnectedAddress(normalized);
        setWalletProvider(resolvedProvider);
        setWalletModalOpen(false);
        setToast({ type: 'success', message: 'Wallet connected' });

        // Register / update user in Back4App (real-time tracked)
        try {
            const user = await registerWalletUser(normalized, resolvedProvider);
            setUserId(user.id);
            saveSession(normalized, resolvedProvider, user.id);
        } catch (err) {
            console.error('Failed to register user:', err);
            saveSession(normalized, resolvedProvider, null);
        }
    }, []);

    const handleDisconnect = useCallback(() =>
    {
        setConnectedAddress(null);
        setWalletProvider(null);
        setUserId(null);
        clearSession();
        setToast({ type: 'info', message: 'Wallet disconnected' });
    }, []);

    // ── Auto-reconnect on page load ──────────────────────────────────────────
    useEffect(() =>
    {
        async function tryAutoConnect()
        {
            const session = loadSession();
            if (!session?.address) {
                setAutoConnecting(false);
                return;
            }

            // For injected wallets (MetaMask, Brave, etc.) verify the account is
            // still authorized without triggering a popup (eth_accounts vs eth_requestAccounts).
            const needsInjectedCheck =
                session.provider !== 'WalletConnect' &&
                session.provider !== 'Ledger' &&
                session.provider !== 'Safe';

            if (needsInjectedCheck && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    // Only restore if the saved address is still authorized
                    if (!accounts || !accounts.some((a) => a.toLowerCase() === session.address)) {
                        clearSession();
                        setAutoConnecting(false);
                        return;
                    }
                } catch {
                    // eth_accounts threw an unexpected error (provider bug, etc.).
                    // A locked wallet returns an empty array instead of throwing, so
                    // this path means the extension itself is unavailable. Clear the
                    // session to avoid a stale connection badge.
                    clearSession();
                    setAutoConnecting(false);
                    return;
                }
            }

            // Restore the session
            setConnectedAddress(session.address);
            setWalletProvider(session.provider);

            // Refresh lastSeen in the database (keeps user data live) and retrieve UID
            try {
                const user = await registerWalletUser(session.address, session.provider);
                setUserId(user.id);
                // Keep the persisted uid up-to-date
                saveSession(session.address, session.provider, user.id);
            } catch (err) {
                console.error('Failed to refresh user on auto-connect:', err);
                // Still restore the uid from the cached session if the DB call fails
                if (session.uid) setUserId(session.uid);
            }

            setAutoConnecting(false);
        }

        tryAutoConnect();
    }, []); // run once on mount

    // ── Listen for account/chain changes from the injected wallet ────────────
    useEffect(() =>
    {
        if (!window.ethereum) return;

        function onAccountsChanged(accounts)
        {
            if (!accounts || accounts.length === 0) {
                // User disconnected from wallet extension
                handleDisconnect();
            } else {
                const newAddress = accounts[0].toLowerCase();
                // Only act if a session was already active
                setConnectedAddress((current) =>
                {
                    if (current && current !== newAddress) {
                        // Switched to a different account — update session and UID
                        setWalletProvider((provider) =>
                        {
                            setUserId(null); // clear stale UID while we fetch the new one
                            registerWalletUser(newAddress, provider)
                                .then((user) =>
                                {
                                    setUserId(user.id);
                                    saveSession(newAddress, provider, user.id);
                                })
                                .catch(console.error);
                            return provider;
                        });
                        setToast({ type: 'info', message: 'Wallet account changed' });
                        return newAddress;
                    }
                    return current;
                });
            }
        }

        window.ethereum.on('accountsChanged', onAccountsChanged);
        return () => window.ethereum.removeListener('accountsChanged', onAccountsChanged);
    }, [handleDisconnect]);

    if (autoConnecting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    {/* Admin routes — separate layout */}
                    <Route path="/admin/login" element={<AdminLogin onSuccess={() => window.location.replace('/admin')} />} />
                    <Route
                        path="/admin/*"
                        element={
                            <AdminRouteGuard>
                                <AdminPanel />
                            </AdminRouteGuard>
                        }
                    />

                    {/* User-facing app */}
                    <Route
                        path="*"
                        element={
                            <div className="flex min-h-screen bg-gray-950 text-white">
                                {/* Desktop sidebar */}
                                <div className="hidden lg:block">
                                    <Sidebar />
                                </div>

                                <div className="flex flex-1 flex-col">
                                    <Header
                                        address={connectedAddress}
                                        userId={userId}
                                        onConnectClick={() => setWalletModalOpen(true)}
                                        onDisconnect={handleDisconnect}
                                    />

                                    <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
                                        <Routes>
                                            <Route path="/" element={<Dashboard walletAddress={connectedAddress} />} />
                                            <Route path="/trade" element={<Trade walletAddress={connectedAddress} />} />
                                            <Route path="/futures" element={<FuturesTrading walletAddress={connectedAddress} />} />
                                            <Route path="/binary" element={<BinaryOptions walletAddress={connectedAddress} />} />
                                            <Route path="/c2c" element={<C2CTrading walletAddress={connectedAddress} />} />
                                            <Route path="/ai-arbitrage" element={<AIArbitrage walletAddress={connectedAddress} />} />
                                            <Route path="/borrow" element={<BorrowLending walletAddress={connectedAddress} />} />
                                            <Route path="/wallet" element={<Wallet walletAddress={connectedAddress} walletProvider={walletProvider} userId={userId} />} />
                                            <Route path="/support" element={<CustomerService walletAddress={connectedAddress} />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </main>

                                    <Footer />
                                    <div className="lg:hidden">
                                        <BottomNav />
                                    </div>
                                </div>

                                {/* Overlays */}
                                {walletModalOpen && (
                                    <UniversalWalletModal
                                        onConnect={handleConnect}
                                        onClose={() => setWalletModalOpen(false)}
                                    />
                                )}
                                {connectedAddress && <AdminAutoDetector address={connectedAddress} />}
                                {toast && <Toast {...toast} onClose={() => setToast(null)} />}
                            </div>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
