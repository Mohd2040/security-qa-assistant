// app/api/qa/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

function parseBooleanCell(value: any): boolean {
  if (value === true || value === false) return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(v)) return true;
    if (["false", "no", "n", "0"].includes(v)) return false;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
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

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const resultRow: any = { ...row };

      try {
        const question_text = row.question_text?.toString().trim();
        const answer_text = row.answer_text?.toString().trim();

        if (!question_text || !answer_text) {
          throw new Error(
            "question_text و answer_text مطلوبان في كل صف"
          );
        }

        const status = (row.status || "unknown").toString().trim();
        const domain = (row.domain || "application").toString().trim();

        const qaDoc: any = {
          question_text,
          question_text_en: row.question_text_en
            ? row.question_text_en.toString()
            : null,
          question_language: "ar", // نقدر نطوّرها لاحقاً
          answer_text,
          answer_language: "en", // نقدر نطوّرها لاحقاً
          status,
          domain,
          category: null,
          is_from_file: true,
          source_file: row.source_file ? row.source_file.toString() : null,
          source_ref: row.source_ref ? row.source_ref.toString() : null,
          needs_dev_input: parseBooleanCell(row.needs_dev_input),
          needs_infra_input: parseBooleanCell(row.needs_infra_input),
          explanation_ar: row.explanation_ar
            ? row.explanation_ar.toString()
            : "",
          dev_questions: [],
          infra_questions: [],
          created_at: now,
          updated_at: now,
        };

        const insertResult = await collection.insertOne(qaDoc);

        resultRow.import_status = "inserted";
        resultRow.inserted_id = insertResult.insertedId.toString();
        resultRow.error_message = "";
      } catch (err: any) {
        console.error(`Row ${i + 2} import error:`, err);
        resultRow.import_status = "error";
        resultRow.inserted_id = "";
        resultRow.error_message = err.message || String(err);
      }

      resultsForExcel.push(resultRow);
    }

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
