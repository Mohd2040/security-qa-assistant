import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { ok: false, error: "IDs array is required" },
                { status: 400 }
            );
        }

        const db = await getDb();
        const collection = db.collection("qa_entries");

        const objectIds = ids.map((id: string) => new ObjectId(id));
        const result = await collection.deleteMany({ _id: { $in: objectIds } });

        return NextResponse.json({
            ok: true,
            message: `Successfully deleted ${result.deletedCount} entries`,
            deletedCount: result.deletedCount
        });

    } catch (error: any) {
        console.error("Error bulk deleting questions:", error);
        return NextResponse.json(
            { ok: false, error: "Failed to delete questions" },
            { status: 500 }
        );
    }
}
