// lib/embeddings.ts
import OpenAI from "openai";
import { getEmbeddingCache, logCacheStats } from "./embedding-cache";

type AiProvider = "openai" | "ollama" | "none";

// Auto-detect provider (prioritize explicit AI_PROVIDER setting)
function detectProvider(): AiProvider {
  // If user explicitly set AI_PROVIDER, use it
  if (process.env.AI_PROVIDER === "ollama") return "ollama";
  if (process.env.AI_PROVIDER === "openai") return "openai";

  // Otherwise, auto-detect based on available keys
  if (process.env.OPENAI_API_KEY) return "openai";

  return "none";
}

const AI_PROVIDER = detectProvider();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL_EMBED = process.env.OLLAMA_MODEL_EMBED || "nomic-embed-text";

const apiKey = process.env.OPENAI_API_KEY;
let client: OpenAI | null = null;

if (apiKey) {
  client = new OpenAI({ apiKey });
  console.log("✅ Using OpenAI for AI features");
} else if (AI_PROVIDER === "ollama") {
  console.log(`✅ Using Ollama (${OLLAMA_BASE_URL}) for AI features`);
  console.log(`   Models: ${OLLAMA_MODEL_EMBED} (embeddings), llama3.1 (text)`);
} else {
  console.warn("⚠️  No AI provider configured. AI features disabled.");
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

  // Generate embedding based on provider
  try {
    let embedding: number[] | null = null;

    if (AI_PROVIDER === "openai" && client) {
      // OpenAI
      const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: cleaned,
      });
      embedding = res.data[0].embedding as unknown as number[];
    } else if (AI_PROVIDER === "ollama") {
      // Ollama
      const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL_EMBED,
          prompt: cleaned,
        }),
      });

      if (!response.ok) {
        console.error("Ollama embeddings error:", await response.text());
        return null;
      }

      const data = (await response.json()) as { embedding?: number[] };
      if (!data.embedding || !Array.isArray(data.embedding)) return null;
      embedding = data.embedding;
    } else {
      // No provider available
      return null;
    }

    // Save to cache for future use
    if (embedding) {
      cache.set(cleaned, embedding);
    }

    return embedding;
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
