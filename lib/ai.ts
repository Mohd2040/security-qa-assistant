// lib/ai.ts
// طبقة واحدة مسئولة عن الذكاء الصناعي (OpenAI أو Ollama)

import OpenAI from "openai";

export type AiProvider = "openai" | "ollama" | "none";

// تحديد الـ provider تلقائياً حسب المتوفر
function detectProvider(): AiProvider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.AI_PROVIDER === "ollama") return "ollama";
  return "none";
}

const AI_PROVIDER: AiProvider = detectProvider();

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL_TEXT =
  process.env.OLLAMA_MODEL_TEXT || "llama3.1"; // نموذج توليد النص
const OLLAMA_MODEL_EMBED =
  process.env.OLLAMA_MODEL_EMBED || "nomic-embed-text"; // نموذج embeddings

// OpenAI Client (lazy initialization)
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

interface ExplanationInput {
  question: string;
  answer?: string;
}

/**
 * توليد شرح عربي مختصر للضابط الأمني
 */
export async function generateArabicExplanation(
  input: ExplanationInput
): Promise<string> {
  if (!isAiEnabled()) return "";

  const { question, answer } = input;
  const prompt = `
أنت خبير أمن معلومات، اشرح الضابط الأمني التالي باللغة العربية الفصحى، بطريقة مبسطة ومختصرة (سطرين إلى ثلاثة أسطر فقط).

السؤال (عن الضابط الأمني):
${question}

${answer ? `الإجابة/الوصف الفني:\n${answer}\n` : ""}

أعد صياغة الفكرة في شرح عربي بسيط موجه لمهندس غير خبير سيكوريتي.
`;

  try {
    if (AI_PROVIDER === "openai") {
      const client = getOpenAIClient();
      if (!client) return "";

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
      });

      return (completion.choices[0]?.message?.content || "").trim();
    }

    // Ollama fallback
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL_TEXT,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("Ollama generate error:", await response.text());
      return "";
    }

    const data = (await response.json()) as { response?: string };
    const text = (data.response || "").trim();
    return text.replace(/\n{2,}/g, "\n").trim();
  } catch (e) {
    console.error("AI generation error:", e);
    return "";
  }
}

/**
 * توليد Embedding (Vector) للنص
 */
export async function getEmbeddingVector(
  text: string
): Promise<number[] | null> {
  if (!isAiEnabled()) return null;

  const clean = text.trim();
  if (!clean) return null;

  try {
    if (AI_PROVIDER === "openai") {
      const client = getOpenAIClient();
      if (!client) return null;

      const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: clean,
      });

      return res.data[0].embedding as unknown as number[];
    }

    // Ollama fallback
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL_EMBED,
        prompt: clean,
      }),
    });

    if (!response.ok) {
      console.error("Ollama embeddings error:", await response.text());
      return null;
    }

    const data = (await response.json()) as { embedding?: number[] };
    if (!data.embedding || !Array.isArray(data.embedding)) return null;
    return data.embedding;
  } catch (e) {
    console.error("Embedding generation error:", e);
    return null;
  }
}

/**
 * توليد إجابة مقترحة للسؤال باستخدام الذكاء الصناعي
 */
export async function generateAnswer(question: string): Promise<string> {
  if (!isAiEnabled()) return "";

  const prompt = `
أنت خبير أمن معلومات ومستشار امتثال (GRC).
مطلوب منك الإجابة على السؤال الأمني التالي بشكل مهني ومختصر (فقرة واحدة).
استخدم المصطلحات الأمنية الصحيحة (NIST, ISO 27001).

السؤال:
${question}

الإجابة المقترحة:
`;

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
      body: JSON.stringify({
        model: OLLAMA_MODEL_TEXT,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("Ollama generate answer error:", await response.text());
      return "";
    }

    const data = (await response.json()) as { response?: string };
    return (data.response || "").trim();
  } catch (e) {
    console.error("AI connection error:", e);
    return "";
  }
}

/**
 * توسيع الاستعلام - إيجاد مصطلحات مترادفة ومشابهة
 * @param query النص الأصلي
 * @returns قائمة من المصطلحات المترادفة والمشابهة
 */
export async function expandQuery(query: string): Promise<string[]> {
  if (!isOpenAIEnabled()) return [query];

  const clean = query.trim();
  if (!clean) return [];

  try {
    const client = getOpenAIClient();
    if (!client) return [query];

    const prompt = `Given this cybersecurity query: "${clean}"

Return a JSON array of 3-5 related terms/synonyms that could help find relevant results.
Focus on:
- Technical synonyms (e.g., "encryption" → "cryptography", "cipher")
- Arabic equivalents if applicable
- Related concepts

Return ONLY a valid JSON array of strings, no explanation.
Example: ["encryption", "cryptography", "cipher", "تشفير"]`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = completion.choices[0]?.message?.content || "[]";

    // Parse JSON response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const terms = JSON.parse(match[0]) as string[];
      // دائماً نرجع الاستعلام الأصلي + المترادفات
      return [query, ...terms.filter(t => t !== query)];
    }

    return [query];
  } catch (e) {
    console.error("Query expansion error:", e);
    return [query];
  }
}

/**
 * تحليل التشابه الدلالي بين سؤالين
 * @returns رقم بين 0 و 1
 */
export async function analyzeQuestionSimilarity(
  q1: string,
  q2: string
): Promise<number> {
  if (!isOpenAIEnabled()) return 0;

  try {
    const client = getOpenAIClient();
    if (!client) return 0;

    const prompt = `Rate the semantic similarity between these two cybersecurity questions on a scale of 0 to 1:

Question 1: "${q1}"
Question 2: "${q2}"

Return ONLY a number between 0 and 1 (e.g., 0.85). No explanation.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 10,
    });

    const content = completion.choices[0]?.message?.content || "0";
    const score = parseFloat(content.trim());

    if (!isNaN(score) && score >= 0 && score <= 1) {
      return score;
    }
    return 0;
  } catch (e) {
    console.error("Similarity analysis error:", e);
    return 0;
  }
}
