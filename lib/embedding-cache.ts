// lib/embedding-cache.ts
/**
 * LRU Cache for OpenAI embeddings
 * Speeds up repeated queries and reduces API costs
 */

interface CacheEntry {
    embedding: number[];
    timestamp: number;
    accessCount: number;
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
    estimatedSavings: number; // in USD
}

class EmbeddingCache {
    private cache: Map<string, CacheEntry>;
    private maxSize: number;
    private ttl: number; // Time to live in milliseconds
    private hits: number = 0;
    private misses: number = 0;
    private readonly COST_PER_EMBEDDING = 0.00001; // Approximate cost for text-embedding-3-small

    constructor(maxSize: number = 1000, ttlMinutes: number = 60) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttlMinutes * 60 * 1000;
    }

    /**
     * Generate cache key from text (normalized)
     */
    private getCacheKey(text: string): string {
        return text.trim().toLowerCase();
    }

    /**
     * Get embedding from cache
     */
    get(text: string): number[] | null {
        const key = this.getCacheKey(text);
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        // Check if entry is expired
        const now = Date.now();
        if (now - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        // Update access count and timestamp (LRU)
        entry.accessCount++;
        entry.timestamp = now;
        this.hits++;

        return entry.embedding;
    }

    /**
     * Set embedding in cache
     */
    set(text: string, embedding: number[]): void {
        const key = this.getCacheKey(text);

        // If cache is full, remove least recently used entry
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        this.cache.set(key, {
            embedding,
            timestamp: Date.now(),
            accessCount: 1,
        });
    }

    /**
     * Evict least recently used entry
     */
    private evictLRU(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? this.hits / total : 0;
        const estimatedSavings = this.hits * this.COST_PER_EMBEDDING;

        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size,
            hitRate,
            estimatedSavings,
        };
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Clear expired entries
     */
    clearExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Global singleton instance
let embeddingCacheInstance: EmbeddingCache | null = null;

export function getEmbeddingCache(): EmbeddingCache {
    if (!embeddingCacheInstance) {
        embeddingCacheInstance = new EmbeddingCache(1000, 60); // 1000 entries, 60 min TTL
    }
    return embeddingCacheInstance;
}

export function logCacheStats(): void {
    if (!embeddingCacheInstance) return;

    const stats = embeddingCacheInstance.getStats();
    console.log('[Embedding Cache] Stats:', {
        hits: stats.hits,
        misses: stats.misses,
        size: stats.size,
        hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
        estimatedSavings: `$${stats.estimatedSavings.toFixed(4)}`,
    });
}
