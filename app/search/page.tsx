"use client";

<<<<<<< HEAD
import { FormEvent, useEffect, useMemo, useState } from "react";
import { QaEntry } from "@/lib/types";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";

type UiLang = "en" | "ar";
type ThemeMode = "dark" | "light";

interface SearchResponse {
  matches: QaEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Suggestion {
  id: string;
  question_text: string;
  question_text_en?: string;
}

const STATUS_OPTIONS = [
  { value: "all", labelEn: "All statuses", labelAr: "كل الحالات" },
  { value: "applied", labelEn: "Applied", labelAr: "مطبق" },
  { value: "not_applied", labelEn: "Not applied", labelAr: "غير مطبق" },
  {
    value: "not_applicable",
    labelEn: "Not applicable",
    labelAr: "غير منطبق",
  },
  { value: "unknown", labelEn: "Unknown", labelAr: "غير معروف" },
];

const DOMAIN_OPTIONS = [
  { value: "all", labelEn: "All domains", labelAr: "كل التصنيفات" },
  { value: "application", labelEn: "Application", labelAr: "تطبيق" },
  { value: "database", labelEn: "Database", labelAr: "قاعدة بيانات" },
  { value: "network", labelEn: "Network", labelAr: "شبكة" },
  { value: "cloud", labelEn: "Cloud", labelAr: "سحابة" },
  { value: "process", labelEn: "Process", labelAr: "إجراءات" },
  { value: "strategy", labelEn: "Strategy", labelAr: "استراتيجية" },
  { value: "management", labelEn: "Management", labelAr: "إدارة" },
  { value: "operations", labelEn: "Operations", labelAr: "تشغيل" },
  { value: "governance", labelEn: "Governance", labelAr: "حوكمة" },
  { value: "other", labelEn: "Other", labelAr: "أخرى" },
];

const OWNER_OPTIONS = [
  { value: "all", labelEn: "All owners", labelAr: "كل المسؤولين" },
  { value: "dev", labelEn: "Developers", labelAr: "فريق التطوير" },
  { value: "infra", labelEn: "Infrastructure", labelAr: "الإنفراستركشر" },
  { value: "ops", labelEn: "Operations", labelAr: "التشغيل (Ops)" },
  { value: "management", labelEn: "Management", labelAr: "الإدارة" },
  { value: "security", labelEn: "Security", labelAr: "أمن المعلومات" },
  { value: "other", labelEn: "Other", labelAr: "أخرى" },
];

function getStatusChipClasses(status: string, isDark: boolean): string {
  const base = "px-2 py-1 rounded-full border text-[11px]";
  switch (status) {
    case "applied":
      return (
        base +
        (isDark
          ? " bg-emerald-900/70 border-emerald-500 text-emerald-200"
          : " bg-emerald-50 border-emerald-500 text-emerald-700")
      );
    case "not_applied":
      return (
        base +
        (isDark
          ? " bg-red-900/70 border-red-500 text-red-200"
          : " bg-red-50 border-red-500 text-red-700")
      );
    case "unknown":
      return (
        base +
        (isDark
          ? " bg-yellow-900/70 border-yellow-500 text-yellow-200"
          : " bg-yellow-50 border-yellow-500 text-yellow-700")
      );
    case "not_applicable":
    default:
      return (
        base +
        (isDark
          ? " bg-slate-800 border-slate-500 text-slate-200"
          : " bg-slate-100 border-slate-400 text-slate-700")
      );
  }
}
=======
import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Search,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Database,
  Server,
  Code,
  Info,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Save,
  Languages,
  ArrowRightLeft,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { QaEntry, QaStatus, QaDomain } from "@/lib/types";
>>>>>>> devops3

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [translatedItems, setTranslatedItems] = useState<Set<string>>(
    new Set()
  );

  // Translation State
  const [translatingQuery, setTranslatingQuery] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  // Edit State
  const [editingItem, setEditingItem] = useState<QaEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<QaStatus | "all">("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Search Function
  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!query.trim() && statusFilter === "all" && domainFilter === "all")
        return;

      setLoading(true);
      setError(null);
      setHasSearched(true);
      setExpandedItems(new Set());
      setTranslatedItems(new Set());

