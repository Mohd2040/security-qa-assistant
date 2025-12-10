// lib/match-feedback.ts
/**
 * Types and utilities for match feedback system
 * Allows users to provide feedback on match quality for continuous improvement
 */

export interface MatchFeedback {
    _id?: string;
    question: string;
    matched_question_id: string;
    matched_question_text: string;
    similarity_score: number;
    match_confidence: "high" | "medium" | "low" | "none";
    user_accepted: boolean;
    user_corrected: boolean;
    correct_answer_id?: string;
    correct_answer_text?: string;
    feedback_notes?: string;
    timestamp: Date;
    user_email?: string;
    session_id?: string;
}

export interface FeedbackStats {
    total: number;
    accepted: number;
    rejected: number;
    corrected: number;
    acceptanceRate: number;
    averageScore: number;
    highConfidenceAcceptance: number;
    mediumConfidenceAcceptance: number;
    lowConfidenceAcceptance: number;
}

/**
 * Create a new feedback entry
 */
export function createFeedback(
    question: string,
    matchedQuestionId: string,
    matchedQuestionText: string,
    similarityScore: number,
    matchConfidence: "high" | "medium" | "low" | "none",
    userAccepted: boolean,
    options?: {
        correctedAnswerId?: string;
        correctedAnswerText?: string;
        notes?: string;
        userEmail?: string;
        sessionId?: string;
    }
): MatchFeedback {
    return {
        question,
        matched_question_id: matchedQuestionId,
        matched_question_text: matchedQuestionText,
        similarity_score: similarityScore,
        match_confidence: matchConfidence,
        user_accepted: userAccepted,
        user_corrected: !!options?.correctedAnswerId,
        correct_answer_id: options?.correctedAnswerId,
        correct_answer_text: options?.correctedAnswerText,
        feedback_notes: options?.notes,
        timestamp: new Date(),
        user_email: options?.userEmail,
        session_id: options?.sessionId,
    };
}

/**
 * Calculate feedback statistics
 */
export function calculateFeedbackStats(feedbacks: MatchFeedback[]): FeedbackStats {
    if (feedbacks.length === 0) {
        return {
            total: 0,
            accepted: 0,
            rejected: 0,
            corrected: 0,
            acceptanceRate: 0,
            averageScore: 0,
            highConfidenceAcceptance: 0,
            mediumConfidenceAcceptance: 0,
            lowConfidenceAcceptance: 0,
        };
    }

    const accepted = feedbacks.filter(f => f.user_accepted).length;
    const rejected = feedbacks.filter(f => !f.user_accepted && !f.user_corrected).length;
    const corrected = feedbacks.filter(f => f.user_corrected).length;

    const totalScore = feedbacks.reduce((sum, f) => sum + f.similarity_score, 0);

    const highConf = feedbacks.filter(f => f.match_confidence === 'high');
    const mediumConf = feedbacks.filter(f => f.match_confidence === 'medium');
    const lowConf = feedbacks.filter(f => f.match_confidence === 'low');

    return {
        total: feedbacks.length,
        accepted,
        rejected,
        corrected,
        acceptanceRate: accepted / feedbacks.length,
        averageScore: totalScore / feedbacks.length,
        highConfidenceAcceptance: highConf.length > 0
            ? highConf.filter(f => f.user_accepted).length / highConf.length
            : 0,
        mediumConfidenceAcceptance: mediumConf.length > 0
            ? mediumConf.filter(f => f.user_accepted).length / mediumConf.length
            : 0,
        lowConfidenceAcceptance: lowConf.length > 0
            ? lowConf.filter(f => f.user_accepted).length / lowConf.length
            : 0,
    };
}
