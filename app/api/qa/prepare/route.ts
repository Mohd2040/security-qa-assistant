// app/api/qa/prepare/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

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

    // نقرأ الشيت كـ صفوف (صفوف × أعمدة) – header:1 يعني مصفوفة مصفوفات
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    const questions: { text: string; sourceRef: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // نفترض أن العمود الأول هو عمود الأسئلة
      const raw = (row[0] ?? "").toString().trim();
      if (!raw) continue;

      // تجاهل رأس الجدول لو كان "Question" أو مشابه
      const lower = raw.toLowerCase();
      if (
        ["question", "questions", "السؤال", "بنود", "control"].includes(lower)
      ) {
        continue;
      }

      // نستخدم رقم الصف كـ source_ref (ممكن تعدلها لاحقاً)
      const sourceRef = String(i + 1);
      questions.push({ text: raw, sourceRef });
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "لم يتم العثور على أسئلة صالحة في العمود الأول. تأكد أن الملف يحتوي على عمود واحد فيه الأسئلة.",
        },
        { status: 400 }
      );
    }

    // نبني ملف الإكسل الجديد وفق نفس قالب qa_import_template
    const headers = [
      "question_text",
      "question_text_en",
      "answer_text",
      "status",
      "domain",
      "owner_group",
      "security_area",
      "client_category",
      "explanation_ar",
      "needs_dev_input",
      "needs_infra_input",
      "source_file",
      "source_ref",
    ];

    const data: any[][] = [headers];

    for (const q of questions) {
      const questionText = q.text;

      data.push([
        questionText, // question_text
        questionText, // question_text_en
        "", // answer_text (نتركه فاضي)
        "unknown", // status
        "application", // domain مبدئياً
        "dev", // owner_group مبدئياً (أغلب الأسئلة للتطبيق)
        "", // security_area (تقدر تعبّيه لاحقاً)
        "", // client_category
        "", // explanation_ar
        true, // needs_dev_input
        false, // needs_infra_input
        file.name, // source_file
        q.sourceRef, // source_ref
      ]);
    }

    const outSheet = XLSX.utils.aoa_to_sheet(data);
    const outWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWorkbook, outSheet, "Prepared");

    const outBuffer = XLSX.write(outWorkbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return new NextResponse(outBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="qa_prepared_from_client.xlsx"',
      },
    });
  } catch (err: any) {
    console.error("Error in /api/qa/prepare:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
