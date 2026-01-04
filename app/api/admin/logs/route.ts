import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search") || "";
        const action = searchParams.get("action") || "all";
        const userFilter = searchParams.get("user") || "all";

        const db = await getDb();
        const collection = db.collection("search_analytics");

        const query: any = {};

        // Search Logic
        if (search) {
            query.$or = [
                { user: { $regex: search, $options: "i" } },
                { query: { $regex: search, $options: "i" } },
                { "details.filename": { $regex: search, $options: "i" } }
            ];
        }

        // Action Filter
        if (action && action !== "all") {
            query.action = action;
        }

        // User Filter
        if (userFilter && userFilter !== "all") {
            query.user = userFilter;
        }

        const skip = (page - 1) * limit;

        const [logs, total, users] = await Promise.all([
            collection.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments(query),
            collection.distinct("user")
        ]);

        // Format logs
        const formattedLogs = logs.map((log) => {
            const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });

            return {
                time,
                type: log.results_count > 0 ? "INFO" : "WARN",
                user: log.user || "Anonymous",
                action: log.action || "SEARCH", // Default to SEARCH for old logs
                details: log.details || `${log.results_count || 0} results`,
                timestamp: log.timestamp,
                full_query: log.query
            };
        });

        return NextResponse.json({
            logs: formattedLogs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            users
        });
    } catch (error) {
        console.error("[Logs Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
