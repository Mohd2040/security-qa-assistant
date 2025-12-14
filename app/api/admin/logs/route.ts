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

        const db = await getDb();

        // Get real log data from search_analytics collection
        const logs = await db
            .collection("search_analytics")
            .find({})
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

        // Format logs for display
        const formattedLogs = logs.map((log) => {
            const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });

            return {
                time,
                type: log.results_count > 0 ? "INFO" : "WARN",
                user: log.user || "Anonymous",
                action: `Search: "${log.query.substring(0, 50)}${log.query.length > 50 ? "..." : ""}"`,
                details: `${log.results_count || 0} results`,
                timestamp: log.timestamp,
            };
        });

        return NextResponse.json(formattedLogs);
    } catch (error) {
        console.error("[Logs Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
