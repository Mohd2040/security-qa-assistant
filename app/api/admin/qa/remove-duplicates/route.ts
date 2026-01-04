// app/api/admin/qa/remove-duplicates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

interface DuplicateGroup {
    question_text_en: string;
    count: number;
    ids: string[];
    documents: any[];
}

/**
 * POST /api/admin/qa/remove-duplicates
 * حذف الأسئلة المكررة بناءً على question_text_en
 * يحتفظ بأحدث سؤال ويحذف الباقي
 */
export async function POST(req: NextRequest) {
    try {
        const { dryRun = true } = await req.json();

        const db = await getDb();
        const collection = db.collection("qa_entries");

        // 1. جلب جميع الأسئلة
        const allEntries = await collection.find({}).toArray();

        // 2. تجميع الأسئلة حسب question_text_en
        const groupedByQuestion = new Map<string, any[]>();

        for (const entry of allEntries) {
            const questionEn = entry.question_text_en?.trim().toLowerCase();

            // تجاهل الأسئلة بدون نص إنجليزي
            if (!questionEn) continue;

            if (!groupedByQuestion.has(questionEn)) {
                groupedByQuestion.set(questionEn, []);
            }
            groupedByQuestion.get(questionEn)!.push(entry);
        }

        // 3. إيجاد المجموعات المكررة (أكثر من سؤال واحد)
        const duplicates: DuplicateGroup[] = [];
        const idsToDelete: ObjectId[] = [];

        for (const [questionEn, entries] of groupedByQuestion.entries()) {
            if (entries.length > 1) {
                // ترتيب حسب تاريخ التحديث (الأحدث أولاً)
                entries.sort((a, b) => {
                    const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                    const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                    return dateB - dateA; // الأحدث أولاً
                });

                // الاحتفاظ بالأول (الأحدث) وحذف الباقي
                const toKeep = entries[0];
                const toDelete = entries.slice(1);

                duplicates.push({
                    question_text_en: questionEn,
                    count: entries.length,
                    ids: entries.map(e => e._id.toString()),
                    documents: entries.map(e => ({
                        _id: e._id.toString(),
                        question_text: e.question_text,
                        created_at: e.created_at,
                        updated_at: e.updated_at,
                        willKeep: e._id.toString() === toKeep._id.toString()
                    }))
                });

                // إضافة IDs المراد حذفها
                toDelete.forEach(entry => idsToDelete.push(entry._id));
            }
        }

        // 4. إذا كان dryRun = false، نفذ الحذف
        let deletedCount = 0;
        if (!dryRun && idsToDelete.length > 0) {
            const result = await collection.deleteMany({
                _id: { $in: idsToDelete }
            });
            deletedCount = result.deletedCount || 0;
        }

        return NextResponse.json({
            ok: true,
            dryRun,
            summary: {
                totalEntries: allEntries.length,
                uniqueQuestions: groupedByQuestion.size,
                duplicateGroups: duplicates.length,
                duplicateEntries: idsToDelete.length,
                deletedCount: dryRun ? 0 : deletedCount
            },
            duplicates: duplicates.slice(0, 50), // أول 50 مجموعة مكررة
            message: dryRun
                ? `تم العثور على ${duplicates.length} مجموعة مكررة (${idsToDelete.length} سؤال سيتم حذفه). استخدم dryRun: false للحذف الفعلي.`
                : `تم حذف ${deletedCount} سؤال مكرر بنجاح.`
        });

    } catch (err: any) {
        console.error("Error removing duplicates:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/qa/remove-duplicates
 * عرض معلومات عن التكرارات فقط (بدون حذف)
 */
export async function GET(req: NextRequest) {
    try {
        const db = await getDb();
        const collection = db.collection("qa_entries");

        const allEntries = await collection.find({}).toArray();

        const groupedByQuestion = new Map<string, any[]>();

        for (const entry of allEntries) {
            const questionEn = entry.question_text_en?.trim().toLowerCase();
            if (!questionEn) continue;

            if (!groupedByQuestion.has(questionEn)) {
                groupedByQuestion.set(questionEn, []);
            }
            groupedByQuestion.get(questionEn)!.push(entry);
        }

        const duplicates: DuplicateGroup[] = [];
        let totalDuplicates = 0;

        for (const [questionEn, entries] of groupedByQuestion.entries()) {
            if (entries.length > 1) {
                entries.sort((a, b) => {
                    const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                    const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                    return dateB - dateA;
                });

                duplicates.push({
                    question_text_en: questionEn,
                    count: entries.length,
                    ids: entries.map(e => e._id.toString()),
                    documents: entries.map((e, idx) => ({
                        _id: e._id.toString(),
                        question_text: e.question_text,
                        question_text_en: e.question_text_en,
                        created_at: e.created_at,
                        updated_at: e.updated_at,
                        willKeep: idx === 0 // الأحدث سيتم الاحتفاظ به
                    }))
                });

                totalDuplicates += entries.length - 1; // عدد التكرارات (ناقص الذي سنحتفظ به)
            }
        }

        return NextResponse.json({
            ok: true,
            summary: {
                totalEntries: allEntries.length,
                uniqueQuestions: groupedByQuestion.size,
                duplicateGroups: duplicates.length,
                totalDuplicateEntries: totalDuplicates
            },
            duplicates: duplicates.slice(0, 100) // أول 100 مجموعة
        });

    } catch (err: any) {
        console.error("Error checking duplicates:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
