// app/api/admin/qa/deduplicate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

type QaStatus = "applied" | "not_applied" | "not_applicable" | "unknown";

interface InternalDoc {
  _id: any;
  question_text: string;
  question_text_en?: string;
  answer_text?: string;
  explanation_ar?: string;
  status?: QaStatus;
  domain?: string;
  owner_group?: string;
  source_file?: string;
  source_ref?: string;
  client_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface DeduplicateBody {
  dryRun?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    let body: DeduplicateBody = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const dryRun = body.dryRun !== false; // default: true

    const db = await getDb();
    const collection = db.collection("qa_entries");

    // نجمع حسب question_text و client_name (عشان في المستقبل نفس السؤال مع عميل مختلف يكون مسموح)
    const groups = await collection
      .aggregate([
        {
          $group: {
            _id: {
              question_text: "$question_text",
              client_name: "$client_name",
            },
            ids: { $push: "$_id" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray();

    if (!groups.length) {
      return NextResponse.json(
        {
          message: "No duplicates found",
          groupsFound: 0,
          duplicatesToDelete: 0,
        },
        { status: 200 }
      );
    }

    const statusPriority: Record<string, number> = {
      applied: 4,
      not_applied: 3,
      not_applicable: 2,
      unknown: 1,
    };

    let totalGroups = 0;
    let totalToDelete = 0;
    let totalUpdated = 0;

    for (const g of groups) {
      totalGroups++;

      const ids = g.ids as any[];
      const docs = (await collection
        .find({ _id: { $in: ids } })
        .toArray()) as InternalDoc[];

      if (docs.length <= 1) continue;

      // نرتبهم حسب:
      // 1) أفضل حالة
      // 2) أحدث updated_at / created_at
      const sorted = docs.sort((a, b) => {
        const sa = statusPriority[a.status || "unknown"] || 0;
        const sb = statusPriority[b.status || "unknown"] || 0;
        if (sb !== sa) return sb - sa;

        const da = a.updated_at || a.created_at || "";
        const db = b.updated_at || b.created_at || "";
        return db > da ? 1 : db < da ? -1 : 0;
      });

      const keep = sorted[0];
      const others = sorted.slice(1);

      // ندمج البيانات المفيدة من الآخرين في المستند الأساسي
      const merged: Partial<InternalDoc> = { ...keep };

      for (const o of others) {
        if (!merged.answer_text && o.answer_text) {
          merged.answer_text = o.answer_text;
        }
        if (!merged.explanation_ar && o.explanation_ar) {
          merged.explanation_ar = o.explanation_ar;
        }
        if (!merged.question_text_en && o.question_text_en) {
          merged.question_text_en = o.question_text_en;
        }
        if (!merged.domain && o.domain) merged.domain = o.domain;
        if (!merged.owner_group && o.owner_group)
          merged.owner_group = o.owner_group;

        // لو الحالة في الأساسي unknown وفي الثاني أفضل → نأخذ الأفضل
        const currentStatusPriority =
          statusPriority[merged.status || "unknown"] || 0;
        const otherStatusPriority =
          statusPriority[o.status || "unknown"] || 0;
        if (otherStatusPriority > currentStatusPriority) {
          merged.status = o.status;
        }

        // نحدّث updated_at على آخر شيء
        const da = merged.updated_at || merged.created_at || "";
        const db = o.updated_at || o.created_at || "";
        if (db > da) {
          merged.updated_at = db;
        }
      }

      const deleteIds = others.map((o) => o._id);
      totalToDelete += deleteIds.length;

      if (!dryRun) {
        // نحذف الحقول اللي ممنوع تتغير
        const { _id, ...updateData } = merged;

        // تحديث المستند الأساسي بالدمج
        await collection.updateOne(
          { _id: keep._id },
          { $set: updateData }
        );
        totalUpdated++;

        // حذف الباقي
        if (deleteIds.length > 0) {
          await collection.deleteMany({ _id: { $in: deleteIds } });
        }
      }
    }

    return NextResponse.json(
      {
        dryRun,
        message: dryRun
          ? "Dry-run completed. No documents were modified."
          : "Deduplication completed.",
        duplicateGroups: totalGroups,
        duplicatesToDelete: totalToDelete,
        documentsUpdated: totalUpdated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/admin/qa/deduplicate:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
