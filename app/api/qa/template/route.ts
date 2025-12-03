// app/api/qa/template/route.ts
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET() {
  // أسماء الأعمدة (Headers)
  const headers = [
    "question_text",
    "question_text_en",
    "answer_text",
    "status",
    "domain",
    "explanation_ar",
    "needs_dev_input",
    "needs_infra_input",
    "source_file",
    "source_ref",
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "QA_Import");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="qa_import_template.xlsx"',
    },
  });
}
