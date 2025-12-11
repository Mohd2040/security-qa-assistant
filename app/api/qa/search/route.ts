// app/api/qa/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaEntry, QaDomain, OwnerGroup, QaStatus } from "@/lib/types";
import Fuse from "fuse.js";
import { normalizeArabic, looksArabic } from "@/lib/arabic";
import { getEmbedding, cosineSimilarity } from "@/lib/embeddings";
import { expandQuery, isOpenAIEnabled } from "@/lib/ai";
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limiter";

export const runtime = "nodejs";

interface SearchBody {
  query?: string;
  status?: QaStatus | "all";
  domain?: QaDomain | "all";
  owner_group?: OwnerGroup | "all";
  page?: number;
  pageSize?: number;
  dateFrom?: string; // ISO التاريخ من
  dateTo?: string; // ISO التاريخ إلى
  source_file?: string;
  client_name?: string;
  includeAi?: boolean; // تفعيل تحسينات AI (Query Expansion)
}

// هذا النوع يمثل الـ Document اللي راجع من Mongo
// أضفنا question_text_ar عشان نقدر نستخدمه في docToQaEntry
type InternalDoc = {
  _id: any;
  question_text: string;
  question_text_en?: string;
  question_text_ar?: string;
  answer_text?: string;
  status?: QaStatus;
  domain?: QaDomain;
  owner_group?: OwnerGroup;
  explanation_ar?: string;
  source_file?: string;
  source_ref?: string;
  created_at?: string;
  updated_at?: string;
  embedding?: number[];
  client_name?: string;
};

