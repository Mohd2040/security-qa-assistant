import { NextRequest, NextResponse } from "next/server";
import { getEmbedding } from "@/lib/embeddings";
import { searchAtlasHybrid, searchAtlasText } from "@/lib/atlas-search";
import { isOpenAIEnabled } from "@/lib/ai";
import { getDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || "Anonymous";
        const ip = getClientIp(req);

        // ✅ SECURITY: Rate Limiting (50 requests per 10 minutes per IP/User)
        const limitResult = rateLimit(`${ip}-${userEmail}`, {
            limit: 50,
            windowMs: 10 * 60 * 1000
        });

        if (!limitResult.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((limitResult.reset - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        const body = await req.json();
        const {
            query: rawQuery = "",
            status: rawStatus = "all",
            domain: rawDomain = "all",
            owner_group: rawOwnerGroup = "all",
            mode = "hybrid",
            pageSize = 50
        } = body;

        // ✅ SECURITY: Sanitize inputs to prevent NoSQL injection
        const { sanitizeMongoInput } = await import("@/lib/input-validator");
        const query = sanitizeMongoInput(rawQuery) || "";
        const status = sanitizeMongoInput(rawStatus) || "all";
        const domain = sanitizeMongoInput(rawDomain) || "all";
        const owner_group = sanitizeMongoInput(rawOwnerGroup) || "all";

        if (!query.trim() && status === "all" && domain === "all") {
            return NextResponse.json({ matches: [], total: 0 });
        }

        const filters = { status, domain, owner_group };
        let results: any[] = [];

        if (mode === "hybrid" && isOpenAIEnabled()) {
            // Generate embedding with user tracking
            const embedding = await getEmbedding(query, userEmail);

            if (embedding) {
                console.log(`[Atlas] "${query}" → Vector generated`);
                results = await searchAtlasHybrid({
                    query,
                    embedding,
                    filters,
                    limit: pageSize
                });
            } else {
                console.log(`[Atlas] "${query}" → Vector failed, fallback to text`);
                results = await searchAtlasText({
                    query,
                    filters,
                    limit: pageSize
                });
            }
        } else {
            console.log(`[Atlas] "${query}" → Text Search (Mode: ${mode})`);
            results = await searchAtlasText({
                query,
                filters,
                limit: pageSize
            });
        }

        // Format Response & Normalize Scores
        const matches = results.map(doc => {
            let finalScore = 0;

            if (doc.score) {
                if (doc.score > 1) {
                    // Lucene/Text Search score
                    finalScore = Math.min(100, Math.round(doc.score * 10));

                    const q = query.toLowerCase().trim();
                    const textEn = doc.question_text_en?.toLowerCase() || "";
                    const textAr = doc.question_text?.toLowerCase() || "";

                    if (textEn.includes(q) || textAr.includes(q)) {
                        finalScore = Math.max(finalScore, 95);
                    }
                } else {
                    // Vector/Cosine score
                    finalScore = Math.round(doc.score * 100);
                }
            }

            return {
                _id: doc._id,
                question_text: doc.question_text,
                question_text_en: doc.question_text_en,
                answer_text: doc.answer_text,
                status: doc.status,
                domain: doc.domain,
                owner_group: doc.owner_group,
                client_name: doc.client_name,
                category: doc.category,
                security_area: doc.security_area,
                explanation_ar: doc.explanation_ar,
                question_text_ar: doc.question_text_ar,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
                score: finalScore,
                source: "atlas"
            };
        });

        // Log Search Event
        try {
            const { logEvent } = await import("@/lib/logger");
            await logEvent({
                user: userEmail,
                action: "SEARCH",
                details: {
                    query,
                    results_count: matches.length,
                    filters,
                    mode
                }
            });
        } catch (logError) {
            console.error("Failed to log search event:", logError);
        }

        return NextResponse.json({
            matches,
            total: matches.length,
            page: 1,
            pageSize: pageSize,
            totalPages: Math.ceil(matches.length / pageSize)
        });

    } catch (err: any) {
        console.error("[Atlas Search] Error:", err.message);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
