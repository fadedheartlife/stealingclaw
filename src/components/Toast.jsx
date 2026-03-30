import { useState, useEffect, useCallback } from 'react';

export default function Toast({ message, type = 'info', duration = 4000, onClose })
{
    const [visible, setVisible] = useState(true);

    const dismiss = useCallback(() =>
    {
        setVisible(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    useEffect(() =>
    {
        const timer = setTimeout(dismiss, duration);
        return () => clearTimeout(timer);
    }, [dismiss, duration]);

    const colors = {
        success: 'border-green-500 bg-green-900/30 text-green-400',
        error: 'border-red-500 bg-red-900/30 text-red-400',
        warning: 'border-yellow-500 bg-yellow-900/30 text-yellow-400',
        info: 'border-blue-500 bg-blue-900/30 text-blue-400',
    };

    return (
        <div
            className={`fixed right-4 top-20 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg transition-all duration-300 ${colors[type] || colors.info
                } ${visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
        >
            <div className="flex items-center justify-between gap-3">
                <span>{message}</span>
                <button onClick={dismiss} className="text-current opacity-60 hover:opacity-100">
                    ✕
                </button>
            </div>
        </div>
    );
}
