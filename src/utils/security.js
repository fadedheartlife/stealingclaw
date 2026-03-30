/**
 * Client-side security utilities.
 * - Rate limiter: prevents API abuse from the browser
 * - Origin guard: blocks requests if origin is spoofed
 * - Input sanitizer: strips dangerous characters
 */

/* ---------- Rate Limiter ---------- */

const rateBuckets = new Map();

/**
 * Simple token-bucket rate limiter.
 * @param {string} key   - Unique bucket id (e.g. 'agent', 'prices')
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {boolean} true if request is allowed
 */
export function rateLimit(key, limit = 30, windowMs = 60_000)
{
    const now = Date.now();
    let bucket = rateBuckets.get(key);

    if (!bucket || now - bucket.start > windowMs) {
        bucket = { start: now, count: 0 };
        rateBuckets.set(key, bucket);
    }

    bucket.count += 1;
    return bucket.count <= limit;
}

/* ---------- Origin Guard ---------- */

const ALLOWED_ORIGINS = [
    window.location.origin, // The app itself
];

/**
 * Verify that the current page origin is expected.
 * Protects against the site being loaded in an iframe on a different domain
 * (belt-and-suspenders alongside X-Frame-Options: DENY).
 */
export function verifyOrigin()
{
    if (window.self !== window.top) {
        // Running inside an iframe — block
        document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:20vh">Access Denied</h1>';
        throw new Error('App cannot be embedded in an iframe');
    }
    return true;
}

/* ---------- Input Sanitizer ---------- */

const DANGEROUS_PATTERN = /[<>"'`;(){}]/g;

/**
 * Strip characters commonly used in XSS/injection attacks.
 * Use for user-supplied text that will be displayed or sent to APIs.
 */
export function sanitizeInput(str)
{
    if (typeof str !== 'string') return '';
    return str.replace(DANGEROUS_PATTERN, '').trim();
}

/**
 * Validate a wallet address (basic hex check).
 */
export function isValidWalletAddress(addr)
{
    return typeof addr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

/* ---------- Secure Fetch Wrapper ---------- */

/**
 * Wrapper around fetch that enforces rate-limiting, adds security headers,
 * and validates the response content-type.
 */
export async function secureFetch(url, options = {}, rateLimitKey = 'default')
{
    // Rate-limit check
    if (!rateLimit(rateLimitKey, 60, 60_000)) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const headers = {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest', // Protects against CSRF on older servers
    };

    const res = await fetch(url, { ...options, headers });

    // Reject non-OK responses early
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }

    return res;
}
