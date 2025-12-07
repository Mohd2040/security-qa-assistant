import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

interface TranslateBody {
    text: string;
    targetLang: "ar" | "en";
    qaId?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { text, targetLang, qaId } = (await req.json()) as TranslateBody;

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        // Check for Ollama config
        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL;
        const ollamaModel = process.env.OLLAMA_MODEL_TEXT || "llama3.1";

        let translatedText = "";

        const systemPrompt = `You are a specialized Cybersecurity Consultant and Translator. 
    Your task is to translate the following compliance control or security question to ${targetLang === "ar" ? "Arabic" : "English"}.
    
    Guidelines:
    1. Use professional, industry-standard cybersecurity terminology (e.g., terms from NIST, ISO 27001, SAMA).
    2. Avoid literal word-for-word translation. Focus on the technical meaning and intent of the control.
    3. For "roadmap", use "خطة عمل" or "خارطة طريق" depending on context, but ensure the sentence flows naturally.
    4. For "executed", use "تطبيق" or "تنفيذ" in a way that implies active enforcement.
    5. Output ONLY the translated text, without any introductory or concluding remarks.`;

        if (ollamaBaseUrl) {
            const client = new OpenAI({
                baseURL: `${ollamaBaseUrl}/v1`,
                apiKey: "ollama",
            });

            const completion = await client.chat.completions.create({
                model: ollamaModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text },
                ],
                temperature: 0.3,
            });

            translatedText = completion.choices[0]?.message?.content?.trim() || "";

        } else if (process.env.OPENAI_API_KEY) {
            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text },
                ],
            });

            translatedText = completion.choices[0]?.message?.content?.trim() || "";
        } else {
            return NextResponse.json(
                { error: "No AI provider configured (Ollama or OpenAI)" },
                { status: 500 }
            );
        }

        if (!translatedText) {
            throw new Error("Failed to generate translation");
        }

        // Clean up
        translatedText = translatedText.replace(/^Here is the translation:[\s\n]*/i, "").replace(/^Translation:[\s\n]*/i, "").replace(/^"|"$/g, "");

        // If qaId is provided, update the database
        if (qaId) {
            const db = await getDb();
            const collection = db.collection("qa_entries");

            const updateField = targetLang === "en" ? "question_text_en" : "question_text_ar";
            // Note: If translating TO Arabic, we assume we are updating the primary question_text 
            // OR we could update a new field if we wanted to preserve the original. 
            // But based on user request "Question (Arabic)" field, updating question_text seems correct for the Arabic version.

            await collection.updateOne(
                { _id: new ObjectId(qaId) },
                {
                    $set: {
                        [updateField]: translatedText,
                        updated_at: new Date().toISOString()
                    }
                }
            );
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
