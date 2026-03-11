// app/api/admin/qa/learn/route.ts
/**
 * API endpoint for adaptive learning
 * Triggers learning from feedback and returns insights
 */

import { NextRequest, NextResponse } from "next/server";
import { learnFromFeedback, getFeedbackInsights, getLearnedWeights } from "@/lib/adaptive-learning";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/qa/learn
 * Trigger learning from feedback
 */
export async function POST(req: NextRequest) {
    try {
        const learnedWeights = await learnFromFeedback();

        return NextResponse.json({
            ok: true,
            message: "Learning completed successfully",
            weights: learnedWeights,
        });
    } catch (err: any) {
        console.error("Error during learning:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/qa/learn
 * Get learning insights and current weights
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "insights";

        if (action === "weights") {
            // Get current learned weights
            const weights = await getLearnedWeights();
            return NextResponse.json({
                ok: true,
                weights,
            });
        }

        // Get insights by default
        const insights = await getFeedbackInsights();
        return NextResponse.json({
            ok: true,
            insights,
        });
    } catch (err: any) {
        console.error("Error getting insights:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
