import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { ok: false, error: "ID is required" },
                { status: 400 }
            );
        }

        const db = await getDb();
        const collection = db.collection("qa_entries");

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { ok: false, error: "Question not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: "Question deleted successfully"
        });

    } catch (error: any) {
        console.error("Error deleting question:", error);
        return NextResponse.json(
            { ok: false, error: "Failed to delete question" },
            { status: 500 }
        );
    }
}
