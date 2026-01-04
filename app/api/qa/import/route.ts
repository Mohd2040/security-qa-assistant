import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getDb } from "@/lib/mongodb";
import { QaDomain, OwnerGroup, QaStatus } from "@/lib/types";
import { generateArabicExplanation } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const runtime = "nodejs";

function parseBooleanCell(value: any): boolean {
  if (value === true || value === false) return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "yes", "y", "1", "نعم"].includes(v)) return true;
    if (["false", "no", "n", "0", "لا"].includes(v)) return false;
  }
  return false;
}

function mapStatus(val: any): QaStatus {
  if (typeof val !== "string") return "unknown";
  const v = val.trim().toLowerCase();
  if (v.startsWith("applied") || v === "نعم") return "applied";
  if (v.startsWith("not applied") || v === "لا") return "not_applied";
  if (["not applicable", "n/a", "na", "غير منطبق"].includes(v))
    return "not_applicable";
  return "unknown";
}

function mapDomain(val: any): QaDomain {
  if (typeof val !== "string") return "application";
  const v = val.trim().toLowerCase();
  if (["app", "application"].includes(v)) return "application";
  if (["db", "database"].includes(v)) return "database";
  if (["net", "network"].includes(v)) return "network";
  if (["cloud", "gcp", "aws", "azure"].includes(v)) return "cloud";
  if (["process"].includes(v)) return "process";
  if (["strategy"].includes(v)) return "strategy";
  if (["management"].includes(v)) return "management";
  if (["operations", "ops"].includes(v)) return "operations";
  if (["governance"].includes(v)) return "governance";
  return "other";
}

function mapOwnerGroup(val: any): OwnerGroup {
  if (typeof val !== "string") return "dev";
  const v = val.trim().toLowerCase();
  if (["dev", "developer", "development"].includes(v)) return "dev";
  if (["infra", "infrastructure"].includes(v)) return "infra";
  if (["ops", "operations"].includes(v)) return "ops";
  if (["mgmt", "management"].includes(v)) return "management";
  if (["security", "sec", "soc"].includes(v)) return "security";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "لم يتم إرفاق ملف أو نوع الملف غير صحيح" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const db = await getDb();
    const collection = db.collection("qa_entries");

    const resultsForExcel: any[] = [];
    const now = new Date().toISOString();
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const resultRow: any = { ...row };

      try {
        // الحقول الأساسية حسب التمبلت
        const question_text =
          row.question_text?.toString().trim() ||
          row.question?.toString().trim() ||
          row["Question"]?.toString().trim() ||
          "";

        if (!question_text) {
          throw new Error("question_text مطلوب في كل صف");
        }

        const answer_text =
          row.answer_text?.toString() ||
          row.answer?.toString() ||
          row["Answer"]?.toString() ||
          "";

        const status = mapStatus(
          row.status || row["Status"] || row["Result"] || ""
        );

        const domain = mapDomain(
          row.domain || row["Domain"] || row["Scope"] || ""
        );

        const owner_group = mapOwnerGroup(
          row.owner_group ||
          row["Owner"] ||
          row["Responsible"] ||
          row["Owner Group"] ||
          ""
        );

        const security_area =
          row.security_area?.toString() ||
          row["Security Area"]?.toString() ||
          row["Category"]?.toString() ||
          "";

        const client_category =
          row.client_category?.toString() ||
          row["Client Category"]?.toString() ||
          "";

        const question_text_en =
          row.question_text_en?.toString().trim() || question_text;

        let explanation_ar =
          row.explanation_ar?.toString() ||
          row["Explanation AR"]?.toString() ||
          "";

        const needs_dev_input = parseBooleanCell(
          row.needs_dev_input ?? row["needs_dev"]
        );
        const needs_infra_input = parseBooleanCell(
          row.needs_infra_input ?? row["needs_infra"]
        );

        const source_file =
          row.source_file?.toString() || row["source_file"]?.toString() || null;
        const source_ref =
          row.source_ref?.toString() || row["source_ref"]?.toString() || null;

        // لو الشرح العربي فاضي ونقدر نستخدم AI → حاول تولد شرح مختصر
        if (!explanation_ar && process.env.OPENAI_API_KEY) {
          try {
            explanation_ar = await generateArabicExplanation({
              question: question_text_en,
              answer: answer_text,
            }, (session.user as any).email || "Anonymous");
          } catch (e) {
            console.error("AI explanation error:", e);
            // لا نرمي خطأ، فقط نكمّل بدونه
          }
        }

        const qaDoc: any = {
          question_text,
          question_text_en,
          question_language: "en",

          answer_text,
          answer_language: "en",

          status,
          domain,
          category: null,
          owner_group,
          security_area: security_area || null,
          client_category: client_category || null,

          is_from_file: true,
          source_file: source_file || file.name || null,
          source_ref: source_ref || null,

          needs_dev_input,
          needs_infra_input,

          explanation_ar: explanation_ar || "",
          dev_questions: [],
          infra_questions: [],

          created_at: now,
          updated_at: now,
        };

        const insertResult = await collection.insertOne(qaDoc);

        resultRow.import_status = "inserted";
        resultRow.inserted_id = insertResult.insertedId.toString();
        resultRow.error_message = "";
        successCount++;
      } catch (err: any) {
        console.error(`Row ${i + 2} import error:`, err);
        resultRow.import_status = "error";
        resultRow.inserted_id = "";
        resultRow.error_message = err.message || String(err);
      }

      resultsForExcel.push(resultRow);
    }

    // ✅ LOGGING: Log import event
    const { logEvent } = await import("@/lib/logger");
    await logEvent({
      user: (session.user as any).email,
      action: "IMPORT",
      details: {
        filename: file.name,
        count: successCount,
        total_rows: rows.length
      }
    });

    // بناء ملف Excel للنتيجة
    const resultSheet = XLSX.utils.json_to_sheet(resultsForExcel);
    const resultWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(resultWorkbook, resultSheet, "ImportResult");

    const outBuffer = XLSX.write(resultWorkbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return new NextResponse(outBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="qa_import_result.xlsx"',
      },
    });
  } catch (err: any) {
    console.error("Error in /api/qa/import:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
