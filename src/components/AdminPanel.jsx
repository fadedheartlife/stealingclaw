import { useState, useEffect, useCallback } from 'react';
import { hasPermission, getCurrentAdmin, adminLogout, subscribeToAdmins } from '@/services/adminAuth';
import
{
    subscribeToUsers,
    subscribeToDeposits,
    subscribeToWithdrawals,
    subscribeToTrades,
    subscribeToActiveChats,
    updateUserBalance,
    updateDepositStatus,
    updateWithdrawalStatus,
    updateKycStatus,
    subscribeToTradingLevelConfigs,
    saveTradingLevelConfig,
} from '@/services/database';
import { DEFAULT_BINARY_LEVELS, DEFAULT_ARBITRAGE_LEVELS } from '@/config/constants';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel()
{
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [activeTab, setActiveTab] = useState('users');

    // Real-time data
    const [users, setUsers] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [trades, setTrades] = useState([]);
    const [chats, setChats] = useState([]);
    const [admins, setAdmins] = useState([]);

    useEffect(() =>
    {
        setAdmin(getCurrentAdmin());
    }, []);

    useEffect(() =>
    {
        if (!admin) return;
        const subs = [];
        if (hasPermission(admin, 'manageUsers')) subs.push(subscribeToUsers(setUsers));
        if (hasPermission(admin, 'manageDeposits')) subs.push(subscribeToDeposits(setDeposits));
        if (hasPermission(admin, 'manageWithdrawals')) subs.push(subscribeToWithdrawals(setWithdrawals));
        if (hasPermission(admin, 'manageTrades')) subs.push(subscribeToTrades(setTrades));
        if (hasPermission(admin, 'customerService')) subs.push(subscribeToActiveChats(setChats));
        if (hasPermission(admin, 'createAdmins')) subs.push(subscribeToAdmins(setAdmins));
        return () => subs.forEach((u) => u());
    }, [admin]);

    const handleLogout = useCallback(async () =>
    {
        await adminLogout();
        navigate('/admin/login');
    }, [navigate]);

    if (!admin) return null;

    const tabs = [
        { key: 'users', label: 'Users', perm: 'manageUsers' },
        { key: 'deposits', label: 'Deposits', perm: 'manageDeposits' },
        { key: 'withdrawals', label: 'Withdrawals', perm: 'manageWithdrawals' },
        { key: 'trades', label: 'Trades', perm: 'manageTrades' },
        { key: 'kyc', label: 'KYC', perm: 'manageKYC' },
        { key: 'chats', label: 'Support', perm: 'customerService' },
        { key: 'admins', label: 'Admins', perm: 'createAdmins' },
        { key: 'settings', label: 'Settings', perm: 'siteSettings' },
        { key: 'tradingLevels', label: 'Trading Levels', perm: 'tradingLevels' },
    ].filter((t) => hasPermission(admin, t.perm));

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">Admin Panel</span>
                    <span className="rounded-full bg-violet-600/20 px-2 py-0.5 text-xs font-medium text-violet-400">
                        {admin.role}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{admin.username || admin.email}</span>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-600/30"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-48 shrink-0 border-r border-gray-800 py-4">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`block w-full px-6 py-2 text-left text-sm ${activeTab === t.key
                                ? 'bg-violet-600/10 text-violet-400 font-medium'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                    {activeTab === 'users' && <UsersTab users={users} />}
                    {activeTab === 'deposits' && <DepositsTab deposits={deposits} />}
                    {activeTab === 'withdrawals' && <WithdrawalsTab withdrawals={withdrawals} />}
                    {activeTab === 'trades' && <TradesTab trades={trades} />}
                    {activeTab === 'kyc' && <KycTab users={users} />}
                    {activeTab === 'chats' && <ChatsTab chats={chats} />}
                    {activeTab === 'admins' && <AdminsTab admins={admins} />}
                    {activeTab === 'settings' && <SettingsTab />}
                    {activeTab === 'tradingLevels' && <TradingLevelsTab />}
                </div>
            </div>
        </div>
    );
}

/* ---- Sub-tabs ---- */

function UsersTab({ users })
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Users ({users.length})</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800 bg-gray-900/50 text-xs text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">Address</th>
                            <th className="px-4 py-3 text-right">Balance (USD)</th>
                            <th className="px-4 py-3 text-center">KYC</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-600">No users yet</td>
                            </tr>
                        )}
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                <td className="px-4 py-3 font-mono text-xs text-violet-400">
                                    {u.address || u.id}
                                </td>
                                <td className="px-4 py-3 text-right text-white">
                                    ${(u.balance ?? 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-xs ${u.kycStatus === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {u.kycStatus || 'pending'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() =>
                                        {
                                            const amt = prompt('Set new balance:');
                                            if (amt !== null) updateUserBalance(u.id, Number(amt));
                                        }}
                                        className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
                                    >
                                        Set Balance
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DepositsTab({ deposits })
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Deposits ({deposits.length})</h3>
            <div className="space-y-2">
                {deposits.length === 0 && <p className="text-sm text-gray-600">No deposits</p>}
                {deposits.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                        <div>
                            <p className="font-mono text-xs text-gray-400">{d.userId}</p>
                            <p className="text-sm text-white">${d.amount} \u2013 {d.status}</p>
                        </div>
                        {d.status === 'pending' && (
                            <div className="flex gap-2">
                                <button onClick={() => updateDepositStatus(d.id, 'approved')} className="rounded bg-green-700 px-3 py-1 text-xs text-white">Approve</button>
                                <button onClick={() => updateDepositStatus(d.id, 'rejected')} className="rounded bg-red-700 px-3 py-1 text-xs text-white">Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function WithdrawalsTab({ withdrawals })
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Withdrawals ({withdrawals.length})</h3>
            <div className="space-y-2">
                {withdrawals.length === 0 && <p className="text-sm text-gray-600">No withdrawals</p>}
                {withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                        <div>
                            <p className="font-mono text-xs text-gray-400">{w.userId}</p>
                            <p className="text-sm text-white">${w.amount} \u2192 {w.toAddress} \u2013 {w.status}</p>
                        </div>
                        {w.status === 'pending' && (
                            <div className="flex gap-2">
                                <button onClick={() => updateWithdrawalStatus(w.id, 'approved')} className="rounded bg-green-700 px-3 py-1 text-xs text-white">Approve</button>
                                <button onClick={() => updateWithdrawalStatus(w.id, 'rejected')} className="rounded bg-red-700 px-3 py-1 text-xs text-white">Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TradesTab({ trades })
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Trades ({trades.length})</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800 bg-gray-900/50 text-xs text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Pair</th>
                            <th className="px-4 py-3 text-left">Side</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.length === 0 && (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-600">No trades</td></tr>
                        )}
                        {trades.map((t) => (
                            <tr key={t.id} className="border-b border-gray-800/50">
                                <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.userId}</td>
                                <td className="px-4 py-3 text-white">{t.pair}</td>
                                <td className={`px-4 py-3 ${t.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{t.side}</td>
                                <td className="px-4 py-3 text-right text-white">${t.amount}</td>
                                <td className="px-4 py-3 text-right text-xs text-gray-500">{t.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function KycTab({ users })
{
    const pending = users.filter((u) => u.kycStatus === 'pending' || !u.kycStatus);
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">KYC Verification ({pending.length} pending)</h3>
            <div className="space-y-2">
                {pending.length === 0 && <p className="text-sm text-gray-600">No pending KYC requests</p>}
                {pending.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                        <p className="font-mono text-xs text-violet-400">{u.address || u.id}</p>
                        <div className="flex gap-2">
                            <button onClick={() => updateKycStatus(u.id, 'approved')} className="rounded bg-green-700 px-3 py-1 text-xs text-white">Approve</button>
                            <button onClick={() => updateKycStatus(u.id, 'rejected')} className="rounded bg-red-700 px-3 py-1 text-xs text-white">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ChatsTab({ chats })
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Support Chats ({chats.length})</h3>
            <div className="space-y-2">
                {chats.length === 0 && <p className="text-sm text-gray-600">No active chats</p>}
                {chats.map((c) => (
                    <div key={c.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                        <p className="font-mono text-xs text-gray-400">{c.userId}</p>
                        <p className="mt-1 text-sm text-white">{c.lastMessage}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminsTab({ admins })
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Admin Accounts ({admins.length})</h3>
            <div className="space-y-2">
                {admins.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                        <div>
                            <p className="text-sm text-white">{a.email}</p>
                            <p className="text-xs text-gray-500">{a.role}</p>
                        </div>
                        <span className="rounded-full bg-violet-600/20 px-2 py-0.5 text-xs text-violet-400">
                            {a.permissions?.length || 0} permissions
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsTab()
{
    return (
        <div>
            <h3 className="mb-4 text-lg font-bold">Site Settings</h3>
            <div className="space-y-4">
                <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <label className="text-sm text-gray-400">Platform Name</label>
                    <input
                        type="text"
                        defaultValue="OnchainWeb"
                        className="mt-1 w-full rounded-lg bg-gray-800 px-4 py-2 text-white outline-none"
                    />
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <label className="text-sm text-gray-400">Maintenance Mode</label>
                    <div className="mt-2 flex gap-3">
                        <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white">Off</button>
                        <button className="rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-400">On</button>
                    </div>
                </div>
                <button className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500">
                    Save Settings
                </button>
            </div>
        </div>
    );
}

/* ---- Trading Levels Tab ---- */

function LevelEditor({ type, defaultLevels, label })
{
    const [levels, setLevels] = useState(defaultLevels);
    const [saving, setSaving] = useState({});
    const [saved, setSaved] = useState({});
    const [unsavedIndices, setUnsavedIndices] = useState(new Set());

    useEffect(() =>
    {
        const unsub = subscribeToTradingLevelConfigs(type, (dbLevels) =>
        {
            if (dbLevels && dbLevels.length === 5) {
                setLevels((prev) => {
                    // Only update levels that don't have unsaved changes
                    const sorted = dbLevels.sort((a, b) => a.level - b.level);
                    if (unsavedIndices.size === 0) {
                        // No unsaved changes, safe to update all
                        return sorted;
                    }
                    // Merge: keep unsaved rows, update saved ones
                    return prev.map((item, idx) => 
                        unsavedIndices.has(idx) ? item : sorted[idx]
                    );
                });
            }
        });
        return unsub;
    }, [type, unsavedIndices]);

    function handleChange(index, field, value)
    {
        // Mark this row as having unsaved changes
        setUnsavedIndices((prev) => new Set([...prev, index]));
        
        // Convert numeric fields to numbers
        const numericFields = ['profitPercent', 'tradingTime', 'minCapital'];
        const finalValue = numericFields.includes(field) ? Number(value) : value;
        
        setLevels((prev) =>
        {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: finalValue };
            return updated;
        });
    }

    async function handleSave(index)
    {
        const lvl = levels[index];
        const key = lvl.level;
        setSaving((p) => ({ ...p, [key]: true }));
        try {
            await saveTradingLevelConfig({ type, ...lvl });
            setSaved((p) => ({ ...p, [key]: true }));
            // Clear unsaved flag for this row
            setUnsavedIndices((prev) => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
            setTimeout(() => setSaved((p) => ({ ...p, [key]: false })), 2000);
        } catch (err) {
            console.error('Failed to save level config:', err);
        } finally {
            setSaving((p) => ({ ...p, [key]: false }));
        }
    }

    async function handleSaveAll()
    {
        for (let i = 0; i < levels.length; i++) {
            await handleSave(i);
        }
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{label}</h4>
                <button
                    onClick={handleSaveAll}
                    className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                >
                    Save All
                </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800 bg-gray-900/50 text-xs text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left w-8">Lv.</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-center">Profit %</th>
                            <th className="px-4 py-3 text-center">Trading Time (s)</th>
                            <th className="px-4 py-3 text-center">Min Capital ($)</th>
                            <th className="px-4 py-3 text-center w-20">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map((lvl, i) => (
                            <tr key={lvl.level} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                <td className="px-4 py-3 text-center font-bold text-violet-400">{lvl.level}</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={lvl.name}
                                        onChange={(e) => handleChange(i, 'name', e.target.value)}
                                        className="w-full rounded bg-gray-800 px-2 py-1 text-white outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={lvl.profitPercent}
                                        onChange={(e) => handleChange(i, 'profitPercent', e.target.value)}
                                        className="w-full rounded bg-gray-800 px-2 py-1 text-center text-green-400 outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={lvl.tradingTime}
                                        onChange={(e) => handleChange(i, 'tradingTime', e.target.value)}
                                        className="w-full rounded bg-gray-800 px-2 py-1 text-center text-white outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={lvl.minCapital}
                                        onChange={(e) => handleChange(i, 'minCapital', e.target.value)}
                                        className="w-full rounded bg-gray-800 px-2 py-1 text-center text-white outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleSave(i)}
                                        disabled={saving[lvl.level]}
                                        className="rounded bg-violet-700 px-3 py-1 text-xs text-white hover:bg-violet-600 disabled:bg-gray-700"
                                    >
                                        {saved[lvl.level] ? '✓' : saving[lvl.level] ? '...' : 'Save'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-2 text-xs text-gray-600">
                Trading Time is in seconds (e.g. 60 = 1 min, 3600 = 1 h, 86400 = 1 day).
                Changes take effect immediately for all users.
            </p>
        </div>
    );
}

function TradingLevelsTab()
{
    return (
        <div>
            <h3 className="mb-6 text-lg font-bold">Trading Level Configuration</h3>
            <LevelEditor
                type="binary"
                defaultLevels={DEFAULT_BINARY_LEVELS}
                label="🎯 Binary Options — 5 Levels"
            />
            <LevelEditor
                type="arbitrage"
                defaultLevels={DEFAULT_ARBITRAGE_LEVELS}
                label="🤖 AI Arbitrage — 5 Levels"
            />
        </div>
    );
}
