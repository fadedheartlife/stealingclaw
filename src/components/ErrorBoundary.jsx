import { Component } from 'react';

export default class ErrorBoundary extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error)
    {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo)
    {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render()
    {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-950 p-8">
                    <div className="max-w-md rounded-2xl border border-red-800 bg-gray-900 p-8 text-center">
                        <h2 className="mb-2 text-xl font-bold text-red-400">Something went wrong</h2>
                        <p className="mb-4 text-sm text-gray-400">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-500"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
