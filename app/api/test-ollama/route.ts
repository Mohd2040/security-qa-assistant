import { NextRequest, NextResponse } from "next/server";
import { getEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const testText = "password security test";

    console.log(`[Test] Attempting to generate embedding for: "${testText}"`);

    try {
        const embedding = await getEmbedding(testText);

        if (embedding) {
            return NextResponse.json({
                success: true,
                message: "✅ Embedding generated successfully!",
                embeddingLength: embedding.length,
                embeddingPreview: embedding.slice(0, 5),
                provider: process.env.AI_PROVIDER || "openai (default)"
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "⚠️ No embedding returned. Check if Ollama is running.",
                hint: "Run: ollama serve"
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: "❌ Error generating embedding",
            error: error.message,
            hint: "Make sure Ollama is running: ollama serve"
        }, { status: 500 });
    }
}
