// lib/adaptive-learning.ts
/**
 * Adaptive learning from user feedback
 * Automatically improves the system based on usage patterns
 */

import { getDb } from './mongodb';
import { MatchFeedback, FeedbackStats, calculateFeedbackStats } from './match-feedback';

export interface LearnedWeights {
    shortQueries: QueryLearning;
    mediumQueries: QueryLearning;
    longQueries: QueryLearning;
    lastUpdated: Date;
    totalFeedbacks: number;
}

export interface QueryLearning {
    acceptanceRate: number;
    averageScore: number;
    needsAdjustment: boolean;
    suggestedWeights?: {
        semantic: number;
        fuzzy: number;
        bm25: number;
    };
}

/**
 * Analyze feedbacks by query length
 */
function analyzeByLength(
    feedbacks: MatchFeedback[],
    minLen: number,
    maxLen: number
): QueryLearning {
    const subset = feedbacks.filter(f => {
        const len = f.question.split(/\s+/).length;
        return len >= minLen && len <= maxLen;
    });

    if (subset.length === 0) {
        return {
            acceptanceRate: 0,
            averageScore: 0,
            needsAdjustment: false,
        };
    }

    // Calculate acceptance rate
    const accepted = subset.filter(f => f.user_accepted).length;
    const acceptanceRate = accepted / subset.length;

    // Calculate average score
    const totalScore = subset.reduce((sum, f) => sum + f.similarity_score, 0);
    const averageScore = totalScore / subset.length;

    // Determine if adjustment needed
    const needsAdjustment = acceptanceRate < 0.75 || averageScore < 0.7;

    return {
        acceptanceRate,
        averageScore,
        needsAdjustment,
    };
}

/**
 * Learn from feedback and update system weights
 */
export async function learnFromFeedback(): Promise<LearnedWeights> {
    const db = await getDb();
    const feedbackCollection = db.collection<MatchFeedback>('match_feedback');

    // Get all feedbacks
    const feedbacks = await feedbackCollection.find({}).toArray();

    if (feedbacks.length === 0) {
        return {
            shortQueries: { acceptanceRate: 0, averageScore: 0, needsAdjustment: false },
            mediumQueries: { acceptanceRate: 0, averageScore: 0, needsAdjustment: false },
            longQueries: { acceptanceRate: 0, averageScore: 0, needsAdjustment: false },
            lastUpdated: new Date(),
            totalFeedbacks: 0,
        };
    }

    // Analyze different query lengths
    const shortQueries = analyzeByLength(feedbacks, 1, 3);
    const mediumQueries = analyzeByLength(feedbacks, 4, 7);
    const longQueries = analyzeByLength(feedbacks, 8, 100);

    const learnedWeights: LearnedWeights = {
        shortQueries,
        mediumQueries,
        longQueries,
        lastUpdated: new Date(),
        totalFeedbacks: feedbacks.length,
    };

    // Save learned weights to database
    const weightsCollection = db.collection('learned_weights');
    await weightsCollection.updateOne(
        { type: 'hybrid_weights' },
        { $set: learnedWeights },
        { upsert: true }
    );

    console.log('[Adaptive Learning] Updated weights:', {
        shortQueries: `${(shortQueries.acceptanceRate * 100).toFixed(1)}% acceptance`,
        mediumQueries: `${(mediumQueries.acceptanceRate * 100).toFixed(1)}% acceptance`,
        longQueries: `${(longQueries.acceptanceRate * 100).toFixed(1)}% acceptance`,
        totalFeedbacks: feedbacks.length,
    });

    return learnedWeights;
}

/**
 * Get learned weights from database
 */
export async function getLearnedWeights(): Promise<LearnedWeights | null> {
    const db = await getDb();
    const weightsCollection = db.collection<LearnedWeights>('learned_weights');

    const weights = await weightsCollection.findOne({ type: 'hybrid_weights' });
    return weights;
}

/**
 * Get feedback insights for monitoring
 */
export async function getFeedbackInsights(): Promise<{
    stats: FeedbackStats;
    byConfidence: Record<string, number>;
    recentTrends: Array<{ date: string, acceptanceRate: number }>;
}> {
    const db = await getDb();
    const feedbackCollection = db.collection<MatchFeedback>('match_feedback');

    const feedbacks = await feedbackCollection.find({}).toArray();
    const stats = calculateFeedbackStats(feedbacks);

    // Count by confidence level
    const byConfidence: Record<string, number> = {
        high: feedbacks.filter(f => f.match_confidence === 'high' && f.user_accepted).length,
        medium: feedbacks.filter(f => f.match_confidence === 'medium' && f.user_accepted).length,
        low: feedbacks.filter(f => f.match_confidence === 'low' && f.user_accepted).length,
        none: feedbacks.filter(f => f.match_confidence === 'none').length,
    };

    // Recent trends (last 7 days)
    const recentTrends: Array<{ date: string, acceptanceRate: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayFeedbacks = feedbacks.filter(f => {
            const fDate = new Date(f.timestamp);
            fDate.setHours(0, 0, 0, 0);
            return fDate.getTime() === date.getTime();
        });

        const accepted = dayFeedbacks.filter(f => f.user_accepted).length;
        const rate = dayFeedbacks.length > 0 ? accepted / dayFeedbacks.length : 0;

        recentTrends.push({
            date: date.toISOString().split('T')[0],
            acceptanceRate: rate,
        });
    }

    return { stats, byConfidence, recentTrends };
}
