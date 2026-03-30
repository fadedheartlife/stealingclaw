import Parse from '@/config/back4app';
import { ADMIN_ROLES } from '@/config/constants';

/**
 * Sign in admin with username/password via Parse.
 * After auth, verify the user has an admin role.
 */
export async function adminLogin(username, password)
{
    const user = await Parse.User.logIn(username, password);
    const role = user.get('role');

    if (!role || role === ADMIN_ROLES.USER) {
        await Parse.User.logOut();
        throw new Error('Not authorized as admin');
    }

    return {
        id: user.id,
        username: user.getUsername(),
        email: user.getEmail(),
        role: role,
        permissions: user.get('permissions') || [],
    };
}

/** Sign out current admin */
export async function adminLogout()
{
    await Parse.User.logOut();
}

/** Get the current session admin, or null */
export function getCurrentAdmin()
{
    const user = Parse.User.current();
    if (!user) return null;
    const role = user.get('role');
    if (!role || role === ADMIN_ROLES.USER) return null;
    return {
        id: user.id,
        username: user.getUsername(),
        email: user.getEmail(),
        role,
        permissions: user.get('permissions') || [],
    };
}

/** Listen to auth state changes (polling-based for Parse) */
export function onAdminAuthChange(callback)
{
    // Immediately check current session
    const current = getCurrentAdmin();
    callback(current);

    // Parse doesn't have a built-in auth listener, but we check
    // session validity periodically
    const interval = setInterval(async () =>
    {
        try {
            const user = Parse.User.current();
            if (user) {
                await user.fetch();
                callback(getCurrentAdmin());
            } else {
                callback(null);
            }
        } catch {
            callback(null);
        }
    }, 30000);

    return () => clearInterval(interval);
}

/**
 * Check if a wallet address is in the admin allowlist.
 */
export function isWalletAdmin(address)
{
    const allowlist = (import.meta.env.VITE_ADMIN_ALLOWLIST || '')
        .split(',')
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean);
    return allowlist.includes(address.toLowerCase());
}

/** Get admin data by ID */
export async function getAdminById(id)
{
    const query = new Parse.Query(Parse.User);
    try {
        const user = await query.get(id);
        return {
            id: user.id,
            username: user.getUsername(),
            email: user.getEmail(),
            role: user.get('role'),
            permissions: user.get('permissions') || [],
        };
    } catch {
        return null;
    }
}

/** Create or update admin user in Back4App */
export async function upsertAdmin(id, data)
{
    const query = new Parse.Query(Parse.User);
    const user = await query.get(id);
    if (data.role) user.set('role', data.role);
    if (data.permissions) user.set('permissions', data.permissions);
    if (data.email) user.set('email', data.email);
    await user.save(null, { useMasterKey: false });
}

/** Check if current user has a specific permission */
export function hasPermission(adminData, permission)
{
    if (!adminData) return false;
    if (adminData.role === ADMIN_ROLES.MASTER) return true;
    return (adminData.permissions || []).includes(permission);
}

/** Fetch all admin users from Back4App */
export async function fetchAdmins()
{
    const query = new Parse.Query(Parse.User);
    query.notEqualTo('role', ADMIN_ROLES.USER);
    query.exists('role');
    const results = await query.find();
    return results.map((u) => ({
        id: u.id,
        username: u.getUsername(),
        email: u.getEmail(),
        role: u.get('role'),
        permissions: u.get('permissions') || [],
    }));
}
