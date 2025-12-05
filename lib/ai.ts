// lib/ai.ts
import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

/**
 * توليد شرح مختصر بالعربي للضابط الأمني.
 * يستخدم السؤال + الإجابة (لو موجودة) ويعطيك ملخص تعليمي بسيط.
 */
export async function generateArabicExplanation(
  question: string,
  answer: string
): Promise<string> {
  const c = getClient();
  if (!c) return ""; // لو ما في مفتاح، لا شيء

  const prompt = `
أنت خبير أمن معلومات. سأعطيك ضابط أمني (سؤال من استبيان سيكوريتي) مع الإجابة الفنية بالإنجليزية.
مطلوب منك أن تكتب شرحًا قصيرًا جدًا بالعربية (سطرين تقريبًا) يوضح:

- ما هو هذا الضابط؟
- لماذا نستخدمه؟ (الفائدة الأساسية)
- بدون تفاصيل تقنية عميقة، وبأسلوب بسيط ومفهوم.

السؤال (الضابط):
${question}

الإجابة (مختصرة، إن وجدت):
${answer || "لا توجد إجابة تقنية متوفرة حالياً."}

اكتب فقط الشرح بالعربية بدون أي إضافات أخرى.
`.trim();

  const completion = await c.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    messages: [
      { role: "system", content: "أنت خبير أمن معلومات تشرح بالعربية ببساطة ووضوح." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const text =
    completion.choices[0]?.message?.content?.trim() ||
    "";
  return text;
}
