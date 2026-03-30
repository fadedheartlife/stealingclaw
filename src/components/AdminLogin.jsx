import { useState } from 'react';
import { adminLogin } from '@/services/adminAuth';

export default function AdminLogin({ onSuccess })
{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e)
    {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const admin = await adminLogin(username, password);
            onSuccess?.(admin);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/50 p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                    <p className="mt-1 text-sm text-gray-500">Authorized personnel only</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-400">Username</label>
                        <input
                            type="text"
                            required
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-violet-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:bg-gray-700"
                    >
                        {loading ? 'Signing in\u2026' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
