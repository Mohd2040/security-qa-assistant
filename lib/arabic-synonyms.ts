// lib/arabic-synonyms.ts
/**
 * Arabic synonyms dictionary for security and technical terms
 * Used to expand queries and improve matching
 */

export interface SynonymGroup {
    primary: string;
    synonyms: string[];
}

/**
 * Security and technical terms synonyms (Arabic and English)
 */
export const SECURITY_SYNONYMS: Record<string, string[]> = {
    // Security terms
    'أمن': ['حماية', 'وقاية', 'أمان', 'سلامة', 'security'],
    'حماية': ['أمن', 'wقاية', 'حفظ', 'protection'],
    'اختراق': ['هجوم', 'penetration', 'attack', 'cyber attack'],
    'هجوم': ['اختراق', 'attack', 'تهديد'],

    // Authentication & Access
    'مصادقة': ['استيثاق', 'توثيق', 'authentication', 'تحقق'],
    'تحقق': ['توثيق', 'مصادقة', 'verification', 'validation'],
    'صلاحيات': ['أذونات', 'permissions', 'rights', 'privileges'],
    'دخول': ['وصول', 'access', 'login', 'تسجيل دخول'],

    // Data & Information
    'بيانات': ['معلومات', 'data', 'information'],
    'معلومات': ['بيانات', 'data', 'information'],
    'تشفير': ['encryption', 'ترميز', 'coding'],
    'احتياطي': ['backup', 'نسخ احتياطي', 'استعادة'],

    // Testing & Assessment
    'اختبار': ['فحص', 'test', 'testing', 'تقييم'],
    'فحص': ['اختبار', 'test', 'inspection', 'مراجعة'],
    'تقييم': ['تقويم', 'assessment', 'evaluation', 'قياس'],
    'مراجعة': ['فحص', 'review', 'audit', 'تدقيق'],

    // Network & Infrastructure
    'شبكة': ['network', 'نت'],
    'خادم': ['سيرفر', 'server', 'مزود'],
    'جدار ناري': ['firewall', 'جدار حماية'],

    // Compliance & Standards
    'امتثال': ['التزام', 'compliance', 'conformity'],
    'معيار': ['standard', 'قياس', 'مقياس'],
    'سياسة': ['policy', 'نظام', 'لائحة'],
    'إجراء': ['procedure', 'عملية', 'process'],

    // Threats & Risks
    'خطر': ['تهديد', 'risk', 'threat', 'مخاطر'],
    'تهديد': ['خطر', 'threat', 'danger'],
    'ثغرة': ['vulnerability', 'نقطة ضعف', 'عيب'],
    'برمجية خبيثة': ['malware', 'فيروس', 'برامج ضارة'],

    // Incident & Response
    'حادث': ['incident', 'حدث', 'واقعة'],
    'استجابة': ['response', 'رد', 'تعامل'],
    'طوارئ': ['emergency', 'حالة طارئة'],

    // English to Arabic
    'security': ['أمن', 'حماية', 'أمان'],
    'protection': ['حماية', 'وقاية'],
    'authentication': ['مصادقة', 'استيثاق', 'توثيق'],
    'authorization': ['تفويض', 'صلاحيات'],
    'encryption': ['تشفير', 'ترميز'],
    'backup': ['احتياطي', 'نسخ احتياطي'],
    'firewall': ['جدار ناري', 'جدار حماية'],
    'vulnerability': ['ثغرة', 'نقطة ضعف'],
    'malware': ['برمجية خبيثة', 'برامج ضارة'],
    'penetration': ['اختراق', 'penetration testing'],
    'compliance': ['امتثال', 'التزام'],
    'policy': ['سياسة', 'نظام'],
    'risk': ['خطر', 'مخاطر'],
    'threat': ['تهديد', 'خطر'],
    'incident': ['حادث', 'حدث'],
};

/**
 * Get synonyms for a word
 */
export function getSynonyms(word: string): string[] {
    const normalized = word.trim().toLowerCase();
    return SECURITY_SYNONYMS[normalized] || [];
}

/**
 * Check if a word has synonyms
 */
export function hasSynonyms(word: string): boolean {
    const normalized = word.trim().toLowerCase();
    return normalized in SECURITY_SYNONYMS;
}

/**
 * Get all related terms (word + its synonyms)
 */
export function getRelatedTerms(word: string): string[] {
    const normalized = word.trim().toLowerCase();
    const synonyms = getSynonyms(normalized);
    return [normalized, ...synonyms];
}
