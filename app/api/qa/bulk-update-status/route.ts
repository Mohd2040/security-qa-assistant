// app/api/qa/bulk-update-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { QaStatus } from "@/lib/types";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const ALLOWED_STATUSES: QaStatus[] = [
  "applied",
  "not_applied",
  "not_applicable",
  "unknown",
];

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { ids?: string[]; status?: QaStatus };

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: "'ids' array is required" },
        { status: 400 }
      );
    }

    if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Valid 'status' is required" },
        { status: 400 }
      );
    }

    const objectIds: ObjectId[] = [];
    for (const id of body.ids) {
      try {
        objectIds.push(new ObjectId(id));
      } catch {
        // نتجاهل IDs غير صالحة
      }
    }

    if (objectIds.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const result = await db.collection("qa_entries").updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          status: body.status,
          updated_at: now,
        },
      }
    );

    return NextResponse.json(
      {
        message: "Bulk status update completed",
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/qa/bulk-update-status:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
