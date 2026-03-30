import Parse from '@/config/back4app';
import { ADMIN_ROLES, ADMIN_PERMISSIONS } from '@/config/constants';

/* ================================================================
   ADMIN AUTH — username / password based (no wallet required)
   Master account is the ONLY account with role=master.
   All admin accounts are created exclusively by master.
   ================================================================ */

/**
 * Count how many master accounts exist in the database.
 * Used to enforce the single-master constraint.
 */
async function countMasters()
{
    const q = new Parse.Query(Parse.User);
    q.equalTo('role', ADMIN_ROLES.MASTER);
    return q.count({ useMasterKey: false });
}

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
        throw new Error('Access denied');
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

/** Check if current session is a logged-in admin (for badge/detection) */
export function isAdminSession()
{
    return getCurrentAdmin() !== null;
}

/** Listen to auth state changes (polling-based for Parse) */
export function onAdminAuthChange(callback)
{
    const current = getCurrentAdmin();
    callback(current);

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

/* ================================================================
   PERMISSION CHECK
   Master has ALL permissions automatically.
   Regular admins only get explicitly assigned permissions.
   ================================================================ */

/** Check if current user has a specific permission */
export function hasPermission(adminData, permission)
{
    if (!adminData) return false;
    if (adminData.role === ADMIN_ROLES.MASTER) return true;
    return (adminData.permissions || []).includes(permission);
}

/** Check if user is master role */
export function isMaster(adminData)
{
    return adminData?.role === ADMIN_ROLES.MASTER;
}

/* ================================================================
   ADMIN CRUD — only master can create / edit / remove admins
   Uses REST API for create to avoid logging out current session.
   ================================================================ */

/**
 * Create a new admin account (master only).
 * Uses Parse REST API so the current master session stays active.
 * CANNOT create another master — enforced both client-side and server-side.
 */
export async function createAdmin(username, password, email, role = ADMIN_ROLES.ADMIN, permissions = [])
{
    const caller = getCurrentAdmin();
    if (!caller || caller.role !== ADMIN_ROLES.MASTER) {
        throw new Error('Only master can create admin accounts');
    }

    if (!username || !password || password.length < 8) {
        throw new Error('Username and password (min 8 chars) required');
    }

    // Hard block: never allow creating another master from any path
    if (role === ADMIN_ROLES.MASTER) {
        throw new Error('Only one master account is allowed');
    }

    // Double-check: query DB — if somehow called with master role, reject
    const masterCount = await countMasters();
    if (masterCount > 0 && role === ADMIN_ROLES.MASTER) {
        throw new Error('Master account already exists');
    }

    const safeRole = ADMIN_ROLES.ADMIN; // always admin, never master
    const safePerms = permissions.filter((p) => ADMIN_PERMISSIONS.includes(p));

    const res = await fetch(`${Parse.serverURL}/users`, {
        method: 'POST',
        headers: {
            'X-Parse-Application-Id': Parse.applicationId,
            'X-Parse-JavaScript-Key': Parse._javaScriptKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
            email: email || undefined,
            role: safeRole,
            permissions: safePerms,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create admin (${res.status})`);
    }

    return res.json();
}

/**
 * Update an admin's role (master only). Cannot promote to master.
 * Cannot modify the master account's own role.
 */
export async function updateAdminRole(adminId, newRole)
{
    const caller = getCurrentAdmin();
    if (!caller || caller.role !== ADMIN_ROLES.MASTER) {
        throw new Error('Only master can change admin roles');
    }
    if (newRole === ADMIN_ROLES.MASTER) {
        throw new Error('Cannot promote to master — only one master is allowed');
    }
    if (adminId === caller.id) {
        throw new Error('Cannot modify master account role');
    }

    const query = new Parse.Query(Parse.User);
    const user = await query.get(adminId);

    // Extra safety: block demoting existing master
    if (user.get('role') === ADMIN_ROLES.MASTER) {
        throw new Error('Cannot modify master account');
    }

    user.set('role', newRole);
    await user.save();
}

/**
 * Update an admin's permissions (master only).
 */
export async function updateAdminPermissions(adminId, permissions)
{
    const caller = getCurrentAdmin();
    if (!caller || caller.role !== ADMIN_ROLES.MASTER) {
        throw new Error('Only master can change permissions');
    }

    const safePerms = permissions.filter((p) => ADMIN_PERMISSIONS.includes(p));

    const query = new Parse.Query(Parse.User);
    const user = await query.get(adminId);
    user.set('permissions', safePerms);
    await user.save();
}

/**
 * Remove admin access (demote to 'user' role). Master only.
 * Does not delete the Parse account — just removes admin privileges.
 */
export async function removeAdmin(adminId)
{
    const caller = getCurrentAdmin();
    if (!caller || caller.role !== ADMIN_ROLES.MASTER) {
        throw new Error('Only master can remove admins');
    }
    if (adminId === caller.id) {
        throw new Error('Cannot remove yourself');
    }

    const query = new Parse.Query(Parse.User);
    const user = await query.get(adminId);
    user.set('role', ADMIN_ROLES.USER);
    user.set('permissions', []);
    await user.save();
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

/** Subscribe to admin changes via Parse Live Query */
export function subscribeToAdmins(callback)
{
    const query = new Parse.Query(Parse.User);
    query.notEqualTo('role', ADMIN_ROLES.USER);
    query.exists('role');

    let sub = null;

    const mapUser = (u) => ({
        id: u.id,
        username: u.getUsername(),
        email: u.getEmail(),
        role: u.get('role'),
        permissions: u.get('permissions') || [],
    });

    query.find().then((results) => callback(results.map(mapUser)));

    query.subscribe().then((subscription) =>
    {
        sub = subscription;
        const refresh = () => query.find().then((r) => callback(r.map(mapUser)));
        sub.on('create', refresh);
        sub.on('update', refresh);
        sub.on('delete', refresh);
    });

    return () =>
    {
        if (sub) sub.unsubscribe();
    };
}
