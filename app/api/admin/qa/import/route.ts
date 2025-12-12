// app/api/admin/qa/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import * as XLSX from "xlsx";
import {
  isAiEnabled,
  generateArabicExplanation,
  getEmbeddingVector,
} from "@/lib/ai";

export const runtime = "nodejs";

type QaStatus = "applied" | "not_applied" | "not_applicable" | "unknown";

interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
  warnings?: string[];
}

interface ImportStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  imported: number;
  updated: number;
  skippedExisting: number;
  skippedDuplicates?: number;
}

const VALID_STATUSES: QaStatus[] = [
  "applied",
  "not_applied",
  "not_applicable",
  "unknown",
];

// aliases for smart column mapping
const columnAliases: Record<string, string[]> = {
  question_text: ["question_text", "Question (English)", "Question", "question", "Q"],
  question_text_ar: ["question_text_ar", "Question (Arabic)", "question_ar", "السؤال بالعربي", "السؤال (عربي)", "Arabic Question"],
  answer_text: ["answer_text", "answer", "Answer", "الإجابة", "A"],
  status: ["status", "Status", "الحالة", "Result"],
  domain: ["domain", "Domain", "التصنيف", "تصنيف", "Category"],
  owner_group: [
    "owner_group",
    "OwnerGroup",
    "Owner Group",
    "Owner",
    "المسؤول",
    "Team",
  ],
  explanation_ar: [
    "explanation_ar",
    "شرح",
    "شرح عربي",
    "Arabic Explanation",
    "explanation",
  ],
  source_file: ["source_file", "SourceFile", "file", "File", "ملف"],
  source_ref: ["source_ref", "SourceRef", "Reference", "المرجع", "Ref"],
  client_name: [
    "client_name",
    "Client",
    "Client Name",
    "client",
    "اسم العميل",
    "العميل",
  ],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

function buildFieldMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const normalized = headers.map((h) => normalizeHeader(h));

  for (const [field, aliases] of Object.entries(columnAliases)) {
    for (const alias of aliases) {
      const idx = normalized.indexOf(alias.toLowerCase());
      if (idx !== -1) {
        map[field] = headers[idx];
        break;
      }
    }
  }

  return map;
}

