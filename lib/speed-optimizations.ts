// lib/speed-optimizations.ts
/**
 * Speed optimization utilities for match-answers
 */

/**
 * Early stopping - stop processing if high confidence match found
 */
export function shouldStopEarly(
    bestScore: number,
    threshold: number = 0.95
): boolean {
    return bestScore >= threshold;
}

/**
 * Parallel embedding processing
 * Process multiple embeddings at once instead of sequentially
 */
export async function getEmbeddingsParallel<T>(
    items: T[],
    getTextFn: (item: T) => string,
    embeddingFn: (text: string) => Promise<number[] | null>
): Promise<Map<number, number[] | null>> {
    const results = new Map<number, number[] | null>();

    // Process all embeddings in parallel
    const promises = items.map(async (item, index) => {
        const text = getTextFn(item);
        const embedding = await embeddingFn(text);
        results.set(index, embedding);
    });

    await Promise.all(promises);
    return results;
}

/**
 * Smart candidate filtering - only process promising candidates
 */
export function filterWeakCandidates<T>(
    candidates: T[],
    scoreFn: (candidate: T) => number,
    minScore: number = 0.2,
    maxCandidates: number = 30
): T[] {
    return candidates
        .filter(c => scoreFn(c) >= minScore)
        .slice(0, maxCandidates);
}

/**
 * Batch processing helper
 * Process items in batches to avoid overwhelming the API
 */
export async function processBatch<T, R>(
    items: T[],
    processFn: (item: T) => Promise<R>,
    batchSize: number = 10
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => processFn(item))
        );
        results.push(...batchResults);
    }

    return results;
}
