// app/api/qa/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry, QaDomain, OwnerGroup, QaStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<QaEntry>;

    if (!body.question_text || !body.answer_text) {
      return NextResponse.json(
        { error: "question_text and answer_text are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const domain: QaDomain = (body.domain as QaDomain) || "application";
    const status: QaStatus = (body.status as QaStatus) || "unknown";
    const owner_group: OwnerGroup =
      (body.owner_group as OwnerGroup) || "dev";

    const qaDoc: any = {
      question_text: body.question_text,
      question_text_en: body.question_text_en || body.question_text,
      question_language: body.question_language || "en",

      answer_text: body.answer_text,
      answer_language: body.answer_language || "en",

      status,
      domain,
      category: body.category || null,
      owner_group,
      security_area: body.security_area || null,
      client_category: body.client_category || null,

      is_from_file: body.is_from_file ?? false,
      source_file: body.source_file || null,
      source_ref: body.source_ref || null,

      needs_dev_input: body.needs_dev_input ?? false,
      needs_infra_input: body.needs_infra_input ?? false,

      explanation_ar: body.explanation_ar || "",
      dev_questions: body.dev_questions || [],
      infra_questions: body.infra_questions || [],

      created_at: now,
      updated_at: now,
    };

    const db = await getDb();
    const result = await db.collection("qa_entries").insertOne(qaDoc);

    return NextResponse.json(
      {
        message: "QA entry created",
        id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in /api/qa/add:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
