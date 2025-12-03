// app/api/qa/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { query?: string };
    const query = body.query?.trim() || "";

    if (!query) {
      return NextResponse.json(
        { error: "Field 'query' is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

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
      .limit(5);

    const resultsRaw = await cursor.toArray();

    if (resultsRaw.length === 0) {
      return NextResponse.json(
        {
          found: false,
          message:
            "لا يوجد سؤال مشابه في قاعدة البيانات. تحتاج تسأل الديفلوبرز أو فريق الإنفرا وتضيف الإجابة الجديدة.",
        },
        { status: 200 }
      );
    }

    const best = resultsRaw[0];
    const qa: QaEntry = {
      _id: best._id.toString(),
      question_text: best.question_text,
      question_text_en: best.question_text_en || undefined,
      question_language: best.question_language || "ar",
      answer_text: best.answer_text,
      answer_language: best.answer_language || "en",
      status: best.status || "unknown",
      domain: best.domain || "application",
      category: best.category || undefined,
      is_from_file: best.is_from_file ?? undefined,
      source_file: best.source_file || undefined,
      source_ref: best.source_ref || undefined,
      needs_dev_input: best.needs_dev_input ?? undefined,
      needs_infra_input: best.needs_infra_input ?? undefined,
      explanation_ar: best.explanation_ar || "",
      dev_questions: best.dev_questions || [],
      infra_questions: best.infra_questions || [],
      created_at: best.created_at || undefined,
      updated_at: best.updated_at || undefined,
    };

    return NextResponse.json(
      {
        found: true,
        best_match: qa,
        matches_count: resultsRaw.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/qa/ask:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
