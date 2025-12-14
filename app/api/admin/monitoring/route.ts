import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();

        // Get real monitoring statistics
        const [
            totalQAEntries,
            totalSearches,
            totalUsers,
            recentActivity,
            qaWithEmbeddings
        ] = await Promise.all([
            db.collection("qa_entries").countDocuments(),
            db.collection("search_analytics").countDocuments(),
            db.collection("users").countDocuments(),
            db.collection("search_analytics").find({}).sort({ timestamp: -1 }).limit(10).toArray(),
            db.collection("qa_entries").countDocuments({ embedding: { $exists: true, $ne: null } })
        ]);

        // Calculate real costs based on actual usage
        // GPT-4o-mini pricing: $0.150 / 1M input tokens, $0.600 / 1M output tokens
        // Average search: ~500 input tokens, ~200 output tokens
        const avgInputTokensPerSearch = 500;
        const avgOutputTokensPerSearch = 200;
        const inputCostPer1M = 0.15;
        const outputCostPer1M = 0.60;

        const totalInputTokens = totalSearches * avgInputTokensPerSearch;
        const totalOutputTokens = totalSearches * avgOutputTokensPerSearch;

        const inputCost = (totalInputTokens / 1000000) * inputCostPer1M;
        const outputCost = (totalOutputTokens / 1000000) * outputCostPer1M;
        const estimatedAPICost = (inputCost + outputCost).toFixed(2);

        // text-embedding-3-small pricing: $0.020 / 1M tokens
        // Average embedding: ~100 tokens per QA entry
        const avgTokensPerEmbedding = 100;
        const embeddingCostPer1M = 0.02;
        const totalEmbeddingTokens = qaWithEmbeddings * avgTokensPerEmbedding;
        const estimatedEmbeddingCost = ((totalEmbeddingTokens / 1000000) * embeddingCostPer1M).toFixed(2);

        const totalCost = (parseFloat(estimatedAPICost) + parseFloat(estimatedEmbeddingCost)).toFixed(2);

        return NextResponse.json({
            qaEntries: totalQAEntries,
            totalSearches,
            totalUsers,
            apiCost: `$${estimatedAPICost}`,
            embeddingCost: `$${estimatedEmbeddingCost}`,
            totalCost: `$${totalCost}`,
            // Additional stats for transparency
            stats: {
                qaWithEmbeddings,
                estimatedInputTokens: totalInputTokens,
                estimatedOutputTokens: totalOutputTokens,
                estimatedEmbeddingTokens: totalEmbeddingTokens
            },
            recentActivity: recentActivity.map(a => ({
                query: a.query,
                timestamp: a.timestamp,
                resultsCount: a.results_count || 0
            }))
        });
    } catch (error) {
        console.error("[Monitoring Stats Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
