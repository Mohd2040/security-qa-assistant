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

/**
 * Generate AI suggestion with role categorization
 * Returns format: "Ask [Developer/Infrastructure/Management] for: [question]"
 */
export async function generateCategorizedSuggestion(question: string): Promise<string> {
  if (!isOpenAIEnabled()) return "";

  const prompt = `You are a cybersecurity expert. 

1. Categorize this question into ONE role:
   - Developer (if about: application, web, programming, development, code, SDLC, software)
   - Infrastructure (if about: cloud, network, DevOps, servers, deployment, infrastructure, hosting)
   - Management (if about: policies, governance, compliance, or anything else)

2. Rephrase the question as a clear, professional question to ask that role.

Question: "${question}"

Return ONLY in this format:
Ask [Role] for: [rephrased question as a clear question]

Example: "Ask Developer for: Do you implement input validation in all user-facing forms?"`;

  try {
    const client = getOpenAIClient();
    if (!client) return "";

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
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

function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

/**
 * Cross-Encoder Re-ranking: Re-rank results using AI semantic similarity
 */
export async function reRankWithCrossEncoder(
  question: string,
  candidates: Array<{ question: string; score: number }>
): Promise<Array<{ index: number; score: number }>> {
  if (!isOpenAIEnabled() || candidates.length === 0) {
    return candidates.map((_, i) => ({ index: i, score: _.score }));
  }

  const prompt = `Rate the semantic similarity (0-100) between the query and each candidate question. Consider same intent, scope, and context.

Query: "${question}"

Candidates:
${candidates.map((c, i) => `${i + 1}. "${c.question}"`).join('\n')}

Return ONLY a JSON array of numbers: [score1, score2, ...]`;

  try {
    const client = getOpenAIClient();
    if (!client) return candidates.map((_, i) => ({ index: i, score: _.score }));

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "[]";
    const scores = JSON.parse(cleanJsonResponse(response));

    return candidates.map((c, i) => ({
      index: i,
      score: (scores[i] || 0) / 100
    })).sort((a, b) => b.score - a.score);
  } catch (e) {
    console.error("Cross-Encoder error:", e);
    return candidates.map((_, i) => ({ index: i, score: _.score }));
  }
}

/**
 * Auto-Tagging: Assign relevant tags to a question
 */
export async function autoTagQuestion(question: string): Promise<string[]> {
  if (!isOpenAIEnabled()) return [];

  const prompt = `Assign up to 3 relevant tags from this list:
[Access Control, Encryption, Network Security, Compliance, Data Protection, Incident Response, Cloud Security, Application Security, Physical Security, Risk Management]

Question: "${question}"

Return ONLY comma-separated tags, nothing else.`;

  try {
    const client = getOpenAIClient();
    if (!client) return [];

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";
    return response.split(',').map(t => t.trim()).filter(Boolean);
  } catch (e) {
    console.error("Auto-Tagging error:", e);
    return [];
  }
}

/**
 * Assess question difficulty and priority
 */
export async function assessQuestionDifficulty(question: string): Promise<{
  importance: number;
  complexity: number;
}> {
  if (!isOpenAIEnabled()) return { importance: 5, complexity: 5 };

  const prompt = `Rate this security question on two scales (1-10):
Question: "${question}"

Return ONLY JSON: {"importance": X, "complexity": Y}`;

  try {
    const client = getOpenAIClient();
    if (!client) return { importance: 5, complexity: 5 };

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "{}";
    const assessment = JSON.parse(cleanJsonResponse(response));

    return {
      importance: assessment.importance || 5,
      complexity: assessment.complexity || 5
    };
  } catch (e) {
    console.error("Difficulty Assessment error:", e);
    return { importance: 5, complexity: 5 };
  }
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
