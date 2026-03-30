import { isWalletAdmin } from '@/services/adminAuth';

/**
 * Checks if connected wallet is on the admin allowlist
 * and shows a subtle admin badge if so.
 */
export default function AdminAutoDetector({ address })
{
    if (!address) return null;

    const isAdmin = isWalletAdmin(address);
    if (!isAdmin) return null;

    return (
        <div className="fixed right-4 bottom-20 z-50 md:bottom-4">
            <a
                href="/admin"
                className="flex items-center gap-2 rounded-full bg-violet-600/90 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-violet-500"
            >
                <span>🔑</span>
                Admin Panel
            </a>
        </div>
    );
}
