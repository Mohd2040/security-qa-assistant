// app/api/qa/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // بحث بسيط باستخدام regex في السؤال والإجابة (عربي/إنجليزي)
    const cursor = db
      .collection("qa_entries")
      .find({
        $or: [
          { question_text: { $regex: query, $options: "i" } },
          { question_text_en: { $regex: query, $options: "i" } },
          { answer_text: { $regex: query, $options: "i" } },
        ],
      })
      .sort({ updated_at: -1 })
      .limit(10);

    const resultsRaw = await cursor.toArray();

    const results: QaEntry[] = resultsRaw.map((doc: any) => ({
      _id: doc._id.toString(),
      question_text: doc.question_text,
      question_text_en: doc.question_text_en || undefined,
      question_language: doc.question_language || "ar",
      answer_text: doc.answer_text,
      answer_language: doc.answer_language || "en",
      status: doc.status || "unknown",
      domain: doc.domain || "application",
      category: doc.category || undefined,
      is_from_file: doc.is_from_file ?? undefined,
      source_file: doc.source_file || undefined,
      source_ref: doc.source_ref || undefined,
      needs_dev_input: doc.needs_dev_input ?? undefined,
      needs_infra_input: doc.needs_infra_input ?? undefined,
      explanation_ar: doc.explanation_ar || "",
      dev_questions: doc.dev_questions || [],
      infra_questions: doc.infra_questions || [],
      created_at: doc.created_at || undefined,
      updated_at: doc.updated_at || undefined,
    }));

    return NextResponse.json({ results }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /api/qa/search:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
