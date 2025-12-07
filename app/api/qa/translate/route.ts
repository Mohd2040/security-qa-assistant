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

        if (ollamaBaseUrl) {
            // Use Ollama via OpenAI SDK (Ollama provides OpenAI-compatible endpoint at /v1)
            // or we can use direct fetch if the SDK gives trouble. 
            // Let's try the SDK with the compatible endpoint first.

            const client = new OpenAI({
                baseURL: `${ollamaBaseUrl}/v1`,
                apiKey: "ollama", // required but unused
            });

            const completion = await client.chat.completions.create({
                model: ollamaModel,
                messages: [
                    {
                        role: "system",
                        content: `You are a professional translator for a Cyber Security system. Translate the following text to ${targetLang === "ar" ? "Arabic" : "English"
                            }. Keep technical terms accurate. Return ONLY the translated text, no explanations.`,
                    },
                    { role: "user", content: text },
                ],
                temperature: 0.3,
            });

            translatedText = completion.choices[0]?.message?.content?.trim() || "";

        } else if (process.env.OPENAI_API_KEY) {
            // Fallback to OpenAI if Ollama not set but OpenAI key is
            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a professional translator for a Cyber Security system. Translate the following text to ${targetLang === "ar" ? "Arabic" : "English"
                            }. Keep technical terms accurate. Return ONLY the translated text.`,
                    },
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

        // Clean up any potential "Here is the translation:" prefixes that local models sometimes add
        translatedText = translatedText.replace(/^Here is the translation:[\s\n]*/i, "").replace(/^Translation:[\s\n]*/i, "").replace(/^"|"$/g, "");

        // If qaId is provided, update the database
        if (qaId) {
            const db = await getDb();
            const collection = db.collection("qa_entries");

            const updateField = targetLang === "en" ? "question_text_en" : "question_text";

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
