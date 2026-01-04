import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        // Ensure page is at least 1
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const db = await getDb();
        const collection = db.collection("qa_entries");

        const skip = (page - 1) * limit;

        let query: any = {};
        if (search) {
            query = {
                $or: [
                    { question_text: { $regex: search, $options: "i" } },
                    { question_text_en: { $regex: search, $options: "i" } },
                    { answer_text: { $regex: search, $options: "i" } }
                ]
            };
        }

        const total = await collection.countDocuments(query);
        console.log(`[List API] Query: ${JSON.stringify(query)}`);
        console.log(`[List API] Total documents found: ${total}`);

        const questions = await collection
            .find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            ok: true,
            data: questions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("Error listing questions:", error);
        return NextResponse.json(
            { ok: false, error: "Failed to fetch questions" },
            { status: 500 }
        );
    }
}
