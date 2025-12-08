// lib/types.ts
import type { ObjectId } from "mongodb";

// جميع الحالات المتاحة لحالة الضابط الأمني
export const QA_STATUS_VALUES = [
  "applied",
  "not_applied",
  "not_applicable",
  "unknown",
] as const;
export type QaStatus = (typeof QA_STATUS_VALUES)[number];

// جميع التصنيفات (Domains) اللي نستخدمها في النظام
export const QA_DOMAIN_VALUES = [
  "application",
  "database",
  "network",
  "cloud",
  "process",
  "strategy",
  "management",
  "operations",
  "governance",
  "other",
] as const;
export type QaDomain = (typeof QA_DOMAIN_VALUES)[number];

// الجهة المسؤولة عن الضابط (Dev / Infra / Ops / Management / Security ...)
export const OWNER_GROUP_VALUES = [
  "dev",
  "infra",
  "ops",
  "management",
  "security",
  "other",
] as const;
export type OwnerGroup = (typeof OWNER_GROUP_VALUES)[number];

// الشكل الموحد للـ Q&A داخل النظام
export interface QaEntry {
  _id?: ObjectId;

  // السؤال
  question_text: string;
  question_text_en?: string;
  question_language?: "ar" | "en";

  // الجواب
  answer_text: string;
  answer_language?: "ar" | "en";

  // الحالة والتصنيف
  status: QaStatus;
  domain: QaDomain;
  owner_group?: OwnerGroup;

  // التصنيفات الإضافية
  category?: string | null;
  security_area?: string | null;
  client_category?: string | null;

  // معلومات المصدر
  is_from_file?: boolean;
  source_file?: string | null;
  source_ref?: string | null;

  // فلاغز إضافية
  needs_dev_input?: boolean;
  needs_infra_input?: boolean;

  // شرح بالعربي
  explanation_ar?: string;

  // أسئلة موجهة للديف والانفرا
  dev_questions?: string[];
  infra_questions?: string[];

  // تواريخ
  created_at?: string;
  updated_at?: string;

  // Embedding للبحث الدلالي (اختياري)
  embedding?: number[];

  question_text_ar?: string;
  client_name?: string | null;
  score?: number;

}
