import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const { id } = params;
        const body = await req.json();
        const { name, email, password, role } = body;

        // ✅ SECURITY: Validate inputs
        const { validateEmail, validateEnum, sanitizeMongoInput } = await import("@/lib/input-validator");

        let validatedEmail: string;
        let validatedName: string;
        let validatedRole: string;

        try {
            validatedEmail = validateEmail(email);
            validatedName = sanitizeMongoInput(name) || "";
            validatedRole = validateEnum(role, ["admin", "user"], "role");
        } catch (validationError: any) {
            return NextResponse.json({ error: validationError.message }, { status: 400 });
        }

        const db = await getDb();

        const updateData: any = {
            name: validatedName,
            email: validatedEmail,
            role: validatedRole,
            updatedAt: new Date(),
        };

        // Only update password if provided
        if (password && password.trim() !== "") {
            if (password.length < 8) {
                return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            updateData.password = hashedPassword;
        }

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[User Update Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const { id } = params;
        const db = await getDb();

        const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[User Delete Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
