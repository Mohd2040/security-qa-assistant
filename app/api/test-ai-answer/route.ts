import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const testQuestion = "What is a strong password policy?";

    console.log(`[Test] Generating AI answer for: "${testQuestion}"`);

    try {
        const answer = await generateAnswer(testQuestion);

        if (answer && answer.length > 0) {
            return NextResponse.json({
                success: true,
                message: "✅ AI answer generated successfully!",
                question: testQuestion,
                answer: answer,
                answerLength: answer.length,
                provider: process.env.AI_PROVIDER || "openai (default)"
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "⚠️ No answer returned. Check OpenAI API configuration.",
                hint: "Make sure OPENAI_API_KEY is set in .env.local"
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: "❌ Error generating answer",
            error: error.message
        }, { status: 500 });
    }
}
