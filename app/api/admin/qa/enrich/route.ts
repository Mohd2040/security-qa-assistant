// app/api/admin/qa/enrich/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  isAiEnabled,
  generateArabicExplanation,
  getEmbeddingVector,
} from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isAiEnabled()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "OpenAI is not enabled. Set OPENAI_API_KEY in .env.local",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const type = (body.type as "explanation" | "embedding" | "both") || "both";
    const limit = Number(body.limit) || 20;

    const db = await getDb();
    const collection = db.collection("qa_entries");

    const filter: any = {};

    if (type === "explanation") {
      filter.$or = [{ explanation_ar: { $exists: false } }, { explanation_ar: "" }];
    } else if (type === "embedding") {
      filter.$or = [{ embedding: { $exists: false } }];
    } else {
      filter.$or = [
        { explanation_ar: { $exists: false } },
        { explanation_ar: "" },
        { embedding: { $exists: false } },
      ];
    }

    const docs = await collection
      .find(filter)
      .sort({ updated_at: 1 })
      .limit(limit)
      .toArray();

    if (!docs.length) {
      return NextResponse.json(
        {
          ok: true,
          message: "No documents need enrichment.",
          processed: 0,
        },
        { status: 200 }
      );
    }

    let processed = 0;
    const updatedIds: string[] = [];

    for (const doc of docs) {
      const question = (doc.question_text || "").toString();
      const answer = (doc.answer_text || "").toString();

      let explanation_ar = doc.explanation_ar as string | undefined;
      let embedding = doc.embedding as number[] | undefined;

      if (
        (type === "explanation" || type === "both") &&
        (!explanation_ar || !explanation_ar.trim())
      ) {
        try {
          const expl = await generateArabicExplanation({ question, answer });
          if (expl) {
            explanation_ar = expl;
          }
        } catch (e) {
          console.error("AI explanation error:", e);
        }
      }

      if ((type === "embedding" || type === "both") && !embedding) {
        try {
          const emb = await getEmbeddingVector(question);
          if (emb) {
            embedding = emb;
          }
        } catch (e) {
          console.error("AI embedding error:", e);
        }
      }

      const $set: any = { updated_at: new Date().toISOString() };
      if (explanation_ar) $set.explanation_ar = explanation_ar;
      if (embedding) $set.embedding = embedding;

      if (Object.keys($set).length > 1) {
        await collection.updateOne({ _id: doc._id }, { $set });
        processed++;
        updatedIds.push(doc._id.toString());
      }
    }

    return NextResponse.json(
      {
        ok: true,
        type,
        requestedLimit: limit,
        processed,
        updatedIds,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/admin/qa/enrich:", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
