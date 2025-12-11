import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const config = {
        AI_PROVIDER: process.env.AI_PROVIDER || "none",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✓ Set" : "✗ Not Set",
        OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "Not Set",
        OLLAMA_MODEL_TEXT: process.env.OLLAMA_MODEL_TEXT || "Not Set",
        OLLAMA_MODEL_EMBED: process.env.OLLAMA_MODEL_EMBED || "Not Set",
    };

    return NextResponse.json({
        message: "Environment Variables Check",
        config,
        recommendation: config.AI_PROVIDER === "ollama"
            ? "✅ Ollama configured correctly"
            : config.OPENAI_API_KEY === "✓ Set"
                ? "✅ OpenAI configured"
                : "⚠️ No AI provider configured. Add AI_PROVIDER=ollama to .env.local"
    });
}
