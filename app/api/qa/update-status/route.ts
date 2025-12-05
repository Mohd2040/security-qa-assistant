// app/api/qa/update-status/route.ts
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
    const body = (await req.json()) as { id?: string; status?: QaStatus };

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Both 'id' and 'status' are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(body.id);
    } catch {
      return NextResponse.json(
        { error: "Invalid document id" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const result = await db.collection("qa_entries").updateOne(
      { _id: objectId },
      {
        $set: {
          status: body.status,
          updated_at: now,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Status updated",
        id: body.id,
        status: body.status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/qa/update-status:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