export async function POST(req: NextRequest) {
  try {
    // ✅ SECURITY: Check Rate Limit (200 requests/minute for search)
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId, RATE_LIMITS.search);

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetTime);
    }

    const body = (await req.json()) as SearchBody;

    const {
      query = "",
      status = "all",
      domain = "all",
      owner_group = "all",
      dateFrom,
      dateTo,
      source_file,
      client_name,
      includeAi = false,
    } = body;

    let { page = 1, pageSize = 50 } = body;

    page = Math.max(1, page);
    pageSize = Math.min(Math.max(pageSize, 1), 200);

    const trimmedQuery = (query || "").trim();
    const isArabicQuery = looksArabic(trimmedQuery);
    const normalizedQuery = isArabicQuery
      ? normalizeArabic(trimmedQuery)
      : trimmedQuery;

    // -------------------------
    // AI Query Expansion (إذا مفعّل)
    // -------------------------
    let expandedTerms: string[] = [trimmedQuery];
    if (includeAi && trimmedQuery && isOpenAIEnabled()) {
      try {
        expandedTerms = await expandQuery(trimmedQuery);
        console.log("[AI] Query expanded:", expandedTerms);
      } catch (e) {
        console.warn("[AI] Query expansion failed, using original query", e);
        expandedTerms = [trimmedQuery];
      }
    }

    const db = await getDb();
    const collection = db.collection("qa_entries");

    // -------------------------
    // 1) بناء الفلتر الأساسي
    // -------------------------
    const filter: any = {};

    if (status !== "all") filter.status = status;
    if (domain !== "all") filter.domain = domain;
    if (owner_group !== "all") filter.owner_group = owner_group;
    if (source_file && source_file.trim()) {
      filter.source_file = source_file.trim();
    }
    if (client_name && client_name.trim()) {
      filter.client_name = client_name.trim();
    }

    if (dateFrom || dateTo) {
      const createdFilter: any = {};
      if (dateFrom) createdFilter.$gte = new Date(dateFrom).toISOString();
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        createdFilter.$lte = end.toISOString();
      }
      filter.created_at = createdFilter;
    }

    // -------------------------
    // 2) جلب مجموعة من المرشحين من MongoDB
    //    (نحدّ العدد عشان الأداء)
    // -------------------------
    const MAX_CANDIDATES = 500;

    const mongoCandidates = (await collection
      .find(filter)
      .limit(MAX_CANDIDATES)
      .toArray()) as InternalDoc[];

    // لو مافيه سؤال → فقط رجّع النتائج كـ list بسيطة
    if (!trimmedQuery) {
      // ترتيب بسيط: حسب الحالة ثم آخر تحديث
      const statusPriority: Record<string, number> = {
        applied: 1,
        not_applied: 2,
        not_applicable: 3,
        unknown: 4,
      };

      mongoCandidates.sort((a, b) => {
        const sa = statusPriority[a.status || "unknown"] || 99;
        const sb = statusPriority[b.status || "unknown"] || 99;
        if (sa !== sb) return sa - sb;
        const da = a.updated_at || a.created_at || "";
        const db_ = b.updated_at || b.created_at || "";
        return db_ > da ? 1 : db_ < da ? -1 : 0;
      });

      const total = mongoCandidates.length;
      const start = (page - 1) * pageSize;
      const slice = mongoCandidates.slice(start, start + pageSize);

      const matches = slice.map(docToQaEntry);

      // تسجيل البحث في analytics
      logSearch(db, {
        query: trimmedQuery,
        normalizedQuery,
        filters: { status, domain, owner_group, dateFrom, dateTo, source_file },
        total,
      }).catch(() => { });

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
    }

    // -------------------------
    // 3) Fuzzy Search باستخدام fuse.js
    // -------------------------
    const fuse = new Fuse(mongoCandidates, {
      includeScore: true,
      threshold: 0.45, // كل ما صغرت صار البحث أدق
      keys: [
        {
          name: "question_text",
          getFn: (doc: InternalDoc) =>
            isArabicQuery
              ? normalizeArabic(doc.question_text || "")
              : doc.question_text || "",
        },
        {
          name: "question_text_en",
          getFn: (doc: InternalDoc) =>
            isArabicQuery
              ? normalizeArabic(doc.question_text_en || "")
              : doc.question_text_en || "",
        },
        {
          name: "answer_text",
          getFn: (doc: InternalDoc) =>
            isArabicQuery
              ? normalizeArabic(doc.answer_text || "")
              : doc.answer_text || "",
        },
      ],
    });

    const fuseResults = (() => {
      // إذا كان لدينا expanded terms متعددة، نبحث بكل منها وندمج النتائج
      if (expandedTerms.length > 1) {
        type FuseResultItem = { item: InternalDoc; score?: number; refIndex: number };
        const allResults = new Map<string, FuseResultItem>();

        for (const term of expandedTerms) {
          const searchTerm = isArabicQuery ? normalizeArabic(term) : term;
          const results = fuse.search(searchTerm);

          for (const result of results) {
            const id = result.item._id?.toString() || "";
            const existing = allResults.get(id);
            // نحتفظ بالنتيجة الأفضل (أقل score في Fuse = أفضل)
            if (!existing || (result.score || 1) < (existing.score || 1)) {
              allResults.set(id, result);
            }
          }
        }

        return Array.from(allResults.values());
      }

      // البحث العادي بدون AI
      return fuse.search(isArabicQuery ? normalizedQuery : trimmedQuery);
    })();


    type ScoredDoc = {
      doc: InternalDoc;
      fuzzyScore: number; // 0..1 (1 أفضل)
      semanticScore: number; // 0..1
      finalScore: number; // 0..1
    };

    const scoredDocs: ScoredDoc[] = [];

    // -------------------------
    // 4) Optional Semantic Search (rerank)
    // -------------------------
    let queryEmbedding: number[] | null = null;
    try {
      queryEmbedding = await getEmbedding(trimmedQuery);
    } catch (e) {
      queryEmbedding = null;
    }

    // نستخدم فقط أول N نتيجة من Fuzzy
    const MAX_FOR_SEMANTIC = 200;
    const sliceFuse = fuseResults.slice(0, MAX_FOR_SEMANTIC);

    for (const r of sliceFuse) {
      const doc = r.item;
      const fuzzyScore =
        r.score != null ? 1 - Math.min(Math.max(r.score, 0), 1) : 0;

      let semanticScore = 0;
      if (queryEmbedding && Array.isArray(doc.embedding)) {
        semanticScore = cosineSimilarity(
          queryEmbedding,
          doc.embedding as number[]
        );
        // نضمن أنها بين 0 و 1
        semanticScore = Math.max(0, Math.min(1, (semanticScore + 1) / 2));
      }

      // Hybrid ranking:
      // لو semantic موجود → نعطيه وزن أعلى
      const finalScore =
        semanticScore > 0 ? 0.6 * semanticScore + 0.4 * fuzzyScore : fuzzyScore;

      scoredDocs.push({
        doc,
        fuzzyScore,
        semanticScore,
        finalScore,
      });
    }

    // لو ما في نتائح من fuse (مثلاً query قصير جداً) → نستخدم كل المرشحين مع ترتيب بسيط
    if (scoredDocs.length === 0) {
      for (const doc of mongoCandidates) {
        scoredDocs.push({
          doc,
          fuzzyScore: 0,
          semanticScore: 0,
          finalScore: 0,
        });
      }
    }

    // ترتيب تنازلياً حسب finalScore ثم الحالة (applied أولاً) ثم last updated
    const statusPriority: Record<string, number> = {
      applied: 1,
      not_applied: 2,
      not_applicable: 3,
      unknown: 4,
    };

    scoredDocs.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;

      const sa = statusPriority[a.doc.status || "unknown"] || 99;
      const sb = statusPriority[b.doc.status || "unknown"] || 99;
      if (sa !== sb) return sa - sb;

      const da = a.doc.updated_at || a.doc.created_at || "";
      const db_ = b.doc.updated_at || b.doc.created_at || "";
      return db_ > da ? 1 : db_ < da ? -1 : 0;
    });

    const total = scoredDocs.length;
    const start = (page - 1) * pageSize;
    const pageSlice = scoredDocs.slice(start, start + pageSize);

    const matches: QaEntry[] = pageSlice.map((s) =>
      docToQaEntry(s.doc, s.finalScore)
    );

    // -------------------------
    // 5) Search Analytics (Backend logging)
    // -------------------------
    logSearch(db, {
      query: trimmedQuery,
      normalizedQuery,
      filters: { status, domain, owner_group, dateFrom, dateTo, source_file },
      total,
    }).catch(() => { });

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

// تحويل Document إلى QaEntry
function docToQaEntry(doc: InternalDoc, score?: number): QaEntry {
  return {
    _id: doc._id?.toString?.(),
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
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    client_name: doc.client_name || undefined,
    question_text_ar: doc.question_text_ar || undefined, // Map Arabic text
    score: score ? Math.round(score * 100) : undefined,
  };
}

// وظيفة بسيطة لتسجيل الـ analytics في Collection منفصل
async function logSearch(
  db: any,
  params: {
    query: string;
    normalizedQuery: string;
    filters: any;
    total: number;
  }
) {
  try {
    const logs = db.collection("qa_search_logs");
    await logs.insertOne({
      query: params.query,
      normalizedQuery: params.normalizedQuery,
      filters: params.filters,
      totalResults: params.total,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Failed to log search analytics");
  }
}
