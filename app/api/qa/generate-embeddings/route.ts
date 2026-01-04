import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getEmbedding } from "@/lib/embeddings";
import { isOpenAIEnabled } from "@/lib/ai";

export const runtime = "nodejs";

/**
 * Generate embeddings for all documents in the database
 * POST /api/qa/generate-embeddings
 * 
 * Body (optional):
 * {
 *   "batchSize": 10,           // Process in chunks (for logging)
 *   "skipExisting": true,      // Skip documents that already have embeddings
 *   "limit": 0                 // Limit number of documents (0 = no limit)
 * }
 */
export async function POST(req: NextRequest) {
    try {
        // Check if OpenAI is enabled
        if (!isOpenAIEnabled()) {
            return NextResponse.json(
                { error: "OpenAI is not enabled. Please set OPENAI_API_KEY in .env.local" },
                { status: 400 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const { batchSize = 10, skipExisting = true, limit = 0 } = body;

        const db = await getDb();
        const collection = db.collection("qa_entries");

        // Find documents without embeddings (or all if skipExisting is false)
        const filter = skipExisting ? { embedding: { $exists: false } } : {};

        let query = collection.find(filter);
        if (limit > 0) {
            query = query.limit(limit);
        }

        const docsToProcess = await query.toArray();

        if (docsToProcess.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No documents to process (all documents already have embeddings)",
                stats: {
                    total: 0,
                    processed: 0,
                    updated: 0,
                    failed: 0,
                    skipped: 0
                }
            });
        }

        const stats = {
            total: docsToProcess.length,
            processed: 0,
            updated: 0,
            failed: 0,
            skipped: 0
        };

        console.log(`[Generate Embeddings] Starting process for ${stats.total} documents...`);

        for (let i = 0; i < docsToProcess.length; i++) {
            const doc = docsToProcess[i];

            try {
                // Use question_text_en if available, fallback to question_text
                const textToEmbed = doc.question_text_en || doc.question_text;

                if (!textToEmbed || textToEmbed.trim().length < 3) {
                    console.warn(`[Generate Embeddings] Skipping document ${doc._id} - no valid text`);
                    stats.skipped++;
                    stats.processed++;
                    continue;
                }

                const embedding = await getEmbedding(textToEmbed, "System (Batch)");

                if (embedding && Array.isArray(embedding) && embedding.length > 0) {
                    await collection.updateOne(
                        { _id: doc._id },
                        {
                            $set: {
                                embedding,
                                updated_at: new Date().toISOString()
                            }
                        }
                    );
                    stats.updated++;
                } else {
                    console.error(`[Generate Embeddings] No embedding returned for document ${doc._id}`);
                    stats.failed++;
                }

                stats.processed++;

                // Log progress every batchSize documents
                if (stats.processed % batchSize === 0 || stats.processed === stats.total) {
                    console.log(
                        `[Generate Embeddings] Progress: ${stats.processed}/${stats.total} ` +
                        `(${stats.updated} updated, ${stats.failed} failed, ${stats.skipped} skipped)`
                    );
                }

            } catch (error: any) {
                console.error(`[Generate Embeddings] Failed for document ${doc._id}:`, error.message);
                stats.failed++;
                stats.processed++;
            }
        }

        console.log(`[Generate Embeddings] Completed! Stats:`, stats);

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${stats.updated} embeddings out of ${stats.total} documents`,
            stats
        });

    } catch (error: any) {
        console.error("[Generate Embeddings] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * Get current embedding generation status
 * GET /api/qa/generate-embeddings
 */
export async function GET(req: NextRequest) {
    try {
        const db = await getDb();
        const collection = db.collection("qa_entries");

        const totalDocs = await collection.countDocuments();
        const withEmbeddings = await collection.countDocuments({
            embedding: { $exists: true, $ne: null }
        });
        const withoutEmbeddings = totalDocs - withEmbeddings;

        return NextResponse.json({
            openAIEnabled: isOpenAIEnabled(),
            totalDocuments: totalDocs,
            withEmbeddings,
            withoutEmbeddings,
            percentageComplete: totalDocs > 0 ? ((withEmbeddings / totalDocs) * 100).toFixed(2) + "%" : "0%"
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
