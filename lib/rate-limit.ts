// lib/rate-limit.ts

/**
 * Simple Memory-based Rate Limiter
 * Note: In a production environment with multiple instances (like Render/Vercel),
 * a Redis-based rate limiter is recommended.
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
    limit: number;      // Maximum number of requests
    windowMs: number;   // Window size in milliseconds
}

export function rateLimit(identifier: string, options: RateLimitOptions) {
    const now = Date.now();
    const record = store[identifier];

    if (!record || now > record.resetTime) {
        // Start a new window
        store[identifier] = {
            count: 1,
            resetTime: now + options.windowMs,
        };
        return {
            success: true,
            remaining: options.limit - 1,
            reset: store[identifier].resetTime,
        };
    }

    if (record.count >= options.limit) {
        // Limit exceeded
        return {
            success: false,
            remaining: 0,
            reset: record.resetTime,
        };
    }

    // Increment count
    record.count += 1;
    return {
        success: true,
        remaining: options.limit - record.count,
        reset: record.resetTime,
    };
}

/**
 * Helper to get client IP from request headers
 */
export function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return "127.0.0.1";
}
