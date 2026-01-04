import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const db = await getDb();
        const collection = db.collection("qa_entries");

        // Fetch all data (you might want to limit fields or sort)
        const data = await collection.find({}).sort({ created_at: -1 }).toArray();

        // Prepare data for Excel
        const excelData = data.map((item: any) => ({
            "ID": item._id.toString(),
            "Question (Arabic)": item.question_text,
            "Question (English)": item.question_text_en || "",
            "Answer": item.answer_text,
            "Status": item.status,
            "Domain": item.domain,
            "Created At": item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Database");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": 'attachment; filename="security_qa_database.xlsx"',
            },
        });

    } catch (error: any) {
        console.error("Error exporting data:", error);
        return NextResponse.json(
            { ok: false, error: "Failed to export data" },
            { status: 500 }
        );
    }
}
