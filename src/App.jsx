import { useState, useCallback } from 'react';
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

export default function App()
{
    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [walletProvider, setWalletProvider] = useState(null);
    const [toast, setToast] = useState(null);

    const handleConnect = useCallback(async (address, provider) =>
    {
        setConnectedAddress(address);
        setWalletProvider(provider || 'Unknown');
        setWalletModalOpen(false);
        setToast({ type: 'success', message: 'Wallet connected' });

        // Register / update user in Back4App (real-time tracked)
        try {
            await registerWalletUser(address, provider || 'Unknown');
        } catch (err) {
            console.error('Failed to register user:', err);
        }
    }, []);

    const handleDisconnect = useCallback(() =>
    {
        setConnectedAddress(null);
        setWalletProvider(null);
        setToast({ type: 'info', message: 'Wallet disconnected' });
    }, []);

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
                                            <Route path="/wallet" element={<Wallet walletAddress={connectedAddress} walletProvider={walletProvider} />} />
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
