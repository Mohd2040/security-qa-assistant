// lib/ai.ts
import OpenAI from "openai";

export type AiProvider = "openai" | "none";

function detectProvider(): AiProvider {
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}

const AI_PROVIDER: AiProvider = detectProvider();
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export function isAiEnabled(): boolean {
  return AI_PROVIDER !== "none";
}

export function isOpenAIEnabled(): boolean {
  return AI_PROVIDER === "openai" && !!process.env.OPENAI_API_KEY;
}

export function getAiProvider(): AiProvider {
  return AI_PROVIDER;
}

export async function generateAnswer(question: string): Promise<string> {
  if (!isOpenAIEnabled()) return "";

  const prompt = `You are a cybersecurity expert. Answer this question professionally:\n\n${question}\n\nAnswer:`;

  try {
    const client = getOpenAIClient();
    if (!client) return "";

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    return (completion.choices[0]?.message?.content || "").trim();
  } catch (e) {
    console.error("OpenAI API error:", e);
    return "";
  }
}

export async function expandQuery(query: string): Promise<string[]> {
  return [query];
}

export async function analyzeQuestionSimilarity(q1: string, q2: string): Promise<number> {
  return 0;
}

// Analyze which domain/category a question belongs to
export async function analyzeQuestionDomain(question: string): Promise<string> {
  if (!isOpenAIEnabled()) return "General";

  try {
    const client = getOpenAIClient();
    if (!client) return "General";

    const prompt = `Analyze this cybersecurity question and classify it into ONE of these categories:
- Management (policies, governance, compliance, audits)
- Developer (secure coding, SDLC, code review)
- Infrastructure (network, servers, cloud, deployment)
- Identity (authentication, authorization, access control)
- Data (encryption, backup, privacy, DLP)
- Incident Response (monitoring, SOC, forensics)
- General (doesn't fit other categories)

Question: "${question}"

Return ONLY the category name, nothing else.`;

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 20,
    });

    const category = (completion.choices[0]?.message?.content || "General").trim();
    return category;
  } catch (e) {
    return "General";
  }
}

/**
 * Generate embeddings for questions (wrapper around getEmbedding from embeddings.ts)
 */
export async function getEmbeddingVector(text: string): Promise<number[] | null> {
  if (!isOpenAIEnabled()) return null;

  // Import dynamically to avoid circular dependency
  const { getEmbedding } = await import("./embeddings");
  return await getEmbedding(text);
}

/**
 * Generate Arabic explanation for a Q&A pair
 */
export async function generateArabicExplanation(params: {
  question: string;
  answer: string;
}): Promise<string | null> {
  if (!isOpenAIEnabled()) return null;

  const prompt = `أنت خبير أمن معلومات. اشرح السؤال والجواب التالي بالعربية بشكل مبسط:

السؤال: ${params.question}
الجواب: ${params.answer}

اكتب شرحاً واضحاً بالعربية (3-4 جمل):`;

  try {
    const client = getOpenAIClient();
    if (!client) return null;

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("Failed to generate Arabic explanation:", e);
    return null;
  }
}
