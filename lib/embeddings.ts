// lib/embeddings.ts
import OpenAI from "openai";
import { getEmbeddingCache, logCacheStats } from "./embedding-cache";

type AiProvider = "openai" | "none";

function detectProvider(): AiProvider {
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}

const AI_PROVIDER = detectProvider();
const OPENAI_MODEL_EMBED = process.env.OPENAI_MODEL_EMBED || "text-embedding-3-small";

const apiKey = process.env.OPENAI_API_KEY;
let client: OpenAI | null = null;

if (apiKey) {
  client = new OpenAI({ apiKey });
  console.log("✅ Using OpenAI for AI features");
  console.log(`   Embedding Model: ${OPENAI_MODEL_EMBED}`);
} else {
  console.warn("⚠️  No OpenAI API key configured. AI features disabled.");
}

export async function getEmbedding(text: string): Promise<number[] | null> {
  const cleaned = text.trim();
  if (!cleaned) return null;

  // Try to get from cache first
  const cache = getEmbeddingCache();
  const cachedEmbedding = cache.get(cleaned);

  if (cachedEmbedding) {
    return cachedEmbedding;
  }

  // Generate embedding using OpenAI
  try {
    if (AI_PROVIDER === "openai" && client) {
      const res = await client.embeddings.create({
        model: OPENAI_MODEL_EMBED,
        input: cleaned,
      });
      const embedding = res.data[0].embedding as unknown as number[];

      // Save to cache for future use
      if (embedding) {
        cache.set(cleaned, embedding);
      }

      return embedding;
    }

    // No provider available
    return null;
  } catch (e) {
    // Silent fail
    return null;
  }
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
