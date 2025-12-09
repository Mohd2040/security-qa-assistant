// app/api/qa/search/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaDomain, OwnerGroup, QaStatus } from "@/lib/types";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "";
    const status = (searchParams.get("status") ||
      "all") as QaStatus | "all";
    const domain = (searchParams.get("domain") ||
      "all") as QaDomain | "all";
    const owner_group = (searchParams.get("owner_group") ||
      "all") as OwnerGroup | "all";

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
      .toArray();

    const rows = docs.map((doc: any) => ({
      question_text: doc.question_text,
      question_text_en: doc.question_text_en || "",
      answer_text: doc.answer_text || "",
      status: doc.status || "unknown",
      domain: doc.domain || "",
      owner_group: doc.owner_group || "",
      security_area: doc.security_area || "",
      client_category: doc.client_category || "",
      explanation_ar: doc.explanation_ar || "",
      needs_dev_input: doc.needs_dev_input ?? false,
      needs_infra_input: doc.needs_infra_input ?? false,
      source_file: doc.source_file || "",
      source_ref: doc.source_ref || "",
      created_at: doc.created_at || "",
      updated_at: doc.updated_at || "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "SearchExport");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="security_qa_report.xlsx"',
      },
    });
  } catch (err: any) {
    console.error("Error in /api/qa/search/export:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
