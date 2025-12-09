"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: Direction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.search': 'Search Q&A',
        'nav.admin': 'Admin',
        'nav.add': 'Add Single',
        'nav.import': 'Bulk Import',
        'nav.prepare': 'Prepare Questions',

        // Home Page
        'home.title': 'Security Q&A Intelligence Hub',
        'home.subtitle': 'AI-Powered Security Knowledge Base for Modern Teams',
        'home.search.placeholder': 'Ask anything about security...',
        'home.search.title': 'Search Q&A',
        'home.search.description': 'Find answers with AI-powered semantic search',
        'home.add.title': 'Add Single Q&A',
        'home.add.description': 'Manually add or update security questions and answers',
        'home.import.title': 'Bulk Import',
        'home.import.description': 'Import multiple Q&A entries from Excel files',
        'home.prepare.title': 'Prepare Questions',
        'home.prepare.description': 'Generate Q&A templates from client questionnaires',

        // Stats
        'stats.total': 'Total Entries',
        'stats.applied': 'Applied',
        'stats.pending': 'Pending Review',
        'stats.domains': 'Security Domains',

        // Search Page
        'search.title': 'Search Security Q&A',
        'search.subtitle': 'Type a security question and find the closest approved answer',
        'search.button': 'Search',
        'search.searching': 'Searching...',
        'search.results': 'Results',
        'search.noResults': 'No results found',
        'search.filters': 'Filters',
        'search.clearFilters': 'Clear All',

        // Filters
        'filter.status': 'Status',
        'filter.domain': 'Domain',
        'filter.owner': 'Owner Group',
        'filter.dateFrom': 'From Date',
        'filter.dateTo': 'To Date',
        'filter.all': 'All',

        // Status
        'status.applied': 'Applied',
        'status.notApplied': 'Not Applied',
        'status.notApplicable': 'Not Applicable',
        'status.unknown': 'Unknown',

        // Actions
        'action.edit': 'Edit',
        'action.delete': 'Delete',
        'action.copy': 'Copy',
        'action.share': 'Share',
        'action.export': 'Export to Excel',
        'action.save': 'Save',
        'action.cancel': 'Cancel',

        // Footer
        'footer.rights': 'All rights reserved',
        'footer.poweredBy': 'Powered by',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error occurred',
        'common.success': 'Success',
        'common.confirm': 'Confirm',
        'common.close': 'Close',
    },
    ar: {
        // Navigation
        'nav.home': 'الرئيسية',
        'nav.search': 'البحث',
        'nav.admin': 'الإدارة',
        'nav.add': 'إضافة فردي',
        'nav.import': 'استيراد جماعي',
        'nav.prepare': 'تحضير الأسئلة',

        // Home Page
        'home.title': 'مركز استخبارات الأمن السيبراني',
        'home.subtitle': 'قاعدة معرفة أمنية مدعومة بالذكاء الاصطناعي للفرق الحديثة',
        'home.search.placeholder': 'اسأل أي شيء عن الأمن السيبراني...',
        'home.search.title': 'البحث في الأسئلة',
        'home.search.description': 'ابحث عن الإجابات باستخدام البحث الدلالي المدعوم بالذكاء الاصطناعي',
        'home.add.title': 'إضافة سؤال وجواب',
        'home.add.description': 'أضف أو حدّث الأسئلة والأجوبة الأمنية يدوياً',
        'home.import.title': 'الاستيراد الجماعي',
        'home.import.description': 'استورد عدة أسئلة وأجوبة من ملفات Excel',
        'home.prepare.title': 'تحضير الأسئلة',
        'home.prepare.description': 'أنشئ قوالب أسئلة وأجوبة من استبيانات العملاء',

        // Stats
        'stats.total': 'إجمالي الإدخالات',
        'stats.applied': 'مُطبّق',
        'stats.pending': 'قيد المراجعة',
        'stats.domains': 'المجالات الأمنية',

        // Search Page
        'search.title': 'البحث في الأسئلة الأمنية',
        'search.subtitle': 'اكتب سؤالاً أمنياً واعثر على أقرب إجابة معتمدة',
        'search.button': 'بحث',
        'search.searching': 'جارٍ البحث...',
        'search.results': 'النتائج',
        'search.noResults': 'لم يتم العثور على نتائج',
        'search.filters': 'الفلاتر',
        'search.clearFilters': 'مسح الكل',

        // Filters
        'filter.status': 'الحالة',
        'filter.domain': 'المجال',
        'filter.owner': 'المسؤول',
        'filter.dateFrom': 'من تاريخ',
        'filter.dateTo': 'إلى تاريخ',
        'filter.all': 'الكل',

        // Status
        'status.applied': 'مُطبّق',
        'status.notApplied': 'غير مُطبّق',
        'status.notApplicable': 'غير منطبق',
        'status.unknown': 'غير معروف',

        // Actions
        'action.edit': 'تعديل',
        'action.delete': 'حذف',
        'action.copy': 'نسخ',
        'action.share': 'مشاركة',
        'action.export': 'تصدير إلى Excel',
        'action.save': 'حفظ',
        'action.cancel': 'إلغاء',

        // Footer
        'footer.rights': 'جميع الحقوق محفوظة',
        'footer.poweredBy': 'مدعوم بواسطة',

        // Common
        'common.loading': 'جارٍ التحميل...',
        'common.error': 'حدث خطأ',
        'common.success': 'نجح',
        'common.confirm': 'تأكيد',
        'common.close': 'إغلاق',
    },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'en' || saved === 'ar')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations.en] || key;
    };

    const dir: Direction = language === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', language);
    }, [language, dir]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
