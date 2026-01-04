import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

/**
 * Check if documents have embeddings
 * Access at: http://localhost:3000/api/qa/check-embeddings
 */
export async function GET(req: NextRequest) {
    try {
        const db = await getDb();
        const collection = db.collection("qa_entries");

        // Count total documents
        const totalCount = await collection.countDocuments();

        // Count documents WITH embeddings
        const withEmbeddings = await collection.countDocuments({
            embedding: { $exists: true, $ne: null }
        });

        // Count documents WITHOUT embeddings
        const withoutEmbeddings = totalCount - withEmbeddings;

        // Get sample documents with embeddings
        const samplesWithEmbeddings = await collection.find({
            embedding: { $exists: true, $ne: null }
        }).limit(3).toArray();

        // Get sample documents without embeddings
        const samplesWithoutEmbeddings = await collection.find({
            embedding: { $exists: false }
        }).limit(3).toArray();

        // Check embedding array lengths
        const embeddingLengths = samplesWithEmbeddings.map(doc => ({
            _id: doc._id,
            question_text: doc.question_text?.substring(0, 50),
            embeddingLength: Array.isArray(doc.embedding) ? doc.embedding.length : 0,
            embeddingType: typeof doc.embedding
        }));

        return NextResponse.json({
            summary: {
                totalDocuments: totalCount,
                withEmbeddings,
                withoutEmbeddings,
                percentageWithEmbeddings: ((withEmbeddings / totalCount) * 100).toFixed(2) + "%"
            },
            embeddingLengths,
            samplesWithEmbeddings: samplesWithEmbeddings.map(doc => ({
                _id: doc._id,
                question_text: doc.question_text?.substring(0, 50),
                hasEmbedding: !!doc.embedding,
                embeddingLength: Array.isArray(doc.embedding) ? doc.embedding.length : 0
            })),
            samplesWithoutEmbeddings: samplesWithoutEmbeddings.map(doc => ({
                _id: doc._id,
                question_text: doc.question_text?.substring(0, 50),
                hasEmbedding: !!doc.embedding
            }))
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
