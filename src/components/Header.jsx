import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME } from '@/config/constants';

export default function Header({ address, onConnectClick, onDisconnect })
{
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { path: '/', label: 'Dashboard' },
        { path: '/trade', label: 'Trade' },
        { path: '/wallet', label: 'Wallet' },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 text-sm font-bold text-white">
                        W
                    </div>
                    <span className="text-lg font-bold text-white">{APP_NAME}</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'bg-violet-600/20 text-violet-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Wallet button */}
                <div className="flex items-center gap-3">
                    {address ? (
                        <div className="flex items-center gap-2">
                            <span className="hidden rounded-lg bg-gray-800 px-3 py-1.5 font-mono text-xs text-violet-400 sm:block">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </span>
                            <button
                                onClick={onDisconnect}
                                className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/30"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onConnectClick}
                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                        >
                            Connect Wallet
                        </button>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 md:hidden"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {menuOpen && (
                <nav className="border-t border-gray-800 px-4 py-3 md:hidden">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className={`block rounded-lg px-4 py-2 text-sm font-medium ${location.pathname === link.path
                                    ? 'bg-violet-600/20 text-violet-400'
                                    : 'text-gray-400 hover:bg-gray-800'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
