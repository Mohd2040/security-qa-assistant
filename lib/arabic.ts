// lib/arabic.ts
import { stemArabicText } from "./arabic-stemmer";

/**
 * Normalize Arabic text to improve search:
 * - remove diacritics
 * - unify Alef / Ya / Taa marbouta
 * - remove extra punctuation
 * - optionally apply stemming
 */
export function normalizeArabic(text: string, applyStemming: boolean = true): string {
  if (!text) return "";

  let normalized = text
    .normalize("NFKD")
    .replace(/[ًٌٍَُِّْ]+/g, "") // إزالة التشكيل
    .replace(/[أإآٱ]/g, "ا") // توحيد الألف
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Apply stemming if requested
  if (applyStemming) {
    normalized = stemArabicText(normalized);
  }

  return normalized;
}

/**
 * Detect if the query contains Arabic characters.
 */
export function looksArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}
