import { getDb } from "@/lib/mongodb";

// Pricing Rates (per 1M tokens) as of late 2024
const RATES: Record<string, { input: number; output: number }> = {
    "gpt-4o-mini": { input: 0.15, output: 0.60 },
    "gpt-4o": { input: 2.50, output: 10.00 },
    "gpt-4-turbo": { input: 10.00, output: 30.00 },
    "text-embedding-3-small": { input: 0.02, output: 0.00 },
    "text-embedding-3-large": { input: 0.13, output: 0.00 },
};

export interface UsageMetrics {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export async function trackUsage(
    model: string,
    tokens: UsageMetrics,
    user: string,
    feature: string
) {
    try {
        const db = await getDb();
        const collection = db.collection("openai_usage");

        // Calculate Cost
        const rate = RATES[model] || RATES["gpt-4o-mini"]; // Default to mini if unknown
        const inputCost = (tokens.prompt_tokens / 1_000_000) * rate.input;
        const outputCost = (tokens.completion_tokens / 1_000_000) * rate.output;
        const totalCost = inputCost + outputCost;

        await collection.insertOne({
            timestamp: new Date(),
            user: user || "Anonymous",
            model: model,
            tokens_prompt: tokens.prompt_tokens,
            tokens_completion: tokens.completion_tokens,
            tokens_total: tokens.total_tokens,
            cost: totalCost,
            feature: feature
        });

    } catch (error) {
        console.error("Failed to track OpenAI usage:", error);
    }
}
