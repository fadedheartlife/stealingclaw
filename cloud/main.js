/* ================================================================
   Back4App Cloud Code — server-side security enforcement
   Deploy via Back4App Dashboard > Cloud Code > Cloud Code Functions.
   Paste this entire file into main.js in the Cloud Code editor.
   ================================================================ */

/**
 * beforeSave on _User:
 * 1. Only ONE master account can exist — ever.
 * 2. Nobody can self-assign 'master' or 'admin' role via signup.
 * 3. Only existing master can set role/permissions on other users.
 * 4. Master account role cannot be changed.
 */
Parse.Cloud.beforeSave(Parse.User, async (req) =>
{
    const user = req.object;
    const original = req.original; // undefined on new objects
    const isNew = !original;

    const newRole = user.get('role');
    const oldRole = original ? original.get('role') : undefined;

    // If role or permissions are being set, enforce rules
    const roleChanged = newRole !== oldRole;
    const permsChanged = JSON.stringify(user.get('permissions') || []) !==
        JSON.stringify(original ? (original.get('permissions') || []) : []);

    if (!roleChanged && !permsChanged) return; // nothing admin-related changed

    // 1. Block self-signup with admin/master role
    if (isNew && (newRole === 'master' || newRole === 'admin')) {
        // Check if request comes from master session
        const caller = req.user;
        if (!caller) {
            throw new Error('Cannot self-assign admin role');
        }
        const callerRole = caller.get('role');
        if (callerRole !== 'master') {
            throw new Error('Only master can create admin accounts');
        }
    }

    // 2. Enforce single master
    if (newRole === 'master') {
        const masterQuery = new Parse.Query(Parse.User);
        masterQuery.equalTo('role', 'master');
        if (!isNew) {
            masterQuery.notEqualTo('objectId', user.id);
        }
        const existingMaster = await masterQuery.count({ useMasterKey: true });
        if (existingMaster > 0) {
            throw new Error('Only one master account is allowed');
        }
    }

    // 3. Cannot change the master account's role
    if (!isNew && oldRole === 'master' && roleChanged) {
        throw new Error('Master account role cannot be modified');
    }

    // 4. Only master can change role/permissions on existing users
    if (!isNew && (roleChanged || permsChanged)) {
        const caller = req.user;
        if (!caller) {
            throw new Error('Authentication required to modify roles');
        }
        // Refetch caller to get latest role (avoid stale cache)
        const callerQ = new Parse.Query(Parse.User);
        const callerFresh = await callerQ.get(caller.id, { useMasterKey: true });
        if (callerFresh.get('role') !== 'master') {
            throw new Error('Only master can modify admin roles and permissions');
        }
    }
});

/**
 * beforeDelete on _User:
 * Master account cannot be deleted.
 */
Parse.Cloud.beforeDelete(Parse.User, async (req) =>
{
    const user = req.object;
    if (user.get('role') === 'master') {
        throw new Error('Master account cannot be deleted');
    }
});
