import { getDb } from "@/lib/mongodb";

export type LogAction =
    | "LOGIN"
    | "SEARCH"
    | "MATCH"
    | "EDIT"
    | "TRANSLATE"
    | "IMPORT"
    | "EXPORT";

export interface LogEntry {
    user: string;
    action: LogAction;
    details?: any;
    ip?: string;
    timestamp?: Date;
}

export async function logEvent(entry: LogEntry) {
    try {
        const db = await getDb();
        await db.collection("search_analytics").insertOne({
            timestamp: new Date(),
            user: entry.user,
            action: entry.action, // This maps to 'type' in the old schema, but we'll use 'action' for clarity now
            details: entry.details || {},
            ip: entry.ip
        });
    } catch (error) {
        console.error("Failed to log event:", error);
        // We don't throw here to avoid breaking the main flow
    }
}
