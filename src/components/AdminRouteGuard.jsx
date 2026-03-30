import { useEffect, useState } from 'react';
import { getCurrentAdmin, hasPermission } from '@/services/adminAuth';
import { useNavigate, Navigate } from 'react-router-dom';

export default function AdminRouteGuard({ children, requiredPermission })
{
    const [admin, setAdmin] = useState(undefined); // undefined = loading
    const navigate = useNavigate();

    useEffect(() =>
    {
        const a = getCurrentAdmin();
        setAdmin(a);
    }, []);

    if (admin === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/admin/login" replace />;
    }

    if (requiredPermission && !hasPermission(admin, requiredPermission)) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-center">
                <p className="text-xl font-bold text-red-400">Access Denied</p>
                <p className="mt-2 text-sm text-gray-500">
                    You don't have the <code className="text-violet-400">{requiredPermission}</code> permission.
                </p>
                <button
                    onClick={() => navigate('/admin')}
                    className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                    Back to Admin
                </button>
            </div>
        );
    }

    return children;
}
