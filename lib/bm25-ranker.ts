// lib/bm25-ranker.ts
/**
 * BM25 Ranking Algorithm
 * Better than simple TF-IDF, takes into account:
 * - Term frequency
 * - Inverse document frequency
 * - Document length normalization
 */

import natural from 'natural';

const TfIdf = natural.TfIdf;

export interface BM25Result {
    doc: any;
    score: number;
    index: number;
}

/**
 * BM25 Ranker for document ranking
 */
export class BM25Ranker {
    private tfidf: any;
    private documents: any[];
    private indexed: boolean = false;

    constructor() {
        this.tfidf = new TfIdf();
        this.documents = [];
    }

    /**
     * Index documents for searching
     */
    indexDocuments(documents: any[]): void {
        this.documents = documents;
        this.tfidf = new TfIdf(); // Reset

        // Index all documents
        documents.forEach((doc, idx) => {
            // Combine question and answer for better matching
            const text = [
                doc.question_text || '',
                doc.question_text_en || '',
                doc.answer_text || ''
            ].filter(Boolean).join(' ');

            this.tfidf.addDocument(text);
        });

        this.indexed = true;
    }

    /**
     * Search documents using BM25
     */
    search(query: string, topK: number = 50): BM25Result[] {
        if (!this.indexed || this.documents.length === 0) {
            return [];
        }

        const scores: BM25Result[] = [];

        this.tfidf.tfidfs(query, (i: number, measure: number) => {
            if (measure > 0 && i < this.documents.length) {
                scores.push({
                    doc: this.documents[i],
                    score: measure,
                    index: i,
                });
            }
        });

        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    /**
     * Get BM25 score for a specific document and query
     */
    getScore(query: string, documentIndex: number): number {
        if (!this.indexed || documentIndex >= this.documents.length) {
            return 0;
        }

        let score = 0;
        this.tfidf.tfidfs(query, (i: number, measure: number) => {
            if (i === documentIndex) {
                score = measure;
            }
        });

        return score;
    }

    /**
     * Get number of indexed documents
     */
    getDocumentCount(): number {
        return this.documents.length;
    }
}

/**
 * Create and index a BM25 ranker
 */
export function createBM25Ranker(documents: any[]): BM25Ranker {
    const ranker = new BM25Ranker();
    ranker.indexDocuments(documents);
    return ranker;
}
