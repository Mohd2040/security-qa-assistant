import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const runtime = "nodejs";

interface TranslateBody {
    text: string;
    targetLang: "ar" | "en";
    qaId?: string;
}

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || "Anonymous";

        // ✅ SECURITY: Rate Limiting (20 translations per 10 minutes)
        const limitResult = rateLimit(`translate-${ip}-${userEmail}`, {
            limit: 20,
            windowMs: 10 * 60 * 1000
        });

        if (!limitResult.success) {
            return NextResponse.json(
                { error: "Translation limit reached. Please try again in a few minutes." },
                { status: 429 }
            );
        }

        const { text, targetLang, qaId } = (await req.json()) as TranslateBody;

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        const systemPrompt = `You are a specialized Cybersecurity Consultant and Translator. 
    Your task is to translate the following compliance control or security question to ${targetLang === "ar" ? "Arabic" : "English"}.
    
    Guidelines:
    1. Use professional, industry-standard cybersecurity terminology (e.g., terms from NIST, ISO 27001, SAMA).
    2. Avoid literal word-for-word translation. Focus on the technical meaning and intent of the control.
    3. For "roadmap", use "خطة عمل" or "خارطة طريق" depending on context, but ensure the sentence flows naturally.
    4. For "executed", use "تطبيق" or "تنفيذ" in a way that implies active enforcement.
    5. Output ONLY the translated text, without any introductory or concluding remarks.`;

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await client.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text },
            ],
            temperature: 0.3,
        });

        // ✅ TRACK USAGE
        if (completion.usage) {
            const { trackUsage } = await import("@/lib/usage-tracker");
            await trackUsage(
                OPENAI_MODEL,
                {
                    prompt_tokens: completion.usage.prompt_tokens,
                    completion_tokens: completion.usage.completion_tokens,
                    total_tokens: completion.usage.total_tokens
                },
                userEmail,
                "Translate"
            );
        }

        let translatedText = completion.choices[0]?.message?.content?.trim() || "";

        if (!translatedText) {
            throw new Error("Failed to generate translation");
        }

        // Clean up
        translatedText = translatedText
            .replace(/^Here is the translation:[\s\n]*/i, "")
            .replace(/^Translation:[\s\n]*/i, "")
            .replace(/^"|"$/g, "");

        // If qaId is provided, update the database
        if (qaId) {
            const db = await getDb();
            const collection = db.collection("qa_entries");

            const updateField = targetLang === "en" ? "question_text_en" : "question_text_ar";

            await collection.updateOne(
                { _id: new ObjectId(qaId) },
                {
                    $set: {
                        [updateField]: translatedText,
                        updated_at: new Date().toISOString()
                    }
                }
            );

            // ✅ LOGGING: Log translation event
            if (userEmail !== "Anonymous") {
                const { logEvent } = await import("@/lib/logger");
                await logEvent({
                    user: userEmail,
                    action: "TRANSLATE",
                    details: {
                        target_lang: targetLang,
                        text_length: text.length,
                        qa_id: qaId
                    }
                });
            }
        }

        return NextResponse.json({ translatedText }, { status: 200 });

    } catch (error: any) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
