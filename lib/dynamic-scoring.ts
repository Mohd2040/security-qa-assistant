// lib/dynamic-scoring.ts
/**
 * Dynamic weight calculation for hybrid scoring
 * Adapts weights based on query characteristics
 */

export interface ScoringWeights {
    semantic: number;
    fuzzy: number;
    bm25: number;
}

export interface QueryAnalysis {
    length: number;
    hasQuestionWords: boolean;
    complexity: 'simple' | 'medium' | 'complex';
}

/**
 * Analyze query characteristics
 */
export function analyzeQuery(query: string): QueryAnalysis {
    const words = query.trim().split(/\s+/);
    const length = words.length;

    // Check for question words
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which',
        'هل', 'ما', 'كيف', 'لماذا', 'متى', 'أين', 'من', 'أي'];
    const hasQuestionWords = words.some(word =>
        questionWords.includes(word.toLowerCase())
    );

    // Determine complexity
    let complexity: 'simple' | 'medium' | 'complex';
    if (length <= 3) {
        complexity = 'simple';
    } else if (length <= 7) {
        complexity = 'medium';
    } else {
        complexity = 'complex';
    }

    return { length, hasQuestionWords, complexity };
}

/**
 * Calculate dynamic weights based on query analysis
 */
export function calculateDynamicWeights(
    query: string,
    options?: {
        fuzzyTopScore?: number;
        semanticTopScore?: number;
    }
): ScoringWeights {
    const analysis = analyzeQuery(query);

    // Short queries (1-3 words) - favor fuzzy and BM25
    if (analysis.complexity === 'simple') {
        return {
            semantic: 0.25,
            fuzzy: 0.50,
            bm25: 0.25,
        };
    }

    // Long queries (8+ words) - favor semantic
    if (analysis.complexity === 'complex') {
        return {
            semantic: 0.60,
            fuzzy: 0.20,
            bm25: 0.20,
        };
    }

    // Medium queries - balanced approach
    return {
        semantic: 0.45,
        fuzzy: 0.30,
        bm25: 0.25,
    };
}

/**
 * Calculate hybrid score with dynamic weights
 */
export function calculateHybridScore(
    semanticScore: number,
    fuzzyScore: number,
    bm25Score: number,
    query: string
): number {
    const weights = calculateDynamicWeights(query);

    const hybridScore =
        semanticScore * weights.semantic +
        fuzzyScore * weights.fuzzy +
        bm25Score * weights.bm25;

    return hybridScore;
}

/**
 * Normalize BM25 score to 0-1 range
 * BM25 scores can vary widely, this normalizes them
 */
export function normalizeBM25Score(score: number, maxScore: number = 10): number {
    if (maxScore === 0) return 0;
    return Math.min(score / maxScore, 1);
}
