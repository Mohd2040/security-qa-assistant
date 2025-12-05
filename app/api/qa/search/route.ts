// app/api/qa/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry, QaDomain, OwnerGroup, QaStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      query?: string;
      status?: QaStatus | "all";
      domain?: QaDomain | "all";
      owner_group?: OwnerGroup | "all";
      limit?: number;
    };

    const { query = "", status = "all", domain = "all", owner_group = "all" } =
      body;

    const limit = Math.min(Math.max(body.limit ?? 100, 1), 500);

    const filter: any = {};

    if (query.trim()) {
      const regex = new RegExp(query.trim(), "i");
      filter.$or = [
        { question_text: regex },
        { question_text_en: regex },
        { answer_text: regex },
      ];
    }

    if (status !== "all") {
      filter.status = status;
    }

    if (domain !== "all") {
      filter.domain = domain;
    }

    if (owner_group !== "all") {
      filter.owner_group = owner_group;
    }

    const db = await getDb();
    const docs = await db
      .collection("qa_entries")
      .find(filter)
      .sort({ updated_at: -1 })
      .limit(limit)
      .toArray();

    const matches: QaEntry[] = docs.map((doc: any) => ({
      _id: doc._id.toString(),
      question_text: doc.question_text,
      question_text_en: doc.question_text_en || undefined,
      question_language: doc.question_language || "en",
      answer_text: doc.answer_text,
      answer_language: doc.answer_language || "en",
      status: doc.status || "unknown",
      domain: doc.domain || "application",
      category: doc.category || undefined,
      owner_group: doc.owner_group || undefined,
      security_area: doc.security_area || undefined,
      client_category: doc.client_category || undefined,
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

    return NextResponse.json(
      {
        matches,
        total: matches.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/qa/search:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
