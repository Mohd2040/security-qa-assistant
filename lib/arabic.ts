// lib/arabic.ts
/**
 * Normalize Arabic text to improve search:
 * - remove diacritics
 * - unify Alef / Ya / Taa marbouta
 * - remove extra punctuation
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFKD")
    .replace(/[ًٌٍَُِّْ]+/g, "") // إزالة التشكيل
    .replace(/[أإآٱ]/g, "ا") // توحيد الألف
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect if the query contains Arabic characters.
 */
export function looksArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}
