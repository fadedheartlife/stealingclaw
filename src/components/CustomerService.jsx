import { useState, useRef, useEffect } from 'react';
import { sendAgentMessage } from '@/services/agent';

export default function CustomerService()
{
    const [messages, setMessages] = useState([
        { id: 1, from: 'agent', text: 'Welcome! I\'m your AI trading assistant powered by Back4App. Ask me about trades, wallet setup, deposits, or any platform questions.', time: new Date().toISOString() },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() =>
    {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleSend(e)
    {
        e.preventDefault();
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');

        setMessages((prev) => [
            ...prev,
            { id: Date.now(), from: 'user', text: userMsg, time: new Date().toISOString() },
        ]);

        setLoading(true);
        try {
            const response = await sendAgentMessage(userMsg, { type: 'support' });
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, from: 'agent', text: response.reply || response.message || 'I received your message. A human agent will follow up if needed.', time: new Date().toISOString() },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, from: 'agent', text: 'Sorry, I\'m having trouble connecting. Please try again or contact us via the admin panel.', time: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50">
                <div className="border-b border-gray-800 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-white">\ud83d\udcac AI Support Assistant</h2>
                        <p className="text-xs text-gray-500">Powered by Back4App Agent</p>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${msg.from === 'user'
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-gray-800 text-gray-300'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm text-gray-500">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="border-t border-gray-800 p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about trading, wallets, deposits..."
                            disabled={loading}
                            className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
