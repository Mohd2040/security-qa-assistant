// app/search/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { QaEntry } from "@/lib/types";

type UiLang = "en" | "ar";

interface SearchResponse {
  matches: QaEntry[];
  total: number;
}

const STATUS_OPTIONS = [
  { value: "all", labelEn: "All statuses", labelAr: "كل الحالات" },
  { value: "applied", labelEn: "Applied", labelAr: "مطبق" },
  { value: "not_applied", labelEn: "Not applied", labelAr: "غير مطبق" },
  { value: "not_applicable", labelEn: "Not applicable", labelAr: "غير منطبق" },
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [domain, setDomain] = useState<string>("all");
  const [ownerGroup, setOwnerGroup] = useState<string>("all");

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<QaEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<UiLang>("en");

  const isArabic = uiLang === "ar";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMatches([]);
    setTotal(0);

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
          limit: 200,
        }),
      });

      const data = (await res.json()) as SearchResponse & { error?: string };

      if (!res.ok) {
        setError(
          data.error ||
            (isArabic
              ? "حدث خطأ أثناء عملية البحث"
              : "An error occurred while searching")
        );
      } else {
        setMatches(data.matches || []);
        setTotal(data.total || 0);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        isArabic
          ? "تعذر الاتصال بالسيرفر"
          : "Failed to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  }

  const bestMatch = matches.length > 0 ? matches[0] : null;
  const otherMatches = matches.length > 1 ? matches.slice(1) : [];

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

    const url = `/api/qa/search/export?${params.toString()}`;
    window.open(url, "_blank");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isArabic ? "البحث في أسئلة السيكوريتي" : "Search Security Q&A"}
            </h1>
            <p className="text-slate-300 mt-1 text-sm md:text-base">
              {isArabic
                ? "اكتب سؤال سيكوريتي وحدد الفلاتر (الحالة، التصنيف، الجهة المسؤولة)، ثم يمكنك تصدير النتيجة إلى ملف Excel كتقرير."
                : "Type a security-related question and apply filters (status, domain, owner group), then export the results to Excel as a report."}
            </p>
          </div>

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

        {/* Search & filters */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              className={`w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                isArabic ? "text-right" : "text-left"
              }`}
              rows={2}
              placeholder={
                isArabic
                  ? "مثال: هل النظام يدعم قفل الحساب بعد عدد محاولات فاشلة؟"
                  : "Example: Does the system support account lockout after several failed login attempts?"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
            {/* Status filter */}
            <div>
              <label className="block mb-1 text-slate-300">
                {isArabic ? "الحالة" : "Status"}
              </label>
              <select
                className="w-full rounded-md bg-slate-900 border border-slate-800 px-2 py-1.5"
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
                className="w-full rounded-md bg-slate-900 border border-slate-800 px-2 py-1.5"
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
                className="w-full rounded-md bg-slate-900 border border-slate-800 px-2 py-1.5"
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

          <div className="flex items-center justify-between gap-2">
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

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>
                {isArabic
                  ? `عدد النتائج: ${total}`
                  : `Results: ${total}`}
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
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Results */}
        {bestMatch && (
          <div className="space-y-4">
            {/* Main card */}
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {isArabic ? "أقرب نتيجة" : "Best match"}
                </h2>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded-full bg-sky-900/70 border border-sky-700">
                    Domain: {bestMatch.domain}
                  </span>
                  {bestMatch.owner_group && (
                    <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                      Owner: {bestMatch.owner_group}
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full bg-emerald-900/70 border border-emerald-700">
                    Status: {bestMatch.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {/* Stored question */}
                <div className={isArabic ? "text-right" : "text-left"}>
                  <p className="text-slate-400 text-xs mb-1">
                    {isArabic ? "السؤال:" : "Question:"}
                  </p>
                  <p className="font-medium">{bestMatch.question_text}</p>
                  {bestMatch.question_text_en &&
                    bestMatch.question_text_en !== bestMatch.question_text && (
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
                    {bestMatch.source_file &&
                      `${bestMatch.source_file} `}
                    {bestMatch.source_ref &&
                      `(Ref: ${bestMatch.source_ref})`}
                  </div>
                )}
              </div>
            </div>

            {/* Other matches */}
            {otherMatches.length > 0 && (
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4 space-y-2 text-sm">
                <p className="text-slate-300 text-xs mb-2">
                  {isArabic
                    ? "نتائج أخرى:"
                    : "Other matching results:"}
                </p>
                <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
                  {otherMatches.map((m) => (
                    <div
                      key={m._id}
                      className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2"
                    >
                      <p className="font-medium text-slate-100">
                        {m.question_text}
                      </p>
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
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          Status: {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!bestMatch && !error && !loading && (
              <p className="text-sm text-slate-400">
                {isArabic
                  ? "لا توجد نتائج حالياً. جرّب تعديل كلمات البحث أو الفلاتر."
                  : "No results yet. Try adjusting your query or filters."}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
