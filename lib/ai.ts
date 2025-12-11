// lib/ai.ts
import OpenAI from "openai";

export type AiProvider = "openai" | "ollama" | "none";

function detectProvider(): AiProvider {
  if (process.env.AI_PROVIDER === "ollama") return "ollama";
  if (process.env.AI_PROVIDER === "openai") return "openai";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}

const AI_PROVIDER: AiProvider = detectProvider();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL_TEXT = process.env.OLLAMA_MODEL_TEXT || "llama3.1";

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
  if (!isAiEnabled()) return "";

  const prompt = `You are a cybersecurity expert. Answer this question professionally:\n\n${question}\n\nAnswer:`;

  try {
    if (AI_PROVIDER === "openai") {
      const client = getOpenAIClient();
      if (!client) return "";
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });
      return (completion.choices[0]?.message?.content || "").trim();
    }

    // Ollama fallback
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL_TEXT, prompt, stream: false }),
    });

    if (!response.ok) return "";
    const data = (await response.json()) as { response?: string };
    return (data.response || "").trim();
  } catch (e) {
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
      model: "gpt-4o-mini",
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

