// lib/rate-limiter.ts
/**
 * Rate Limiting للحماية من الاستنزاف والهجمات
 * يحد عدد الطلبات من نفس IP في فترة زمنية معينة
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory storage (للبساطة - في الإنتاج استخدم Redis)
const store: RateLimitStore = {};

// تنظيف الـ store كل 10 دقائق
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
    windowMs: number;  // الفترة الزمنية بالميلي ثانية
    maxRequests: number;  // أقصى عدد طلبات
}

// تكوينات مختلفة حسب نوع الـ API
export const RATE_LIMITS = {
    // APIs عامة - 100 طلب في الدقيقة
    standard: {
        windowMs: 60 * 1000,
        maxRequests: 100
    },
    // Admin APIs - 20 طلب في الدقيقة
    admin: {
        windowMs: 60 * 1000,
        maxRequests: 20
    },
    // Match API - 5 طلبات في الساعة (عملية ثقيلة)
    match: {
        windowMs: 60 * 60 * 1000,
        maxRequests: 5
    },
    // Search API - 200 طلب في الدقيقة
    search: {
        windowMs: 60 * 1000,
        maxRequests: 200
    }
};

/**
 * التحقق من حد الطلبات
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;

    // إذا لم يكن موجود أو انتهت الفترة، أنشئ جديد
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 1,
            resetTime: now + config.windowMs
        };

        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: store[key].resetTime
        };
    }

    // زد العداد
    store[key].count++;

    // تحقق من تجاوز الحد
    if (store[key].count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: store[key].resetTime
        };
    }

    return {
        allowed: true,
        remaining: config.maxRequests - store[key].count,
        resetTime: store[key].resetTime
    };
}

/**
 * استخراج IP من الـ Request
 */
export function getClientIdentifier(req: Request): string {
    // Try to get real IP from headers (for production behind proxy)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback (won't work in production but ok for dev)
    return 'unknown';
}

/**
 * Helper function لإرجاع استجابة Rate Limit
 */
export function rateLimitResponse(resetTime: number) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return new Response(
        JSON.stringify({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': '0',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(resetTime).toISOString()
            }
        }
    );
}
