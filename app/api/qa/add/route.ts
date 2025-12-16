// app/api/qa/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry, QaDomain, OwnerGroup, QaStatus } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// قيم مسموح بها للحالات والتصنيفات والـ owner
const ALLOWED_STATUS: QaStatus[] = [
  "applied",
  "not_applied",
  "not_applicable",
  "unknown",
];

const ALLOWED_DOMAIN: QaDomain[] = [
  "application",
  "database",
  "network",
  "cloud",
  "process",
  "strategy",
  "management",
  "operations",
  "governance",
  "other",
];

const ALLOWED_OWNER: OwnerGroup[] = [
  "dev",
  "infra",
  "ops",
  "management",
  "security",
  "other",
];

function normalizeStatus(value: any): QaStatus {
  if (ALLOWED_STATUS.includes(value as QaStatus)) {
    return value as QaStatus;
  }
  return "unknown";
}

function normalizeDomain(value: any): QaDomain {
  if (ALLOWED_DOMAIN.includes(value as QaDomain)) {
    return value as QaDomain;
  }
  return "application";
}

function normalizeOwner(value: any): OwnerGroup {
  if (ALLOWED_OWNER.includes(value as OwnerGroup)) {
    return value as OwnerGroup;
  }
  return "dev";
}

export async function POST(req: NextRequest) {
  try {
    // نستخدم any هنا لأن body فيه حقول أكثر من QaEntry (category, security_area, ...)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: any = await req.json();

    if (!body.question_text || !body.answer_text) {
      return NextResponse.json(
        { error: "question_text and answer_text are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const domain: QaDomain = normalizeDomain(body.domain);
    const status: QaStatus = normalizeStatus(body.status);
    const owner_group: OwnerGroup = normalizeOwner(body.owner_group);

    const qaDoc: QaEntry & Record<string, any> = {
      // الأسئلة
      question_text: String(body.question_text).trim(),
      question_text_en:
        (body.question_text_en && String(body.question_text_en).trim()) ||
        String(body.question_text).trim(),
      question_language: body.question_language === "ar" ? "ar" : "en",

      // الإجابة
      answer_text: String(body.answer_text).trim(),
      answer_language: body.answer_language === "ar" ? "ar" : "en",

      // الحالة والتصنيف
      status,
      domain,
      owner_group,

      // حقول إضافية (ليست جزءاً من QaEntry الأصلي لكن نسمح بتخزينها في Mongo)
      category: body.category ?? null,
      security_area: body.security_area ?? null,
      client_category: body.client_category ?? null,

      is_from_file: body.is_from_file ?? false,
      source_file: body.source_file ?? null,
      source_ref: body.source_ref ?? null,

      needs_dev_input: body.needs_dev_input ?? false,
      needs_infra_input: body.needs_infra_input ?? false,

      explanation_ar: body.explanation_ar ? String(body.explanation_ar) : "",
      dev_questions: Array.isArray(body.dev_questions)
        ? body.dev_questions
        : [],
      infra_questions: Array.isArray(body.infra_questions)
        ? body.infra_questions
        : [],

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
