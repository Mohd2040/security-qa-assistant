// lib/ai.ts
// طبقة واحدة مسئولة عن الذكاء الصناعي (Ollama الآن، وممكن OpenAI لاحقًا)

export type AiProvider = "ollama" | "none";

const AI_PROVIDER: AiProvider =
  process.env.AI_PROVIDER === "ollama" ? "ollama" : "none";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL_TEXT =
  process.env.OLLAMA_MODEL_TEXT || "llama3.1"; // نموذج توليد النص
const OLLAMA_MODEL_EMBED =
  process.env.OLLAMA_MODEL_EMBED || "nomic-embed-text"; // نموذج embeddings

export function isAiEnabled(): boolean {
  return AI_PROVIDER === "ollama";
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

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // stream: false = نرجع رد واحد جاهز، بدون ستريم
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

  // نرجّع النص بدون فواصل زيادة
  return text.replace(/\n{2,}/g, "\n").trim();
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

  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.error("Ollama connection error:", e);
    return "";
  }
}
