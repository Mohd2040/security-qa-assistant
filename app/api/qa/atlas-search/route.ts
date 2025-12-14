import { NextRequest, NextResponse } from "next/server";
import { getEmbedding } from "@/lib/embeddings";
import { searchAtlasHybrid, searchAtlasText } from "@/lib/atlas-search";
import { isOpenAIEnabled } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            query = "",
            status = "all",
            domain = "all",
            owner_group = "all",
            mode = "hybrid",
            pageSize = 50
        } = body;

        if (!query.trim()) {
            return NextResponse.json({ matches: [], total: 0 });
        }

        const filters = { status, domain, owner_group };
        let results: any[] = [];

        //  Generate Embedding if needed
        let embedding: number[] | undefined;
        const openAIEnabled = isOpenAIEnabled();

        if (mode !== 'text' && openAIEnabled) {
            try {
                const result = await getEmbedding(query);
                embedding = result || undefined;
            } catch (e) {
                console.warn(`[Atlas] Embedding failed for "${query}"`);
            }
        }

        // Execute Search
        if (embedding && mode !== 'text') {
            results = await searchAtlasHybrid({
                query,
                embedding,
                filters,
                limit: pageSize
            });

            // Fallback to text search if vector returns nothing
            if (results.length === 0) {
                console.log(`[Atlas] "${query}" → Vector: 0, using Text fallback`);
                results = await searchAtlasText({
                    query,
                    filters,
                    limit: pageSize
                });
            } else {
                console.log(`[Atlas] "${query}" → Vector: ${results.length} results`);
            }
        } else {
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
                created_at: doc.created_at,
                updated_at: doc.updated_at,
                score: finalScore,
                source: "atlas"
            };
        });

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