      try {
        const res = await fetch("/api/qa/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            status: statusFilter,
            domain: domainFilter,
            page: 1,
            pageSize: 50,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to search");
        }

        setResults(data.matches || []);
      } catch (err: any) {
        console.error(err);
        setError("An error occurred while searching. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, statusFilter, domainFilter]
  );

  // Auto-search when filters change
  useEffect(() => {
    if (hasSearched || statusFilter !== "all" || domainFilter !== "all") {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, domainFilter, handleSearch, hasSearched]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleTranslateQuery = async () => {
    if (!query.trim()) return;
    setTranslatingQuery(true);
    try {
      // Detect if query is Arabic (simple check)
      const isArabic = /[\u0600-\u06FF]/.test(query);
      const targetLang = isArabic ? "en" : "ar";

      const res = await fetch("/api/qa/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query, targetLang }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      if (data.translatedText) {
        setQuery(data.translatedText);
      }
    } catch (err: any) {
      console.error("Translation failed", err);
      setToast({
        message: `Translation failed: ${err.message}`,
        type: "error",
      });
    } finally {
      setTranslatingQuery(false);
    }
  };

  const toggleTranslateResult = async (item: QaEntry) => {
    // حوّل _id دائماً إلى string للاستخدام في Sets
    const id = String(item._id ?? "");
    if (!id) return;

    // If already showing translation, hide it
    if (translatedItems.has(id)) {
      const newTranslated = new Set(translatedItems);
      newTranslated.delete(id);
      setTranslatedItems(newTranslated);
      return;
    }

    // Determine original language
    const originalIsArabic = /[\u0600-\u06FF]/.test(item.question_text);

    // English Text Source:
    const englishText =
      item.question_text_en ||
      (originalIsArabic ? undefined : item.question_text);

    // Arabic Text Source:
    const arabicText =
      (item as any).question_text_ar ||
      (originalIsArabic ? item.question_text : undefined);

    let targetLang: "ar" | "en" | null = null;

    if (englishText && !arabicText) {
      // We have English, but missing Arabic. Fetch Arabic.
      targetLang = "ar";
    } else if (arabicText && !englishText) {
      // We have Arabic, but missing English. Fetch English.
      targetLang = "en";
    }

    // If we have both, or can't determine, just mark as translated
    if (!targetLang) {
      const newTranslated = new Set(translatedItems);
      newTranslated.add(id);
      setTranslatedItems(newTranslated);
      return;
    }

    // Perform Fetch
    console.log(`Translating item ${id} to ${targetLang}`);
    setTranslatingIds((prev) => new Set(prev).add(id));

    try {
      const res = await fetch("/api/qa/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: item.question_text,
          targetLang,
          qaId: id,
        }),
      });

      const data = await res.json();
      console.log("Translation response:", data);

      if (!res.ok) throw new Error(data.error || "Translation failed");

      if (data.translatedText) {
        // Update local result
        setResults((prev) =>
          prev.map((r) => {
            const rid = String(r._id ?? "");
            if (rid === id) {
              if (targetLang === "en") {
                return { ...r, question_text_en: data.translatedText };
              } else {
                return { ...(r as any), question_text_ar: data.translatedText };
              }
            }
            return r;
          })
        );

        const newTranslated = new Set(translatedItems);
        newTranslated.add(id);
        setTranslatedItems(newTranslated);
        setToast({ message: "Translation complete", type: "success" });
      } else {
        throw new Error("Empty translation received");
      }
    } catch (err: any) {
      console.error("Result translation failed", err);
      setToast({
        message: `Translation failed: ${err.message}`,
        type: "error",
      });
    } finally {
      setTranslatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const openEditModal = (item: QaEntry) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      // Ensure question_text is set: English first, then Arabic
      const itemToSave = {
        ...editingItem,
        question_text: editingItem.question_text_en || (editingItem as any).question_text_ar || editingItem.question_text,
      };

      const res = await fetch("/api/qa/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToSave),
      });

      if (!res.ok) throw new Error("Failed to update");

      setResults((prev) =>
        prev.map((item) =>
          String(item._id ?? "") === String(editingItem._id ?? "")
            ? itemToSave
            : item
        )
      );
      setIsEditModalOpen(false);
      setEditingItem(null);
      setToast({ message: "Changes saved successfully", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save changes", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
<<<<<<< HEAD
    <>
      <Navbar />
      <main
        className={`min-h-screen ${mainBgClass} flex flex-col items-center px-4 py-8`}
      >
        <div className="w-full max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {isArabic ? "البحث في أسئلة السيكوريتي" : "Search Security Q&A"}
              </h1>
              <p className="text-slate-300 mt-1 text-sm md:text-base">
                {isArabic
                  ? "اكتب سؤال سيكوريتي وحدد الفلاتر، ثم يمكنك تعديل الحالات (فرديًا أو جماعيًا) وتصدير النتائج إلى Excel."
                  : "Type a security-related question, adjust filters, then update statuses (single or bulk) and export results to Excel."}
              </p>
              {recentQueries.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {isArabic ? "آخر عمليات بحث: " : "Recent searches: "}
                  {recentQueries.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuery(q)}
                      className="underline mr-2"
                    >
                      {q}
                    </button>
                  ))}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition-colors"
              >
                <span>{isDark ? "☀️" : "🌙"}</span>
                <span className="opacity-80">
                  {isDark
                    ? isArabic
                      ? "وضع فاتح"
                      : "Light mode"
                    : isArabic
                      ? "وضع داكن"
                      : "Dark mode"}
                </span>
              </button>

              {/* Lang toggle */}
              <button
                type="button"
                onClick={() => setUiLang(isArabic ? "en" : "ar")}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition-colors"
              >
                <span>{isArabic ? "EN" : "AR"}</span>
                <span className="opacity-70">
                  {isArabic ? "Switch to English" : "تبديل إلى العربية"}
                </span>
              </button>
            </div>
          </div>

          {/* Search & filters */}
          <form
            onSubmit={handleSubmit}
            className={`rounded-xl border ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white"
              } p-4 space-y-4`}
          >
            <div className="relative">
              <textarea
                className={`w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${textareaBgClass
                  } ${isArabic ? "text-right" : "text-left"}`}
                rows={2}
                placeholder={
                  isArabic
                    ? "مثال: هل النظام يدعم قفل الحساب بعد عدد محاولات فاشلة؟"
                    : "Example: Does the system support account lockout after several failed login attempts?"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute z-20 mt-1 w-full rounded-md border ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"
                    } max-h-56 overflow-auto text-xs`}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setQuery(s.question_text);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/60"
                    >
                      <div className={isArabic ? "text-right" : "text-left"}>
                        <div className="font-medium">{s.question_text}</div>
                        {s.question_text_en && s.question_text_en !== s.question_text && (
                          <div className="text-slate-400">
                            EN: {s.question_text_en}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Basic filters */}
            <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "الحالة" : "Status"}
                </label>
                <select
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "التصنيف (Domain)" : "Domain"}
                </label>
                <select
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  {DOMAIN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "الجهة المسؤولة" : "Owner group"}
                </label>
                <select
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={ownerGroup}
                  onChange={(e) => setOwnerGroup(e.target.value)}
                >
                  {OWNER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced filters */}
            <div className="grid gap-3 md:grid-cols-4 text-xs md:text-sm">
              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "من تاريخ" : "From date"}
                </label>
                <input
                  type="date"
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "إلى تاريخ" : "To date"}
                </label>
                <input
                  type="date"
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "اسم الملف (source_file)" : "Source file"}
                </label>
                <input
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={sourceFile}
                  onChange={(e) => setSourceFile(e.target.value)}
                  placeholder={isArabic ? "مثال: eec1.xlsx" : "e.g. eec1.xlsx"}
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "اسم العميل (Client)" : "Client name"}
                </label>
                <input
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={isArabic ? "مثال: البنك الفلاني" : "e.g. Client XYZ"}
                />
              </div>
            </div>

            {/* Page size */}
            <div className="grid gap-3 md:grid-cols-4 text-xs md:text-sm">
              <div>
                <label className="block mb-1 text-slate-300">
                  {isArabic ? "عدد النتائج في الصفحة" : "Page size"}
                </label>
                <select
                  className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setPage(1);
                    performSearch(1, newSize);
                  }}
                >
                  {[25, 50, 100, 200].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-sm font-medium transition-colors"
              >
                {loading
                  ? isArabic
                    ? "جارٍ البحث..."
                    : "Searching..."
                  : isArabic
                    ? "ابحث"
                    : "Search"}
              </button>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>
                  {isArabic ? `عدد النتائج: ${total}` : `Results: ${total}`}
                </span>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={total === 0}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-medium transition-colors"
                >
                  {isArabic ? "تصدير إلى Excel" : "Export to Excel"}
                </button>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-3 text-xs text-slate-300 mt-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!canGoPrev() || loading}
                  className="px-2 py-1 rounded-md bg-slate-800 disabled:opacity-50"
                >
                  {isArabic ? "السابق" : "Previous"}
                </button>
                <span>
                  {isArabic
                    ? `الصفحة ${page} من ${totalPages}`
                    : `Page ${page} of ${totalPages}`}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext() || loading}
                  className="px-2 py-1 rounded-md bg-slate-800 disabled:opacity-50"
                >
                  {isArabic ? "التالي" : "Next"}
                </button>
              </div>
            )}
          </form>

          {error && (
            <div className="mb-4 rounded-md bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {loading && matches.length === 0 && (
            <div className="space-y-3">
              {skeletonCard}
              {skeletonCard}
            </div>
          )}

          {matches.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-300">
                  {isArabic ? "تحديد جماعي:" : "Bulk selection:"}
                </span>
                <button
                  type="button"
                  onClick={selectAllOnPage}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700"
                >
                  {isArabic ? "تحديد الكل في هذه الصفحة" : "Select all on page"}
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700"
                >
                  {isArabic ? "إلغاء التحديد" : "Clear selection"}
                </button>
                <span className="text-slate-400">
                  {isArabic
                    ? `المحدد: ${selectedIds.length}`
                    : `Selected: ${selectedIds.length}`}
                </span>
=======
    <MainLayout>
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="container-neo max-w-6xl mx-auto">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right ${toast.type === "error"
                ? "bg-red-500/90 text-white"
                : "bg-emerald-500/90 text-white"
                }`}
            >
              {toast.type === "error" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Intelligence Search
              </h1>
              <p className="text-slate-400">
                Advanced semantic search across security knowledge base.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                System Online
>>>>>>> devops3
              </div>
            </div>
          </div>

<<<<<<< HEAD
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className={`rounded-md px-2 py-1 ${inputBgClass}`}
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.filter((s) => s.value !== "all").map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={bulkUpdating || selectedIds.length === 0}
                  onClick={handleBulkUpdate}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-xs font-medium transition-colors"
                >
                  {bulkUpdating
                    ? isArabic
                      ? "جارٍ التحديث..."
                      : "Updating..."
                    : isArabic
                      ? "تطبيق على المحدد"
                      : "Apply to selected"}
                </button>
              </div>
            </div>
          )}

          {bestMatch && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border ${cardBgClass} p-4 space-y-4`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected(bestMatch._id)}
                      onChange={() => toggleSelect(bestMatch._id)}
                      className="h-4 w-4 rounded border-slate-600"
                    />
                    <h2 className="text-lg font-semibold">
                      {isArabic ? "أقرب نتيجة" : "Best match"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-1 rounded-full bg-sky-900/70 border border-sky-700">
                      Domain: {bestMatch.domain}
                    </span>
                    {bestMatch.owner_group && (
                      <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                        Owner: {bestMatch.owner_group}
                      </span>
                    )}
                    {bestMatch.client_name && (
                      <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                        Client: {bestMatch.client_name}
                      </span>
                    )}
                    <span
                      className={getStatusChipClasses(
                        bestMatch.status,
                        isDark
                      )}
                    >
                      Status: {bestMatch.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                  <span className="text-slate-300">
                    {isArabic
                      ? "تعديل حالة هذا الضبط:"
                      : "Update status for this control:"}
                  </span>
                  <select
                    className={`rounded-md px-2 py-1 ${inputBgClass}`}
                    value={statusEditValue}
                    onChange={(e) => setStatusEditValue(e.target.value)}
                  >
                    {STATUS_OPTIONS.filter((s) => s.value !== "all").map(
                      (opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isArabic ? opt.labelAr : opt.labelEn}
                        </option>
                      )
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-medium transition-colors"
                  >
                    {updatingStatus
                      ? isArabic
                        ? "جارٍ الحفظ..."
                        : "Saving..."
                      : isArabic
                        ? "حفظ الحالة"
                        : "Save status"}
                  </button>
                  {statusMessage && (
                    <span className="text-xs text-slate-300">
                      {statusMessage}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className={isArabic ? "text-right" : "text-left"}>
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic ? "السؤال:" : "Question:"}
                    </p>
                    <p className="font-medium">{bestMatch.question_text}</p>
                    {bestMatch.question_text_en &&
                      bestMatch.question_text_en !==
                      bestMatch.question_text && (
                        <p className="text-slate-300 mt-1">
                          EN: {bestMatch.question_text_en}
                        </p>
                      )}
                  </div>

                  <div className={isArabic ? "text-right" : "text-left"}>
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic
                        ? "الإجابة (للاستبيان):"
                        : "Answer (for the questionnaire):"}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-100">
                      {bestMatch.answer_text || (
                        <span className="text-slate-500">
                          {isArabic
                            ? "لا توجد إجابة مخزّنة بعد."
                            : "No answer stored yet."}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic
                        ? "شرح مبسّط بالعربي:"
                        : "Simple explanation in Arabic:"}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-200">
                      {bestMatch.explanation_ar?.trim()
                        ? bestMatch.explanation_ar
                        : isArabic
                          ? "لا يوجد شرح عربي مخزَّن بعد. يمكنك إضافته من صفحة الإدارة أو عن طريق ملف Excel."
                          : "No Arabic explanation stored yet. You can add it from the admin page or via Excel import."}
                    </p>
                  </div>

                  {recommendations.length > 0 && (
                    <div className={isArabic ? "text-right" : "text-left"}>
                      <p className="text-slate-400 text-xs mb-1">
                        {isArabic ? "توصيات:" : "Recommendations:"}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-200">
                        {recommendations.map((r, i) => (
                          <li key={`rec-${i}`}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(bestMatch.source_file ||
                    bestMatch.source_ref ||
                    bestMatch.client_name) && (
                      <div className="text-xs text-slate-500 mt-2">
                        {isArabic ? "مصدر المعلومة: " : "Source: "}
                        {bestMatch.source_file && `${bestMatch.source_file} `}
                        {bestMatch.source_ref &&
                          `(Ref: ${bestMatch.source_ref}) `}
                        {bestMatch.client_name &&
                          (isArabic
                            ? ` | العميل: ${bestMatch.client_name}`
                            : ` | Client: ${bestMatch.client_name}`)}
                      </div>
                    )}
                </div>
              </div>

              {otherMatches.length > 0 && (
                <div
                  className={`rounded-xl border ${subCardBgClass} p-4 space-y-2 text-sm`}
                >
                  <p className="text-slate-300 text-xs mb-2">
                    {isArabic ? "نتائج أخرى:" : "Other matching results:"}
                  </p>
                  <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
                    {otherMatches.map((m) => (
                      <div
                        key={m._id}
                        className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected(m._id)}
                            onChange={() => toggleSelect(m._id)}
                            className="h-4 w-4 rounded border-slate-600"
                          />
                          <p className="font-medium text-slate-100">
                            {m.question_text}
                          </p>
                        </div>
                        {m.question_text_en &&
                          m.question_text_en !== m.question_text && (
                            <p className="text-xs text-slate-400 mt-1">
                              EN: {m.question_text_en}
                            </p>
                          )}
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                            Domain: {m.domain}
                          </span>
                          {m.owner_group && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                              Owner: {m.owner_group}
                            </span>
                          )}
                          {m.client_name && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                              Client: {m.client_name}
                            </span>
                          )}
                          <span
                            className={getStatusChipClasses(m.status, isDark)}
                          >
                            Status: {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!bestMatch && !error && !loading && (
            <p className="text-sm text-slate-400">
              {isArabic
                ? "لا توجد نتائج حالياً. جرّب تعديل كلمات البحث أو الفلاتر."
                : "No results yet. Try adjusting your query or filters."}
            </p>
          )}
        </div>

        {toast && (
          <div
            className={`fixed bottom-4 right-4 max-w-sm px-4 py-2 rounded-md text-xs md:text-sm shadow-lg ${toast.type === "success"
              ? "bg-emerald-600 text-white"
                      )}
                    >
        Status: {bestMatch.status}
      </span>
    </div >
                </div >

                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                  <span className="text-slate-300">
                    {isArabic
                      ? "تعديل حالة هذا الضبط:"
                      : "Update status for this control:"}
                  </span>
                  <select
                    className={`rounded-md px-2 py-1 ${inputBgClass}`}
                    value={statusEditValue}
                    onChange={(e) => setStatusEditValue(e.target.value)}
                  >
                    {STATUS_OPTIONS.filter((s) => s.value !== "all").map(
                      (opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isArabic ? opt.labelAr : opt.labelEn}
                        </option>
                      )
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-medium transition-colors"
                  >
                    {updatingStatus
                      ? isArabic
                        ? "جارٍ الحفظ..."
                        : "Saving..."
                      : isArabic
                        ? "حفظ الحالة"
                        : "Save status"}
                  </button>
                  {statusMessage && (
                    <span className="text-xs text-slate-300">
                      {statusMessage}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className={isArabic ? "text-right" : "text-left"}>
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic ? "السؤال:" : "Question:"}
                    </p>
                    <p className="font-medium">{bestMatch.question_text}</p>
                    {bestMatch.question_text_en &&
                      bestMatch.question_text_en !==
                      bestMatch.question_text && (
                        <p className="text-slate-300 mt-1">
                          EN: {bestMatch.question_text_en}
                        </p>
                      )}
                  </div>

                  <div className={isArabic ? "text-right" : "text-left"}>
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic
                        ? "الإجابة (للاستبيان):"
                        : "Answer (for the questionnaire):"}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-100">
                      {bestMatch.answer_text || (
                        <span className="text-slate-500">
                          {isArabic
                            ? "لا توجد إجابة مخزّنة بعد."
                            : "No answer stored yet."}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic
                        ? "شرح مبسّط بالعربي:"
                        : "Simple explanation in Arabic:"}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-200">
                      {bestMatch.explanation_ar?.trim()
                        ? bestMatch.explanation_ar
                        : isArabic
                          ? "لا يوجد شرح عربي مخزَّن بعد. يمكنك إضافته من صفحة الإدارة أو عن طريق ملف Excel."
                          : "No Arabic explanation stored yet. You can add it from the admin page or via Excel import."}
                    </p>
                  </div>

                  {recommendations.length > 0 && (
                    <div className={isArabic ? "text-right" : "text-left"}>
                      <p className="text-slate-400 text-xs mb-1">
                        {isArabic ? "توصيات:" : "Recommendations:"}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-200">
                        {recommendations.map((r, i) => (
                          <li key={`rec-${i}`}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(bestMatch.source_file ||
                    bestMatch.source_ref ||
                    bestMatch.client_name) && (
                      <div className="text-xs text-slate-500 mt-2">
                        {isArabic ? "مصدر المعلومة: " : "Source: "}
                        {bestMatch.source_file && `${bestMatch.source_file} `}
                        {bestMatch.source_ref &&
                          `(Ref: ${bestMatch.source_ref}) `}
                        {bestMatch.client_name &&
                          (isArabic
                            ? ` | العميل: ${bestMatch.client_name}`
                            : ` | Client: ${bestMatch.client_name}`)}
                      </div>
                    )}
                </div>
              </div >

  {
    otherMatches.length > 0 && (
      <div
        className={`rounded-xl border ${subCardBgClass} p-4 space-y-2 text-sm`}
      >
        <p className="text-slate-300 text-xs mb-2">
          {isArabic ? "نتائج أخرى:" : "Other matching results:"}
        </p>
        <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
          {otherMatches.map((m) => (
            <div
              key={m._id}
              className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected(m._id)}
                  onChange={() => toggleSelect(m._id)}
                  className="h-4 w-4 rounded border-slate-600"
                />
                <p className="font-medium text-slate-100">
                  {m.question_text}
                </p>
              </div>
              {m.question_text_en &&
                m.question_text_en !== m.question_text && (
                  <p className="text-xs text-slate-400 mt-1">
                    EN: {m.question_text_en}
                  </p>
                )}
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  Domain: {m.domain}
                </span>
                {m.owner_group && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    Owner: {m.owner_group}
                  </span>
                )}
                {m.client_name && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    Client: {m.client_name}
                  </span>
                )}
                <span
                  className={getStatusChipClasses(m.status, isDark)}
                >
                  Status: {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
            </div >
          )
}

{
  !bestMatch && !error && !loading && (
    <p className="text-sm text-slate-400">
      {isArabic
        ? "لا توجد نتائج حالياً. جرّب تعديل كلمات البحث أو الفلاتر."
        : "No results yet. Try adjusting your query or filters."}
    </p>
  )
}
        </div >

  { toast && (
    <div
      className={`fixed bottom-4 right-4 max-w-sm px-4 py-2 rounded-md text-xs md:text-sm shadow-lg ${toast.type === "success"
        ? "bg-emerald-600 text-white"
        : "bg-red-600 text-white"
        }`}
    >
      {toast.message}
    </div>
  )}
      </div >
    </main >
  <Footer />
    </>
=======
          {/* Search Bar & Filters */}
          <div className="glass-panel p-4 rounded-2xl mb-8 sticky top-24 z-30 shadow-2xl shadow-sky-900/20">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything (e.g., 'How do we handle encryption keys?')"
                  className="relative z-10 w-full bg-[#0f172a]/80 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all shadow-inner"
                />

                {/* Query Translate Button */}
                <button
                  type="button"
                  onClick={handleTranslateQuery}
                  disabled={translatingQuery || !query.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Translate Query"
                >
                  {translatingQuery ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-5 py-3.5 rounded-xl border flex items-center gap-2 transition-all font-medium ${isFilterOpen
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? "Analyzing..." : "Search"}
              </button>
            </form>

            {/* Expandable Filters */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as QaStatus | "all")
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 appearance-none"
                  >
                    <option value="all" className="bg-slate-900">
                      All Statuses
                    </option>
                    <option value="applied" className="bg-slate-900">
                      Applied
                    </option>
                    <option value="not_applied" className="bg-slate-900">
                      Not Applied
                    </option>
                    <option value="unknown" className="bg-slate-900">
                      Unknown
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">
                    Domain
                  </label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 appearance-none"
                  >
                    <option value="all" className="bg-slate-900">
                      All Domains
                    </option>
                    <option value="application" className="bg-slate-900">
                      Application
                    </option>
                    <option value="network" className="bg-slate-900">
                      Network
                    </option>
                    <option value="database" className="bg-slate-900">
                      Database
                    </option>
                    <option value="cloud" className="bg-slate-900">
                      Cloud
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {loading && !results.length && (
              <div className="text-center py-20">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-sky-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 animate-pulse">
                  Processing semantic vectors...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="text-center py-20 glass-panel rounded-2xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No intelligence found
                </h3>
                <p className="text-slate-400">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}

            {results.map((result) => {
              const id = String(result._id ?? "");
              const isExpanded = expandedItems.has(id);
              const showTranslation = translatedItems.has(id);
              const isTranslating = translatingIds.has(id);

              // Gradient color based on score (100=green, 0=red)
              const score = result.score || 0;
              let scoreColor = "";
              let scoreBg = "";
              let scoreWarning = false;

              if (score >= 90) {
                scoreColor = "text-emerald-400";
                scoreBg = "border-emerald-500/30 bg-emerald-500/10";
              } else if (score >= 80) {
                scoreColor = "text-green-400";
                scoreBg = "border-green-500/30 bg-green-500/10";
              } else if (score >= 70) {
                scoreColor = "text-lime-400";
                scoreBg = "border-lime-500/30 bg-lime-500/10";
              } else if (score >= 60) {
                scoreColor = "text-yellow-400";
                scoreBg = "border-yellow-500/30 bg-yellow-500/10";
              } else if (score >= 50) {
                scoreColor = "text-amber-400";
                scoreBg = "border-amber-500/30 bg-amber-500/10";
                scoreWarning = true;
              } else if (score >= 40) {
                scoreColor = "text-orange-400";
                scoreBg = "border-orange-500/30 bg-orange-500/10";
                scoreWarning = true;
              } else {
                scoreColor = "text-red-400";
                scoreBg = "border-red-500/30 bg-red-500/10";
                scoreWarning = true;
              }

              // Strict English-First Logic
              const originalText = result.question_text;
              const isOriginalArabic =
                /[\u0600-\u06FF]/.test(originalText || "");

              // Identify English and Arabic texts
              const englishText =
                result.question_text_en ||
                (!isOriginalArabic ? originalText : "") ||
                (result as any).translated_text;

              const arabicText =
                (result as any).question_text_ar ||
                (isOriginalArabic ? originalText : "");

              // Main Title: Always English if available, otherwise Arabic.
              let mainText = englishText || arabicText || "";
              let mainDir = mainText === arabicText ? "rtl" : "ltr";

              // Secondary Box (Translation)
              let secondaryText = "";
              let secondaryDir: "rtl" | "ltr" = "ltr";
              let secondaryLabel = "";

              if (showTranslation) {
                if (mainText === englishText) {
                  secondaryText =
                    arabicText || "Translation not available" || "";
                  secondaryDir = "rtl";
                  secondaryLabel = "Arabic Translation";
                } else if (mainText === arabicText) {
                  secondaryText =
                    englishText || "Translation not available" || "";
                  secondaryDir = "ltr";
                  secondaryLabel = "English Translation";
                }
              }

              return (
                <div
                  key={id}
                  className="glass-card p-6 group hover:bg-white/[0.02] transition-all border-l-4 border-l-transparent hover:border-l-sky-500"
                >
                  {/* Card Header: Badges & Score */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${result.status === "applied"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : result.status === "not_applied"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : result.status === "not_applicable"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                              : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                          }`}
                      >
                        {result.status.replace(/_/g, " ")}
                      </span>

                      {/* Domain Badge */}
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        {result.domain}
                      </span>

                      {/* Tech Badges */}
                      {result.needs_dev_input && (
                        <span
                          className="px-2 py-1 rounded-md text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1"
                          title="Requires Developer Input"
                        >
                          <Code className="w-3 h-3" /> Dev
                        </span>
                      )}
                      {result.needs_infra_input && (
                        <span
                          className="px-2 py-1 rounded-md text-[10px] font-medium bg-orange-500/10 border border-orange-500/20 text-orange-300 flex items-center gap-1"
                          title="Requires Infra Input"
                        >
                          <Server className="w-3 h-3" /> Infra
                        </span>
                      )}
                    </div>

                    {/* Relevance Score with Gradient */}
                    {result.score !== undefined && (
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${scoreBg}`}
                        >
                          <span className={`text-sm font-bold ${scoreColor}`}>
                            {result.score}%
                          </span>
                          <span className="text-[10px] uppercase tracking-wider opacity-80 text-slate-400">
                            Relevance
                          </span>
                        </div>
                        {scoreWarning && (
                          <div className="flex items-center gap-1 text-[10px] text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low match - verify answer</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Question */}
                  <h3
                    className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-sky-300 transition-colors leading-snug"
                    dir={mainDir}
                  >
                    {mainText}
                  </h3>

                  {/* Secondary Question (Translation) */}
                  {showTranslation && (
                    <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-400 uppercase tracking-wider">
                        <Globe className="w-3 h-3" />
                        {secondaryLabel}
                      </div>
                      <p
                        className={`text-lg leading-snug ${secondaryText === "Translation not available"
                          ? "text-slate-500 italic text-sm"
                          : "text-purple-100"
                          }`}
                        dir={secondaryDir}
                      >
                        {secondaryText}
                      </p>
                    </div>
                  )}

                  {/* Answer Preview */}
                  {result.answer_text && (
                    <div
                      className={`text-slate-300 leading-relaxed border-l-2 border-white/10 pl-4 whitespace-pre-wrap transition-all duration-300 ${isExpanded ? "" : "line-clamp-3"
                        }`}
                    >
                      {result.answer_text}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in space-y-4">
                      {/* Arabic Explanation */}
                      {result.explanation_ar && (
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Explanation (Arabic)
                          </h4>
                          <p
                            className="text-sm text-slate-300 leading-relaxed"
                            dir="rtl"
                          >
                            {result.explanation_ar}
                          </p>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>
                            Source:{" "}
                            <span className="text-slate-300">
                              {result.source_file || "Manual Entry"}
                            </span>
                          </span>
                        </div>
                        {result.client_name && (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-700 flex items-center justify-center text-[8px]">
                              C
                            </span>
                            <span>
                              Client:{" "}
                              <span className="text-slate-300">
                                {result.client_name}
                              </span>
                            </span>
                          </div>
                        )}
                        <div>
                          <span>
                            ID:{" "}
                            <span className="font-mono text-slate-400">
                              {id}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span>
                            Updated:{" "}
                            <span className="text-slate-400">
                              {result.updated_at
                                ? new Date(
                                  result.updated_at
                                ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 mt-2 border-t border-white/5">
                    {/* View Details */}
                    <button
                      onClick={() => toggleExpand(id)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all hover:text-white flex items-center gap-1.5"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>

                    {/* Edit Button (Amber) */}
                    <button
                      onClick={() => openEditModal(result)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-400 transition-all flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>

                    {/* Translate Button (Purple) */}
                    <button
                      onClick={() => toggleTranslateResult(result)}
                      disabled={isTranslating}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${showTranslation
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                        : "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400"
                        }`}
                      title="Show Translation"
                    >
                      {isTranslating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Languages className="w-3 h-3" />
                      )}
                      {isTranslating
                        ? "Translating..."
                        : showTranslation
                          ? "Hide Translation"
                          : "Translate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
                {/* Modal Header */}
                <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between z-10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-sky-400" /> Edit Entry
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Question (English) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Question (English)
                    </label>
                    <textarea
                      value={editingItem.question_text_en || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          question_text_en: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      rows={2}
                      dir="ltr"
                      placeholder="Enter question in English..."
                    />
                  </div>

                  {/* Question (Arabic) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Question (Arabic)
                    </label>
                    <textarea
                      value={(editingItem as any).question_text_ar || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          question_text_ar: e.target.value,
                        } as any)
                      }
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      rows={2}
                      dir="rtl"
                      placeholder="أدخل السؤال بالعربية..."
                    />
                  </div>

                  {/* Status & Domain */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Status
                      </label>
                      <select
                        value={editingItem.status}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            status: e.target.value as QaStatus,
                          })
                        }
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                      >
                        <option value="applied">Applied</option>
                        <option value="not_applied">Not Applied</option>
                        <option value="not_applicable">Not Applicable</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Domain
                      </label>
                      <select
                        value={editingItem.domain}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            domain: e.target.value as QaDomain,
                          })
                        }
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                      >
                        <option value="application">Application</option>
                        <option value="network">Network</option>
                        <option value="database">Database</option>
                        <option value="cloud">Cloud</option>
                      </select>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Explanation (Arabic)
                    </label>
                    <textarea
                      value={editingItem.explanation_ar || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          explanation_ar: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 p-4 flex items-center justify-end gap-3 z-10">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
>>>>>>> devops3
  );
}
