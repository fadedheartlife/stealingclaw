import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/trade', label: 'Trade', icon: '📈' },
    { path: '/futures', label: 'Futures', icon: '⚡' },
    { path: '/binary', label: 'Binary', icon: '🎯' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
];

export default function BottomNav()
{
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur md:hidden">
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${location.pathname === item.path
                                ? 'text-violet-400'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
