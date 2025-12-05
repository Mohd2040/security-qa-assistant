// app/search/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { QaEntry } from "@/lib/types";

type UiLang = "en" | "ar";

interface AskResponse {
  found: boolean;
  message?: string;
  best_match?: QaEntry;
  matches?: QaEntry[];
  matches_count?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<UiLang>("en"); // default English

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResponse(null);

    if (!query.trim()) {
      setError(uiLang === "en" ? "Please type a question" : "اكتب سؤال أولاً");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/qa/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = (await res.json()) as AskResponse & { error?: string };

      if (!res.ok) {
        setError(
          data.error ||
            (uiLang === "en"
              ? "An error occurred while processing the request"
              : "حدث خطأ أثناء الطلب")
        );
      } else {
        setResponse(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        uiLang === "en"
          ? "Failed to connect to the server"
          : "تعذر الاتصال بالسيرفر"
      );
    } finally {
      setLoading(false);
    }
  }

  const isArabic = uiLang === "ar";

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    const best = response?.best_match;
    if (!best) return recs;

    if (best.status === "unknown") {
      recs.push(
        isArabic
          ? "الحالة Unknown: يُفضل التأكد من الفريق المسؤول (Dev أو Infra) وتحديث الحالة إلى Applied / Not Applied."
          : "Status is Unknown: it is recommended to confirm with the responsible team (Dev or Infra) and update to Applied / Not Applied."
      );
    }

    if (best.needs_dev_input) {
      recs.push(
        isArabic
          ? "هذا الضبط يعتمد على التطبيق نفسه: تواصل مع فريق التطوير لتأكيد آلية التنفيذ داخل الكود."
          : "This control depends on the application logic: talk to the development team to confirm how it is implemented in the code."
      );
    }

    if (best.needs_infra_input) {
      recs.push(
        isArabic
          ? "هذا الضبط مرتبط بالإنفرا/Google Cloud: راجع إعدادات البنية التحتية (شبكة، داتابيس، GCP)."
          : "This control is related to infra/Google Cloud: review infrastructure settings (network, database, GCP)."
      );
    }

    if (best.domain === "database" || best.domain === "cloud") {
      recs.push(
        isArabic
          ? "تحقق من دعم Google Cloud لهذا الضبط (مثل التشفير، النسخ الاحتياطي، الـ IAM) وتأكد أنه مفعّل فعلياً."
          : "Check whether Google Cloud natively supports this control (e.g. encryption, backups, IAM) and ensure it is actually enabled."
      );
    }

