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
  | "process"
  | "strategy"
  | "management"
  | "operations"
  | "governance"
  | "other";

export type OwnerGroup =
  | "dev"
  | "infra"
  | "ops"
  | "management"
  | "security"
  | "other";

export interface QaEntry {
  _id?: string;

  // النصوص الأساسية
  question_text: string;
  question_text_en?: string;
  question_language: "ar" | "en" | "mixed";

  answer_text: string;
  answer_language: "ar" | "en" | "mixed";

  // حالة التطبيق والتصنيف العام
  status: QaStatus;
  domain: QaDomain;

  // تصنيفات إضافية
  category?: string;          // لو حاب تستخدمها لشيء خاص
  owner_group?: OwnerGroup;   // Dev / Infra / Ops / Management / Security / Other
  security_area?: string;     // التصنيف الداخلي الموحد (Access Management, Cryptography, ...)
  client_category?: string;   // التصنيف كما وصل من الكلينت

  // معلومات المصدر
  is_from_file?: boolean;
  source_file?: string;
  source_ref?: string;

  // أسئلة إضافية
  needs_dev_input?: boolean;
  needs_infra_input?: boolean;

  // شرح وتعليم
  explanation_ar?: string;
  dev_questions?: string[];
  infra_questions?: string[];

  created_at?: string;
  updated_at?: string;

  client_name?: string;
}
