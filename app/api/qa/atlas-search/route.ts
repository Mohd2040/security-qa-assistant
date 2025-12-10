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
            mode = "hybrid" // 'hybrid' | 'text' | 'vector'
        } = body;

        if (!query.trim()) {
            return NextResponse.json({ matches: [], total: 0 });
        }

        const filters = { status, domain, owner_group };
        let results: any[] = [];

        // 1. Generate Embedding if needed
        let embedding: number[] | undefined;
        if (mode !== 'text' && isOpenAIEnabled()) {
            try {
                const result = await getEmbedding(query);
                embedding = result || undefined;
            } catch (e) {
                console.warn("Failed to generate embedding, falling back to text search", e);
            }
        }

        // 2. Execute Search
        if (embedding && mode !== 'text') {
            // Vector / Hybrid Search
            console.log(`[Atlas] Vector Search: ${query.length > 50 ? query.substring(0, 50) + '...' : query}`);
            results = await searchAtlasHybrid({
                query,
                embedding,
                filters,
                limit: 50
            });
        } else {
            // Text Search (Fallback or explicit mode)
            console.log(`[Atlas] Text Search: ${query.length > 50 ? query.substring(0, 50) + '...' : query}`);
            results = await searchAtlasText({
                query,
                filters,
                limit: 50
            });
        }

        // 3. Format Response & Normalize Scores
        const matches = results.map(doc => {
            let finalScore = 0;

            if (doc.score) {
                // إذا كان Score > 1 (Lucene/Text Search)
                if (doc.score > 1) {
                    // محاولة تطبيع بسيطة: نفترض أن 10 هو تطابق ممتاز
                    // يمكننا استخدام دالة لوغاريتمية أو حد أقصى
                    finalScore = Math.min(100, Math.round(doc.score * 10));

                    // تحسين: إذا كان هناك تطابق تام في النص، نرفع النسبة
                    const q = query.toLowerCase().trim();
                    const textEn = doc.question_text_en?.toLowerCase() || "";
                    const textAr = doc.question_text?.toLowerCase() || "";

                    if (textEn.includes(q) || textAr.includes(q)) {
                        finalScore = Math.max(finalScore, 95); // تطابق تام تقريباً
                    }
                } else {
                    // إذا كان Score <= 1 (Vector/Cosine)
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
            pageSize: 50,
            totalPages: 1
        });

    } catch (err: any) {
        console.error("Error in Atlas Search API:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
