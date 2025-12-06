"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { QaEntry } from "@/lib/types";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [domain, setDomain] = useState<string>("all");
  const [ownerGroup, setOwnerGroup] = useState<string>("all");

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sourceFile, setSourceFile] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<QaEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const [uiLang, setUiLang] = useState<UiLang>("en");
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusEditValue, setStatusEditValue] = useState<string>("unknown");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("applied");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Recent queries (local only)
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  const isArabic = uiLang === "ar";
  const isDark = theme === "dark";

  const bestMatch = matches.length > 0 ? matches[0] : null;
  const otherMatches = matches.length > 1 ? matches.slice(1) : [];

  useEffect(() => {
    if (bestMatch) {
      setStatusEditValue(bestMatch.status || "unknown");
      setStatusMessage(null);
    }
  }, [bestMatch?._id]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
  }

  // -------------------- Suggestions ---------------------
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/qa/suggest?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 250); // debounce بسيط

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  async function performSearch(goToPage?: number, overridePageSize?: number) {
    setError(null);
    setStatusMessage(null);
    setSelectedIds([]);

    const targetPage = goToPage ?? page;
    const size = overridePageSize ?? pageSize;

    try {
      setLoading(true);
      const res = await fetch("/api/qa/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          status,
          domain,
          owner_group: ownerGroup,
          page: targetPage,
          pageSize: size,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          source_file: sourceFile || undefined,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          (data && data.error) ||
          (isArabic
            ? "حدث خطأ أثناء عملية البحث"
            : "An error occurred while searching");
        setError(msg);
        showToast("error", msg);
      } else {
        const payload = data as SearchResponse;
        setMatches(payload.matches || []);
        setTotal(payload.total || 0);
        setPage(payload.page || targetPage);
        setTotalPages(payload.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
      const msg = isArabic
        ? "تعذر الاتصال بالسيرفر"
        : "Failed to connect to the server";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setRecentQueries((prev) => {
        const newList = [trimmed, ...prev.filter((q) => q !== trimmed)];
        return newList.slice(0, 5);
      });
    }
    setPage(1);
    await performSearch(1);
  }

  const recommendations = useMemo(() => {
    if (!bestMatch) return [];
    const recs: string[] = [];

    if (bestMatch.status === "unknown") {
      recs.push(
        isArabic
          ? "الحالة Unknown: يُفضل التأكد من الفريق المسؤول (Dev أو Infra) وتحديث الحالة إلى Applied / Not Applied."
          : "Status is Unknown: confirm with the responsible team (Dev or Infra) and update to Applied / Not Applied."
      );
    }

    if (bestMatch.needs_dev_input) {
      recs.push(
        isArabic
          ? "هذا الضبط يعتمد على التطبيق نفسه: تواصل مع فريق التطوير لتأكيد آلية التنفيذ داخل الكود."
          : "This control depends on the application logic: talk to the development team to confirm how it is implemented."
      );
    }

    if (bestMatch.needs_infra_input) {
      recs.push(
        isArabic
          ? "هذا الضبط مرتبط بالإنفرا/Google Cloud: راجع إعدادات البنية التحتية (شبكة، داتابيس، GCP)."
          : "This control is related to infra/Google Cloud: review infrastructure settings (network, DB, GCP)."
      );
    }

    if (
      bestMatch.domain === "database" ||
      bestMatch.domain === "cloud" ||
      bestMatch.domain === "network"
    ) {
      recs.push(
        isArabic
          ? "تحقق من دعم Google Cloud أو البنية التحتية لهذا الضبط (مثل التشفير، النسخ الاحتياطي، الصلاحيات) وتأكد أنه مفعّل فعلياً."
          : "Check whether Google Cloud or infra supports this control (encryption, backups, IAM) and ensure it is enabled."
      );
    }

    return recs;
  }, [bestMatch, isArabic]);

  function handleExport() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (status) params.set("status", status);
    if (domain) params.set("domain", domain);
    if (ownerGroup) params.set("owner_group", ownerGroup);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (sourceFile) params.set("source_file", sourceFile);

    const url = `/api/qa/search/export?${params.toString()}`;
    window.open(url, "_blank");
  }

  async function handleStatusUpdate() {
    if (!bestMatch || !bestMatch._id) return;
    setStatusMessage(null);
    setUpdatingStatus(true);

    try {
      const res = await fetch("/api/qa/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bestMatch._id,
          status: statusEditValue,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          (data && data.error) ||
          (isArabic
            ? `فشل تحديث الحالة. كود الرد: ${res.status}`
            : `Failed to update status. HTTP ${res.status}`);
        setStatusMessage(msg);
        showToast("error", msg);
      } else {
        const msg = isArabic
          ? "تم تحديث الحالة بنجاح"
          : "Status updated successfully";
        setStatusMessage(msg);
        showToast("success", msg);
        setMatches((prev) =>
          prev.map((m) =>
            m._id === bestMatch._id
              ? { ...m, status: statusEditValue as any }
              : m
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      const msg = isArabic
        ? "تعذر الاتصال بالسيرفر (Network error)"
        : "Failed to connect to the server (network error)";
      setStatusMessage(msg);
      showToast("error", msg);
    } finally {
      setUpdatingStatus(false);
    }
  }

  function canGoPrev() {
    return page > 1;
  }
  function canGoNext() {
    return page < totalPages;
  }

  function goPrev() {
    if (!canGoPrev() || loading) return;
    const newPage = page - 1;
    setPage(newPage);
    performSearch(newPage);
  }

  function goNext() {
    if (!canGoNext() || loading) return;
    const newPage = page + 1;
    setPage(newPage);
    performSearch(newPage);
  }

  function toggleSelect(id?: string) {
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function isSelected(id?: string) {
    if (!id) return false;
    return selectedIds.includes(id);
  }

  function selectAllOnPage() {
    const ids = matches
      .map((m) => m._id)
      .filter((id): id is string => Boolean(id));
    setSelectedIds(ids);
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function handleBulkUpdate() {
    if (selectedIds.length === 0) return;

    setBulkUpdating(true);
    try {
      const res = await fetch("/api/qa/bulk-update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          status: bulkStatus,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          (data && data.error) ||
          (isArabic
            ? `فشل التحديث الجماعي. كود الرد: ${res.status}`
            : `Bulk update failed. HTTP ${res.status}`);
        showToast("error", msg);
      } else {
        const msg =
          (isArabic
            ? `تم تعديل ${data.modified || 0} عنصر/عناصر`
            : `Updated ${data.modified || 0} item(s)`) || "";
        showToast("success", msg);
        setMatches((prev) =>
          prev.map((m) => {
            const id = m._id ?? "";
            return selectedIds.includes(id)
              ? { ...m, status: bulkStatus as any }
              : m;
          })
        );
        setSelectedIds([]);
      }
    } catch (err: any) {
      console.error(err);
      const msg = isArabic
        ? "تعذر الاتصال بالسيرفر (Network error)"
        : "Failed to connect to the server (network error)";
      showToast("error", msg);
    } finally {
      setBulkUpdating(false);
    }
  }

  const mainBgClass = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-slate-50 text-slate-900";
  const cardBgClass = isDark
    ? "bg-slate-900/70 border-slate-800"
    : "bg-white border-slate-200";
  const subCardBgClass = isDark
    ? "bg-slate-900/50 border-slate-800"
    : "bg-white border-slate-200";
  const inputBgClass = isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-300";
  const textareaBgClass = isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-300";

  const skeletonCard = (
    <div
      className={`rounded-xl ${cardBgClass} p-4 space-y-3 animate-pulse`}
    >
      <div className="h-5 w-40 rounded bg-slate-700/60" />
      <div className="h-4 w-full rounded bg-slate-700/50" />
      <div className="h-4 w-3/4 rounded bg-slate-700/40" />
    </div>
  );

  return (
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
          className={`rounded-xl border ${
            isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white"
          } p-4 space-y-4`}
        >
          <div className="relative">
            <textarea
              className={`w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                textareaBgClass
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
                className={`absolute z-20 mt-1 w-full rounded-md border ${
                  isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"
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
            {/* Status filter */}
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

            {/* Domain filter */}
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

            {/* Owner group filter */}
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

          {/* Pagination controls */}
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

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && matches.length === 0 && (
          <div className="space-y-3">
            {skeletonCard}
            {skeletonCard}
          </div>
        )}

        {/* Bulk controls */}
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
            </div>

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

        {/* Results */}
        {bestMatch && (
          <div className="space-y-4">
            {/* Main card */}
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

              {/* Inline status edit */}
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
                {/* Stored question */}
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

                {/* Answer */}
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

                {/* Arabic explanation */}
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

                {/* Recommendations */}
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

                {/* Source info */}
                {(bestMatch.source_file || bestMatch.source_ref) && (
                  <div className="text-xs text-slate-500 mt-2">
                    {isArabic ? "مصدر المعلومة: " : "Source: "}
                    {bestMatch.source_file && `${bestMatch.source_file} `}
                    {bestMatch.source_ref &&
                      `(Ref: ${bestMatch.source_ref})`}
                  </div>
                )}
              </div>
            </div>

            {/* Other matches */}
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 max-w-sm px-4 py-2 rounded-md text-xs md:text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
