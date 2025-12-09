import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
    try {
        // 1. Define Headers
        // Must match the "columnAliases" in import/route.ts for best experience
        const headers = [
            "Question (English)", // question_text
            "Question (Arabic)",  // question_text_ar
            "Arabic Explanation", // explanation_ar
            "Status",             // status
            "Domain",             // domain
            "Owner Group",        // owner_group
            "Answer",             // answer_text
            "Source File",        // source_file
            "Reference",          // source_ref
            "Client Name"         // client_name
        ];

        // 2. Define Sample Data
        const sampleData = [
            {
                "Question (English)": "What is the password policy?",
                "Question (Arabic)": "ما هي سياسة كلمات المرور؟",
                "Arabic Explanation": "شرح عن سياسة كلمات المرور",
                "Status": "applied",
                "Domain": "Identity",
                "Owner Group": "IT Security",
                "Answer": "Passwords must be 12 chars long...",
                "Source File": "Policy_v1.pdf",
                "Reference": "Section 3.1",
                "Client Name": "Acme Corp"
            },
            {
                "Question (English)": "Is MFA enabled?",
                "Question (Arabic)": "هل المصادقة الثنائية مفعلة؟",
                "Arabic Explanation": "",
                "Status": "not applied",
                "Domain": "Access Control",
                "Owner Group": "IT Ops",
                "Answer": "Not yet implemented.",
                "Source File": "",
                "Reference": "",
                "Client Name": ""
            }
        ];

        // 3. Create Workbook
        const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });

        // Set column widths for better readability
        worksheet['!cols'] = [
            { wch: 40 }, // Question
            { wch: 30 }, // Arabic Explanation
            { wch: 15 }, // Status
            { wch: 15 }, // Domain
            { wch: 15 }, // Owner Group
            { wch: 40 }, // Answer
            { wch: 20 }, // Source File
            { wch: 15 }, // Reference
            { wch: 15 }, // Client Name
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

        // 4. Generate Buffer
        const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // 5. Return Response
        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Disposition": 'attachment; filename="qa_import_template.xlsx"',
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });
    } catch (error) {
        console.error("Error generating template:", error);
        return NextResponse.json(
            { error: "Failed to generate template" },
            { status: 500 }
        );
    }
}
