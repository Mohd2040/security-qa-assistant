// lib/auth.ts
/**
 * Authentication & Authorization
 * حماية Admin APIs من الوصول غير المصرح
 */

/**
 * التحقق من API Key
 */
export function isValidApiKey(apiKey: string | null): boolean {
    if (!apiKey) return false;

    const validKey = process.env.ADMIN_API_KEY;

    // إذا لم يتم تعيين API Key في البيئة، نسمح (للتطوير فقط)
    if (!validKey) {
        console.warn('[AUTH] ADMIN_API_KEY not set - allowing all requests (DEVELOPMENT ONLY)');
        return true;
    }

    return apiKey === validKey;
}

/**
 * استخراج API Key من الـ Request
 */
export function extractApiKey(req: Request): string | null {
    // Method 1: Bearer token in Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Method 2: X-API-Key header
    const apiKeyHeader = req.headers.get('x-api-key');
    if (apiKeyHeader) {
        return apiKeyHeader;
    }

    return null;
}

/**
 * Helper function لإرجاع استجابة Unauthorized
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return new Response(
        JSON.stringify({
            error: 'Unauthorized',
            message,
            hint: 'Please provide a valid API key in Authorization header (Bearer token) or X-API-Key header'
        }),
        {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'WWW-Authenticate': 'Bearer'
            }
        }
    );
}

/**
 * التحقق من الصلاحيات
 */
export function checkAuth(req: Request): boolean {
    const apiKey = extractApiKey(req);
    return isValidApiKey(apiKey);
}
