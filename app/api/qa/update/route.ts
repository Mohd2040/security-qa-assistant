import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { _id, ...rawUpdates } = body;

        if (!_id) {
            return NextResponse.json(
                { error: "Missing _id" },
                { status: 400 }
            );
        }

        // ✅ SECURITY: Whitelist allowed fields to prevent mass assignment
        const allowedFields = [
            "question_text",
            "question_text_en",
            "question_text_ar",
            "answer_text",
            "status",
            "domain",
            "owner_group",
            "client_name",
            "category",
            "security_area",
            "explanation_ar",
            "needs_dev_input",
            "needs_infra_input"
        ];

        const updates: any = {};
        allowedFields.forEach(field => {
            if (rawUpdates[field] !== undefined) {
                updates[field] = rawUpdates[field];
            }
        });

        const db = await getDb();
        const collection = db.collection("qa_entries");

        // Add updated_at
        updates.updated_at = new Date().toISOString();

        const result = await collection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Entry not found" },
                { status: 404 }
            );
        }

        // ✅ LOGGING: Log edit event
        const { logEvent } = await import("@/lib/logger");
        await logEvent({
            user: (session.user as any).email,
            action: "EDIT",
            details: {
                qa_id: _id,
                updated_fields: Object.keys(updates)
            }
        });

        return NextResponse.json(
            { success: true, message: "Entry updated successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating entry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
