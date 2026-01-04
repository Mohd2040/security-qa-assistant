// lib/query-expander.ts
/**
 * Query expansion using synonyms for better matching
 */

import { getSynonyms, hasSynonyms } from './arabic-synonyms';
import { normalizeArabic } from './arabic';

export interface ExpandedQuery {
    original: string;
    variations: string[];
    expandedTerms: Map<string, string[]>; // word -> synonyms
}

/**
 * Extract important keywords from query
 * Filters out common words and focuses on meaningful terms
 */
function extractKeywords(query: string): string[] {
    const commonWords = new Set([
        'هل', 'ما', 'كيف', 'لماذا', 'متى', 'أين', 'من', 'في', 'على', 'إلى',
        'the', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'have', 'has',
        'can', 'could', 'will', 'would', 'should', 'may', 'might',
        'يتم', 'تم', 'عند', 'لدى', 'لديكم', 'يوجد', 'توجد'
    ]);

    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word));
}

/**
 * Expand query with synonyms
 * Returns original query + variations with synonyms
 */
export function expandQuery(query: string, maxVariations: number = 5): ExpandedQuery {
    const keywords = extractKeywords(query);
    const expandedTerms = new Map<string, string[]>();
    const variations: string[] = [query]; // Always include original

    // Find keywords with synonyms
    const expandableKeywords = keywords.filter(word => {
        const synonyms = getSynonyms(word);
        if (synonyms.length > 0) {
            expandedTerms.set(word, synonyms);
            return true;
        }
        return false;
    });

    // Generate variations by replacing keywords with synonyms
    for (const keyword of expandableKeywords) {
        const synonyms = expandedTerms.get(keyword) || [];

        // Limit number of variations per keyword
        const samplesToUse = synonyms.slice(0, 2); // Use top 2 synonyms

        for (const synonym of samplesToUse) {
            // Create variation by replacing keyword with synonym
            const variation = query.replace(
                new RegExp(`\\b${keyword}\\b`, 'gi'),
                synonym
            );

            if (variation !== query && variations.length < maxVariations) {
                variations.push(variation);
            }
        }
    }

    return {
        original: query,
        variations,
        expandedTerms,
    };
}

/**
 * Expand and normalize query for better matching
 */
export function expandAndNormalize(query: string): string[] {
    const expanded = expandQuery(query);

    // Normalize all variations
    return expanded.variations.map(v => normalizeArabic(v, true));
}

/**
 * Check if query would benefit from expansion
 */
export function shouldExpand(query: string): boolean {
    const keywords = extractKeywords(query);
    return keywords.some(word => hasSynonyms(word));
}
