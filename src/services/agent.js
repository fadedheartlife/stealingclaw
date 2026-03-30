import { AGENT_CONFIG } from '@/config/back4app';

const AGENT_URL = AGENT_CONFIG.url;

/**
 * Send a message to the Back4App AI agent and get a response.
 * Used for AI-powered trading assistance, market analysis, and support.
 */
export async function sendAgentMessage(message, context = {})
{
    const res = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            context: {
                agentId: AGENT_CONFIG.id,
                ...context,
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Agent error: ${res.status}`);
    }

    return res.json();
}

/**
 * Stream a response from the Back4App AI agent (SSE).
 * Returns an async generator yielding text chunks.
 */
export async function* streamAgentMessage(message, context = {})
{
    const res = await fetch(`${AGENT_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            context: {
                agentId: AGENT_CONFIG.id,
                ...context,
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Agent error: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
    }
}

/**
 * Get trading signal / market analysis from the agent.
 */
export async function getTradeAnalysis(symbol, interval = '1h')
{
    return sendAgentMessage(`Analyze ${symbol} on ${interval} timeframe. Provide: trend direction, key support/resistance levels, and a confidence score 0-100.`, {
        type: 'trade_analysis',
        symbol,
        interval,
    });
}

/**
 * Ask the agent to evaluate a portfolio.
 */
export async function getPortfolioAdvice(holdings)
{
    return sendAgentMessage('Evaluate this portfolio and suggest optimizations.', {
        type: 'portfolio_advice',
        holdings,
    });
}

/**
 * Check agent health / availability.
 */
export async function checkAgentHealth()
{
    try {
        const res = await fetch(`${AGENT_URL}/health`, { method: 'GET' });
        return res.ok;
    } catch {
        return false;
    }
}
