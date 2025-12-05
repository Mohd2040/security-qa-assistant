// app/api/qa/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry, QaDomain, OwnerGroup, QaStatus } from "@/lib/types";

export const runtime = "nodejs";

interface SearchBody {
  query?: string;
  status?: QaStatus | "all";
  domain?: QaDomain | "all";
  owner_group?: OwnerGroup | "all";
  page?: number;
  pageSize?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchBody;

    const {
      query = "",
      status = "all",
      domain = "all",
      owner_group = "all",
    } = body;

    let { page = 1, pageSize = 50 } = body;

    page = Math.max(1, page);
    pageSize = Math.min(Math.max(pageSize, 1), 200);

    const db = await getDb();
    const collection = db.collection("qa_entries");

    let filter: any = {};
    let sort: any = { updated_at: -1 };
    const trimmedQuery = query.trim();

    // --- تطبيق الفلاتر (status/domain/owner) ---
    if (status !== "all") {
      filter.status = status;
    }
    if (domain !== "all") {
      filter.domain = domain;
    }
    if (owner_group !== "all") {
      filter.owner_group = owner_group;
    }

    // --- بحث أساسي باستخدام text index إن وجد ---
    if (trimmedQuery) {
      filter.$text = { $search: trimmedQuery };
      sort = { score: { $meta: "textScore" }, updated_at: -1 } as any;
    }

    // نحسب النتائج مبدئياً
    let total = await collection.countDocuments(filter);

    // --- Fuzzy Search بسيط (fallback) لو ما فيه نتائج من text search ---
    if (trimmedQuery && total === 0) {
      // نرجع نستخدم RegExp case-insensitive على question/answer
      const safe = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");

      filter = {
        ...((status !== "all" || domain !== "all" || owner_group !== "all") && {
          status: filter.status,
          domain: filter.domain,
          owner_group: filter.owner_group,
        }),
        $or: [
          { question_text: regex },
          { question_text_en: regex },
          { answer_text: regex },
        ],
      };

      sort = { updated_at: -1 };
      total = await collection.countDocuments(filter);
    }

    const cursor = collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const docs = await cursor.toArray();

    const matches: QaEntry[] = docs.map((doc: any) => ({
      _id: doc._id.toString(),
      question_text: doc.question_text,
      question_text_en: doc.question_text_en || undefined,
      question_language: doc.question_language || "en",
      answer_text: doc.answer_text || "",
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
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
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
