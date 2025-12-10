// app/api/admin/qa/match-feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MatchFeedback, createFeedback, calculateFeedbackStats } from "@/lib/match-feedback";

export const runtime = "nodejs";

/**
 * POST /api/admin/qa/match-feedback
 * Save user feedback on match quality
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            question,
            matched_question_id,
            matched_question_text,
            similarity_score,
            match_confidence,
            user_accepted,
            correct_answer_id,
            correct_answer_text,
            feedback_notes,
            user_email,
            session_id,
        } = body;

        // Validation
        if (!question || !matched_question_id || similarity_score === undefined) {
            return NextResponse.json(
                { ok: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create feedback object
        const feedback = createFeedback(
            question,
            matched_question_id,
            matched_question_text,
            similarity_score,
            match_confidence,
            user_accepted,
            {
                correctedAnswerId: correct_answer_id,
                correctedAnswerText: correct_answer_text,
                notes: feedback_notes,
                userEmail: user_email,
                sessionId: session_id,
            }
        );

        // Save to database
        const db = await getDb();
        const collection = db.collection<MatchFeedback>("match_feedback");

        const result = await collection.insertOne(feedback as any);

        return NextResponse.json({
            ok: true,
            feedback_id: result.insertedId.toString(),
            message: "Feedback saved successfully",
        });
    } catch (err: any) {
        console.error("Error saving feedback:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/qa/match-feedback
 * Retrieve feedback entries (optionally filtered)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const sessionId = searchParams.get("session_id");

        const db = await getDb();
        const collection = db.collection<MatchFeedback>("match_feedback");

        // Build query
        const query: any = {};
        if (sessionId) {
            query.session_id = sessionId;
        }

        // Fetch feedbacks
        const feedbacks = await collection
            .find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        // Calculate stats
        const stats = calculateFeedbackStats(feedbacks);

        return NextResponse.json({
            ok: true,
            feedbacks,
            stats,
            count: feedbacks.length,
        });
    } catch (err: any) {
        console.error("Error fetching feedback:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