    return recs;
  }, [response, isArabic]);

  const otherMatches =
    response?.matches && response.matches.length > 1
      ? response.matches.slice(1)
      : [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isArabic ? "البحث في أسئلة السيكوريتي" : "Search Security Q&A"}
            </h1>
            <p className="text-slate-300 mt-1 text-sm md:text-base">
              {isArabic
                ? "اكتب سؤال سيكوريتي (بالعربي أو الإنجليزي)، والنظام يبحث في قاعدة الأسئلة المعتمدة ويعرض أقرب النتائج."
                : "Type a security-related question (Arabic or English). The system will search your approved Q&A and show the closest matches."}
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

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 mb-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4"
        >
          <textarea
            className={`w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              isArabic ? "text-right" : "text-left"
            }`}
            rows={3}
            placeholder={
              isArabic
                ? "مثال: هل النظام يدعم قفل الحساب بعد عدد محاولات فاشلة؟"
                : "Example: Does the system support account lockout after several failed login attempts?"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="self-end inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {loading
              ? isArabic
                ? "جاري البحث..."
                : "Searching..."
              : isArabic
              ? "ابحث عن إجابة"
              : "Search for an answer"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Main result */}
        {response && (
          <div className="space-y-4">
            {!response.found && (
              <div className="rounded-md bg-yellow-900/40 border border-yellow-700 px-4 py-3 text-sm text-yellow-100">
                {response.message ||
                  (isArabic
                    ? "لا يوجد نتيجة مطابقة. تحتاج تسأل الديفلوبرز أو فريق الإنفرا وتضيف الإجابة الجديدة للنظام."
                    : "No matching question was found. You need to ask the developers or infrastructure team, then add the new answer to the system.")}
              </div>
            )}

            {response.found && response.best_match && (
              <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-4">
                {/* badges */}
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <h2 className="text-lg font-semibold">
                    {isArabic
                      ? "أقرب تطابق موجود"
                      : "Closest matching entry"}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-sky-900/70 border border-sky-700">
                      Domain: {response.best_match.domain}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-emerald-900/70 border border-emerald-700">
                      Status: {response.best_match.status}
                    </span>
                    {response.matches_count !== undefined && (
                      <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                        Matches: {response.matches_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* main content */}
                <div className="space-y-3 text-sm">
                  {/* Stored question */}
                  <div className={isArabic ? "text-right" : "text-left"}>
                    <p className="text-slate-400 text-xs mb-1">
                      {isArabic ? "السؤال المخزَّن:" : "Stored question:"}
                    </p>
                    <p className="font-medium">
                      {response.best_match.question_text}
                    </p>
                    {response.best_match.question_text_en && (
                      <p className="text-slate-300 mt-1">
                        EN: {response.best_match.question_text_en}
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
                      {response.best_match.answer_text}
                    </p>
                  </div>

                  {/* Arabic explanation */}
                  {response.best_match.explanation_ar && (
                    <div className="text-right">
                      <p className="text-slate-400 text-xs mb-1">
                        {isArabic
                          ? "شرح مبسّط بالعربي:"
                          : "Simple explanation in Arabic:"}
                      </p>
                      <p className="whitespace-pre-wrap text-slate-200">
                        {response.best_match.explanation_ar}
                      </p>
                    </div>
                  )}

                  {/* Suggested dev/infra questions */}
                  {(response.best_match.dev_questions &&
                    response.best_match.dev_questions.length > 0) ||
                  (response.best_match.infra_questions &&
                    response.best_match.infra_questions.length > 0) ? (
                    <div className={isArabic ? "text-right" : "text-left"}>
                      <p className="text-slate-400 text-xs mb-1">
                        {isArabic
                          ? "أسئلة مقترحة لتسألها:"
                          : "Suggested follow-up questions:"}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-200">
                        {response.best_match.dev_questions?.map((q, i) => (
                          <li key={`dev-${i}`}>
                            {isArabic ? "[Dev] " : "[Dev] "}
                            {q}
                          </li>
                        ))}
                        {response.best_match.infra_questions?.map((q, i) => (
                          <li key={`infra-${i}`}>
                            {isArabic ? "[Infra] " : "[Infra] "}
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

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
                  {(response.best_match.source_file ||
                    response.best_match.source_ref) && (
                    <div className="text-xs text-slate-500 mt-2">
                      {isArabic ? "مصدر المعلومة: " : "Source: "}
                      {response.best_match.source_file &&
                        `${response.best_match.source_file} `}
                      {response.best_match.source_ref &&
                        `(Ref: ${response.best_match.source_ref})`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other matches */}
            {otherMatches.length > 0 && (
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4 space-y-2 text-sm">
                <p className="text-slate-300 text-xs mb-2">
                  {isArabic
                    ? "نتائج أخرى مشابهة:"
                    : "Other related matches:"}
                </p>
                <div className="space-y-2">
                  {otherMatches.map((m) => (
                    <div
                      key={m._id}
                      className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2"
                    >
                      <p className="font-medium text-slate-100">
                        {m.question_text}
                      </p>
                      {m.question_text_en && (
                        <p className="text-xs text-slate-400 mt-1">
                          EN: {m.question_text_en}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          Domain: {m.domain}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
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
      </div>
    </main>
  );
}
