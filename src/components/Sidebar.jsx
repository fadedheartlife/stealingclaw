import { Link, useLocation } from 'react-router-dom';

const sidebarSections = [
    {
        label: 'Trading',
        items: [
            { path: '/', label: 'Dashboard', icon: '📊' },
            { path: '/trade', label: 'Spot Trade', icon: '📈' },
            { path: '/futures', label: 'Futures', icon: '⚡' },
            { path: '/binary', label: 'Binary Options', icon: '🎯' },
            { path: '/c2c', label: 'C2C Trading', icon: '🤝' },
            { path: '/ai-arbitrage', label: 'AI Arbitrage', icon: '🤖' },
        ],
    },
    {
        label: 'Finance',
        items: [
            { path: '/wallet', label: 'Wallet', icon: '👛' },
            { path: '/borrow', label: 'Borrow / Lending', icon: '🏦' },
        ],
    },
    {
        label: 'Support',
        items: [
            { path: '/support', label: 'Customer Service', icon: '💬' },
        ],
    },
];

export default function Sidebar({ isOpen, onClose })
{
    const location = useLocation();

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-800 bg-gray-950 transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
            >
                <div className="flex h-full flex-col overflow-y-auto p-4">
                    {sidebarSections.map((section) => (
                        <div key={section.label} className="mb-6">
                            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {section.label}
                            </h3>
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path
                                            ? 'bg-violet-600/20 text-violet-400'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
}
