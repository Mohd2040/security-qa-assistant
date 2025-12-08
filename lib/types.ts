export type QaStatus = 'applied' | 'not_applied' | "not_applicable"| 'unknown';
export type QaDomain = 'application' | 'network' | 'database' | 'cloud';

export interface QaEntry {
  _id?: string;
  question_text: string;
  question_text_en?: string;
  question_text_ar?: string; // New field for Arabic translation
  question_language?: 'ar' | 'en';
  answer_text?: string;
  answer_language?: 'ar' | 'en';
  status: QaStatus;
  domain: QaDomain;
  owner_group?: string;
  explanation_ar?: string;
  source_file?: string;
  source_ref?: string;
  created_at?: string;
  updated_at?: string;
  client_name?: string;
  needs_dev_input?: boolean;
  needs_infra_input?: boolean;
  score?: number; // Search relevance score
}

export interface SearchFilters {
  status?: QaStatus | 'all';
  domain?: string | 'all';
  owner_group?: string;
  dateFrom?: string;
  dateTo?: string;
  source_file?: string;
}
