// lib/embeddings.ts
import OpenAI from "openai";
import { getEmbeddingCache, logCacheStats } from "./embedding-cache";

const apiKey = process.env.OPENAI_API_KEY;

let client: OpenAI | null = null;

if (apiKey) {
  client = new OpenAI({ apiKey });
  console.log("[embeddings] OpenAI client initialized");
} else {
  console.log("[embeddings] OPENAI_API_KEY not set. Semantic search is disabled.");
}

export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!client) return null;

  const cleaned = text.trim();
  if (!cleaned) return null;

  // Try to get from cache first
  const cache = getEmbeddingCache();
  const cachedEmbedding = cache.get(cleaned);

  if (cachedEmbedding) {
    return cachedEmbedding;
  }

  // If not in cache, call API
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: cleaned,
  });

  const embedding = res.data[0].embedding as unknown as number[];

  // Save to cache for future use
  cache.set(cleaned, embedding);

  return embedding;
}

/**
 * Log cache statistics (useful for debugging/monitoring)
 */
export function logEmbeddingCacheStats(): void {
  logCacheStats();
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
