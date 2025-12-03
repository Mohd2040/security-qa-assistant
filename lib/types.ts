// lib/types.ts

export type QaStatus =
  | "applied"
  | "not_applied"
  | "not_applicable"
  | "unknown";

export type QaDomain =
  | "application"
  | "database"
  | "network"
  | "cloud"
  | "process";

export interface QaEntry {
  _id?: string; // سنحوّله من ObjectId إلى string في الـ API
  question_text: string;        // السؤال (ممكن عربي)
  question_text_en?: string;    // السؤال بالإنجليزي إذا متوفر
  question_language: "ar" | "en" | "mixed";

  answer_text: string;          // الإجابة المعتمدة (غالبًا إنجليزي)
  answer_language: "ar" | "en" | "mixed";

  status: QaStatus;
  domain: QaDomain;
  category?: string;            // مثل: authentication, encryption, logging...

  is_from_file?: boolean;
  source_file?: string;
  source_ref?: string;

  needs_dev_input?: boolean;
  needs_infra_input?: boolean;

  explanation_ar?: string;      // الشرح المبسط بالعربي
  dev_questions?: string[];
  infra_questions?: string[];

  created_at?: string;
  updated_at?: string;
}
