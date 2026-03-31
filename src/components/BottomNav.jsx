import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Home', icon: '📊' },
    { path: '/trade', label: 'Trade', icon: '📈' },
    { path: '/binary', label: 'Binary', icon: '🎯' },
    { path: '/ai-arbitrage', label: 'AI Bot', icon: '🤖' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
];

export default function BottomNav()
{
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur md:hidden">
            <div className="flex items-stretch">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${location.pathname === item.path
                                ? 'text-violet-400'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {location.pathname === item.path && (
                            <span className="absolute inset-x-0 top-0 h-0.5 rounded-b bg-violet-500" />
                        )}
                        <span className="text-lg leading-none">{item.icon}</span>
                        <span className="leading-none">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
