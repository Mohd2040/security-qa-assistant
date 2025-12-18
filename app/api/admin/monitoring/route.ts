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
        const collection = db.collection("openai_usage");

        // 1. Total Stats
        const totalStats = await collection.aggregate([
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: "$cost" },
                    totalTokens: { $sum: "$tokens_total" },
                    totalRequests: { $sum: 1 }
                }
            }
        ]).toArray();

        // 2. Usage by Feature
        const usageByFeature = await collection.aggregate([
            {
                $group: {
                    _id: "$feature",
                    cost: { $sum: "$cost" },
                    requests: { $sum: 1 }
                }
            },
            { $sort: { cost: -1 } }
        ]).toArray();

        // 3. Usage by User (Top 10)
        const usageByUser = await collection.aggregate([
            {
                $group: {
                    _id: "$user",
                    cost: { $sum: "$cost" },
                    requests: { $sum: 1 },
                    tokens: { $sum: "$tokens_total" }
                }
            },
            { $sort: { cost: -1 } },
            { $limit: 10 }
        ]).toArray();

        // 4. Daily Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTrend = await collection.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    cost: { $sum: "$cost" },
                    tokens: { $sum: "$tokens_total" }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        // 5. Recent Calls
        const recentCalls = await collection.find({})
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();

        return NextResponse.json({
            stats: totalStats[0] || { totalCost: 0, totalTokens: 0, totalRequests: 0 },
            byFeature: usageByFeature,
            byUser: usageByUser,
            dailyTrend,
            recentCalls
        });

    } catch (error) {
        console.error("Monitoring API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
