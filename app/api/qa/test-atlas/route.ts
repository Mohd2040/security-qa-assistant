import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { searchAtlasText, searchAtlasHybrid } from "@/lib/atlas-search";
import { getEmbedding } from "@/lib/embeddings";
import { isOpenAIEnabled } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint to test Atlas Search functionality
 * Access at: http://localhost:3000/api/qa/test-atlas?query=password
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "password";

    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        query,
        openAIEnabled: isOpenAIEnabled(),
        tests: {}
    };

    try {
        // Test 1: Direct MongoDB count
        const db = await getDb();
        const collection = db.collection("qa_entries");
        const totalCount = await collection.countDocuments();
        diagnostics.totalDocuments = totalCount;

        // Test 2: Simple text search
        const simpleResults = await collection.find({
            $or: [
                { question_text: { $regex: query, $options: "i" } },
                { question_text_en: { $regex: query, $options: "i" } },
                { answer_text: { $regex: query, $options: "i" } }
            ]
        }).limit(5).toArray();

        diagnostics.tests.simpleRegexSearch = {
            count: simpleResults.length,
            samples: simpleResults.slice(0, 2).map(doc => ({
                _id: doc._id,
                question_text: doc.question_text?.substring(0, 50),
                question_text_en: doc.question_text_en?.substring(0, 50)
            }))
        };

        // Test 3: Atlas Text Search
        try {
            const atlasTextResults = await searchAtlasText({
                query,
                filters: { status: "all", domain: "all" },
                limit: 10
            });

            diagnostics.tests.atlasTextSearch = {
                count: atlasTextResults.length,
                samples: atlasTextResults.slice(0, 2).map((doc: any) => ({
                    _id: doc._id,
                    question_text: doc.question_text?.substring(0, 50),
                    score: doc.score
                }))
            };
        } catch (error: any) {
            diagnostics.tests.atlasTextSearch = {
                error: error.message,
                stack: error.stack
            };
        }

        // Test 4: Atlas Vector Search (if OpenAI enabled)
        if (isOpenAIEnabled()) {
            try {
                const embedding = await getEmbedding(query, "System (Test)");
                const atlasVectorResults = await searchAtlasHybrid({
                    query,
                    embedding: embedding || undefined,
                    filters: { status: "all", domain: "all" },
                    limit: 10
                });

                diagnostics.tests.atlasVectorSearch = {
                    embeddingLength: embedding?.length,
                    count: atlasVectorResults.length,
                    samples: atlasVectorResults.slice(0, 2).map((doc: any) => ({
                        _id: doc._id,
                        question_text: doc.question_text?.substring(0, 50),
                        score: doc.score
                    }))
                };
            } catch (error: any) {
                diagnostics.tests.atlasVectorSearch = {
                    error: error.message,
                    stack: error.stack?.substring(0, 200)
                };
            }
        } else {
            diagnostics.tests.atlasVectorSearch = {
                skipped: "OpenAI not enabled"
            };
        }

        // Test 5: Check if Atlas Search indexes exist
        try {
            const indexes = await collection.listSearchIndexes().toArray();
            diagnostics.atlasSearchIndexes = indexes.map((idx: any) => ({
                name: idx.name,
                status: idx.status,
                queryable: idx.queryable
            }));
        } catch (error: any) {
            diagnostics.atlasSearchIndexes = {
                error: error.message
            };
        }

        return NextResponse.json(diagnostics, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message,
                stack: error.stack,
                diagnostics
            },
            { status: 500 }
        );
    }
}