function validateRow(
  row: any,
  fieldMap: Record<string, string>,
  rowNumber: number
): ParsedRow {
  const errors: string[] = [];

  const getVal = (field: string): any => {
    const col = fieldMap[field];
    if (!col) return undefined;
    return row[col];
  };

  const q_en_input = (getVal("question_text") ?? "").toString().trim();
  const q_ar_input = (getVal("question_text_ar") ?? "").toString().trim();

  if (!q_en_input) {
    errors.push("Question (English) is required");
  } else if (q_en_input.length < 3) {
    errors.push("Question (English) is too short");
  }

  // Map to DB fields:
  // 1. question_text_en: Explicit English input
  // 2. question_text_ar: Explicit Arabic input
  // 3. question_text: Primary field. Prefer English if available, else fallback to Arabic.
  const question_text_en = q_en_input;
  const question_text_ar = q_ar_input;
  const question_text = q_en_input || q_ar_input;

  let status = (getVal("status") ?? "").toString().trim().toLowerCase();

  // Normalize: replace spaces with underscores (e.g. "not applied" -> "not_applied")
  status = status.replace(/\s+/g, "_");

  if (!status) {
    status = "unknown";
  } else if (!VALID_STATUSES.includes(status as QaStatus)) {
    errors.push(
      `Invalid status '${status}'. Must be one of: applied, not applied, not applicable, unknown`
    );
  }

  const domainRaw = (getVal("domain") ?? "").toString().trim();
  const domain = domainRaw || "application";

  const owner_groupRaw = (getVal("owner_group") ?? "").toString().trim();
  const owner_group = owner_groupRaw || undefined;

  const answer_textRaw = getVal("answer_text");
  const answer_text = answer_textRaw ? answer_textRaw.toString() : "";

  const explanation_arRaw = getVal("explanation_ar");
  const explanation_ar = explanation_arRaw ? explanation_arRaw.toString() : "";

  const source_fileRaw = getVal("source_file");
  const source_file = source_fileRaw
    ? source_fileRaw.toString().trim()
    : undefined;

  const source_refRaw = getVal("source_ref");
  const source_ref = source_refRaw ? source_refRaw.toString().trim() : undefined;

  const client_nameRaw = getVal("client_name");
  const client_name = client_nameRaw
    ? client_nameRaw.toString().trim()
    : undefined;

  const data: Record<string, any> = {
    question_text,
    question_text_en,    // Added English Question
    question_text_ar,    // Added Arabic Question
    answer_text,
    status,
    domain,
    owner_group,
    explanation_ar,
    source_file,
    source_ref,
    client_name,
  };

  return {
    rowNumber,
    data,
    errors,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const mode = (formData.get("mode") || "preview").toString();
    const strategy = (formData.get("strategy") || "upsert").toString();

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { ok: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const blob = file as Blob;
    const arrayBuffer = await blob.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No sheets found in Excel file" },
        { status: 400 }
      );
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Sheet is empty" },
        { status: 400 }
      );
    }

    const headers = Object.keys(rows[0]);
    const fieldMap = buildFieldMap(headers);

    if (!fieldMap.question_text) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Could not detect 'question_text' column. Please make sure one of the aliases exists (question_text, question, Question, السؤال, Q).",
        },
        { status: 400 }
      );
    }

    const parsed: ParsedRow[] = rows.map((row, idx) =>
      validateRow(row, fieldMap, idx + 2)
    );

    // =========================
    // PREVIEW MODE (مع كشف المكررات)
    // =========================
    if (mode === "preview") {
      const db = await getDb();
      const collection = db.collection("qa_entries");

      // 1) مكرر داخل نفس الملف
      const fileCountMap = new Map<string, number>();
      for (const row of parsed) {
        const key = (row.data.question_text || "").toString().trim();
        if (!key) continue;
        fileCountMap.set(key, (fileCountMap.get(key) || 0) + 1);
      }
      const duplicatedInFile = new Set(
        Array.from(fileCountMap.entries())
          .filter(([, count]) => count > 1)
          .map(([key]) => key)
      );

      // 2) مكرر في الداتابيس (نستخدم السؤال الإنجليزي للمقارنة)
      const uniqueQuestions = Array.from(
        new Set(
          parsed
            .map((r) => (r.data.question_text_en || "").toString().trim())
            .filter(Boolean)
        )
      );

      const existingDocs = await collection
        .find({ question_text_en: { $in: uniqueQuestions } })
        .project({ question_text_en: 1 })
        .toArray();

      const existingSet = new Set(
        existingDocs.map((d: any) => d.question_text_en as string)
      );

      // 3) إضافة رسائل الأخطاء أو warnings حسب الـ strategy
      for (const row of parsed) {
        const q = (row.data.question_text_en || "").toString().trim();
        if (!q) continue;

        if (duplicatedInFile.has(q)) {
          row.errors.push("Duplicate question in this file");
        }
        if (existingSet.has(q)) {
          // حسب الـ strategy
          if (strategy === "insertOnly") {
            row.errors.push("Question already exists - will be skipped");
          } else if (strategy === "upsert" || strategy === "replace_all") {
            // ليست error، بل warning
            if (!row.warnings) row.warnings = [];
            row.warnings.push("Question exists - will be updated/replaced");
          } else if (strategy === "updateExisting") {
            // ليست error
            if (!row.warnings) row.warnings = [];
            row.warnings.push("Question exists - will be updated");
          }
        }
      }

      const validRows = parsed.filter((p) => p.errors.length === 0);
      const invalidRows = parsed.filter((p) => p.errors.length > 0);

      return NextResponse.json(
        {
          ok: true,
          mode: "preview",
          totalRows: parsed.length,
          validRows: validRows.length,
          invalidRows: invalidRows.length,
          sampleRows: parsed.slice(0, 10),
        },
        { status: 200 }
      );
    }

    // =========================
    // IMPORT MODE
    // =========================

    // Re-run duplicate check (same logic as preview)
    const db = await getDb();
    const collection = db.collection("qa_entries");

    // 1) مكرر داخل نفس الملف (نستخدم السؤال الإنجليزي)
    const fileCountMap = new Map<string, number>();
    for (const row of parsed) {
      const key = (row.data.question_text_en || "").toString().trim();
      if (!key) continue;
      fileCountMap.set(key, (fileCountMap.get(key) || 0) + 1);
    }
    const duplicatedInFile = new Set(
      Array.from(fileCountMap.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key)
    );

    // 2) مكرر في الداتابيس (نستخدم السؤال الإنجليزي)
    const uniqueQuestions = Array.from(
      new Set(
        parsed
          .map((r) => (r.data.question_text_en || "").toString().trim())
          .filter(Boolean)
      )
    );

    const existingDocs = await collection
      .find({ question_text_en: { $in: uniqueQuestions } })
      .project({ question_text_en: 1 })
      .toArray();

    const existingSet = new Set(
      existingDocs.map((d: any) => d.question_text_en as string)
    );

    // 3) Mark duplicate errors/warnings حسب strategy
    for (const row of parsed) {
      const q = (row.data.question_text_en || "").toString().trim();
      if (!q) continue;

      if (duplicatedInFile.has(q)) {
        row.errors.push("Duplicate question in this file");
      }
      if (existingSet.has(q)) {
        // حسب الـ strategy
        if (strategy === "insertOnly") {
          row.errors.push("Question already exists - will be skipped");
        }
        // للـ strategies الأخرى، لا نضيف error
      }
    }

    // 4) Separate rows: valid (no errors) vs invalid (has errors, including duplicates)
    const validRows = parsed.filter((p) => p.errors.length === 0);
    const invalidRows = parsed.filter((p) => p.errors.length > 0);
    const skippedDuplicates = invalidRows.filter((r) =>
      r.errors.some(e => e.includes("Duplicate") || e.includes("already exists"))
    ).length;

    const stats: ImportStats = {
      totalRows: parsed.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
      imported: 0,
      updated: 0,
      skippedExisting: 0,
      skippedDuplicates: skippedDuplicates,
    };

    const nowIso = new Date().toISOString();
    const useAi = isAiEnabled();

    for (const row of validRows) {
      const d = row.data;

      // المقارنة على السؤال الإنجليزي فقط
      const filter: any = {
        question_text_en: d.question_text_en,
      };
      if (d.client_name) {
        filter.client_name = d.client_name;
      }

      const existing = await collection.findOne(filter);

      // نحضّر explanation_ar والـ embedding
      let explanation_arToUse: string | undefined = d.explanation_ar || undefined;
      let embeddingToUse: number[] | undefined;

      if (existing) {
        // لو موجود في الداتابيس: نكمّل فقط الناقص
        if (!explanation_arToUse && existing.explanation_ar) {
          explanation_arToUse = existing.explanation_ar;
        }
        if (!embeddingToUse && Array.isArray(existing.embedding)) {
          embeddingToUse = existing.embedding as number[];
        }
      }

      // لو ما في شرح عربي، و AI شغال → نولّد شرح
      if (!explanation_arToUse && useAi) {
        try {
          const expl = await generateArabicExplanation({
            question: d.question_text,
            answer: d.answer_text,
          });
          if (expl) {
            explanation_arToUse = expl;
          }
        } catch (e) {
          console.error("Failed to generate explanation_ar via AI:", e);
        }
      }

      // لو ما في embedding، و AI شغال → نولّد embedding
      if (!embeddingToUse && useAi) {
        try {
          const emb = await getEmbeddingVector(d.question_text);
          if (emb) {
            embeddingToUse = emb;
          }
        } catch (e) {
          console.error("Failed to generate embedding via AI:", e);
        }
      }

      const baseDoc = {
        ...d,
        explanation_ar: explanation_arToUse || d.explanation_ar || "",
        ...(embeddingToUse ? { embedding: embeddingToUse } : {}),
      };

      if (strategy === "insertOnly") {
        if (existing) {
          stats.skippedExisting++;
          continue;
        }
        const docToInsert = {
          ...baseDoc,
          question_language: "en",
          answer_language: "en",
          created_at: nowIso,
          updated_at: nowIso,
        };
        await collection.insertOne(docToInsert);
        stats.imported++;
      } else if (strategy === "replace_all") {
        // Replace strategy: حذف كل المكررات (ALL duplicates) وإضافة جديد
        // نحذف كل الأسئلة بنفس question_text_en بغض النظر عن client_name
        if (existing) {
          const deleteFilter: any = {
            question_text_en: d.question_text_en,
          };
          // لا نضيف client_name في filter الحذف - نريد حذف الكل!
          await collection.deleteMany(deleteFilter);
        }
        const docToInsert = {
          ...baseDoc,
          question_language: "en",
          answer_language: "en",
          created_at: nowIso,
          updated_at: nowIso,
        };
        await collection.insertOne(docToInsert);
        if (existing) {
          stats.updated++; // نحسبها update
        } else {
          stats.imported++;
        }
      } else if (strategy === "updateExisting") {
        if (!existing) {
          stats.skippedExisting++;
          continue;
        }
        await collection.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...baseDoc,
              updated_at: nowIso,
            },
          }
        );
        stats.updated++;
      } else {
        // upsert (default)
        if (existing) {
          await collection.updateOne(
            { _id: existing._id },
            {
              $set: {
                ...baseDoc,
                updated_at: nowIso,
              },
            }
          );
          stats.updated++;
        } else {
          const docToInsert = {
            ...baseDoc,
            question_language: "en",
            answer_language: "en",
            created_at: nowIso,
            updated_at: nowIso,
          };
          await collection.insertOne(docToInsert);
          stats.imported++;
        }
      }
    }

    const errorsSample = invalidRows.slice(0, 10);

    return NextResponse.json(
      {
        ok: true,
        mode: "import",
        ...stats,
        errorsSample,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/admin/qa/import:", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
