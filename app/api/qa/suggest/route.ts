// app/api/qa/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import Fuse from "fuse.js";
import { normalizeArabic, looksArabic } from "@/lib/arabic";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }

    const db = await getDb();
    const collection = db.collection("qa_entries");

    const isArabic = looksArabic(q);
    const normQ = isArabic ? normalizeArabic(q) : q;

    // نجيب عدد محدود من الأسئلة (عشان الأداء)
    const docs = await collection
      .find({}, { projection: { question_text: 1, question_text_en: 1 } })
      .limit(200)
      .toArray();

    const fuse = new Fuse(docs, {
      includeScore: true,
      threshold: 0.45,
      keys: [
        {
          name: "question_text",
          getFn: (doc: any) =>
            isArabic
              ? normalizeArabic(doc.question_text || "")
              : doc.question_text || "",
        },
        {
          name: "question_text_en",
          getFn: (doc: any) =>
            isArabic
              ? normalizeArabic(doc.question_text_en || "")
              : doc.question_text_en || "",
        },
      ],
    });

    const results = fuse.search(normQ).slice(0, 5);

    const suggestions = results.map((r) => ({
      id: r.item._id.toString(),
      question_text: r.item.question_text,
      question_text_en: r.item.question_text_en || "",
    }));

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /api/qa/suggest:", err);
    return NextResponse.json(
      { error: "Internal Server Error", suggestions: [] },
      { status: 500 }
    );
  }
}
