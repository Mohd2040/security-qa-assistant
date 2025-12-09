// app/api/qa/semantic-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry } from "@/lib/types";
import { cosineSimilarity, getEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      query: string;
      limit?: number;
    };

    const query = (body.query || "").trim();
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(body.limit ?? 10, 1), 50);

    const embedding = await getEmbedding(query);
    if (!embedding) {
      return NextResponse.json(
        {
          error:
            "Semantic search is not enabled (no OPENAI_API_KEY or embedding failed).",
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("qa_entries");

    // نجيب فقط الأسئلة اللي عندها embedding مسبقاً
    const docs = await collection
      .find({ embedding: { $exists: true } })
      .project({ embedding: 1, question_text: 1, question_text_en: 1, answer_text: 1, status: 1, domain: 1, owner_group: 1, explanation_ar: 1, source_file: 1, source_ref: 1 })
      .toArray();

    type Scored = {
      doc: any;
      score: number;
    };

    const scored: Scored[] = [];

    for (const doc of docs) {
      const emb = doc.embedding as number[] | undefined;
      if (!Array.isArray(emb)) continue;
      const score = cosineSimilarity(embedding, emb);
      scored.push({ doc, score });
    }

    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, limit).map(({ doc, score }) => {
      const entry: QaEntry = {
        _id: doc._id.toString(),
        question_text: doc.question_text,
        question_text_en: doc.question_text_en || undefined,
        question_language: "en",
        answer_text: doc.answer_text || "",
        answer_language: "en",
        status: doc.status || "unknown",
        domain: doc.domain || "application",
        owner_group: doc.owner_group || undefined,
        explanation_ar: doc.explanation_ar || "",
        source_file: doc.source_file || undefined,
        source_ref: doc.source_ref || undefined,
      };
      return { entry, score };
    });

    return NextResponse.json(
      {
        matches: top,
        total: top.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/qa/semantic-search:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
