import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const config = {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✓ Set" : "✗ Not Set",
        OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini (default)",
        OPENAI_MODEL_EMBED: process.env.OPENAI_MODEL_EMBED || "text-embedding-3-small (default)",
    };

    return NextResponse.json({
        message: "OpenAI Configuration Check",
        config,
        status: config.OPENAI_API_KEY === "✓ Set"
            ? "✅ OpenAI configured correctly"
            : "⚠️ OpenAI API key not set. Add OPENAI_API_KEY to .env.local"
    });
}
