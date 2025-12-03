// app/admin/qa/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { QaDomain, QaStatus } from "@/lib/types";

const STATUS_OPTIONS: QaStatus[] = [
  "applied",
  "not_applied",
  "not_applicable",
  "unknown",
];

const DOMAIN_OPTIONS: QaDomain[] = [
  "application",
  "database",
  "network",
  "cloud",
  "process",
];

export default function AdminQaPage() {
  const [questionText, setQuestionText] = useState("");
  const [questionTextEn, setQuestionTextEn] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState<QaStatus>("unknown");
  const [domain, setDomain] = useState<QaDomain>("application");
  const [explanationAr, setExplanationAr] = useState("");
  const [needsDev, setNeedsDev] = useState(false);
  const [needsInfra, setNeedsInfra] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!questionText.trim() || !answerText.trim()) {
      setErrorMsg("السؤال والإجابة مطلوبان");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/qa/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: questionText,
          question_text_en: questionTextEn || undefined,
          question_language: "ar",
          answer_text: answerText,
          answer_language: "en",
          status,
          domain,
          explanation_ar: explanationAr,
          needs_dev_input: needsDev,
          needs_infra_input: needsInfra,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "حدث خطأ أثناء الحفظ");
      } else {
        setSuccessMsg(`تم الحفظ بنجاح. ID: ${data.id}`);
        // تفريغ الحقول بعد النجاح
        setQuestionText("");
        setQuestionTextEn("");
        setAnswerText("");
        setExplanationAr("");
        setStatus("unknown");
        setDomain("application");
        setNeedsDev(false);
        setNeedsInfra(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Admin – إضافة سؤال/إجابة سيكوريتي
          </h1>
          <p className="text-slate-300 text-sm">
            من هنا تقدر تضيف أسئلة وأجوبة جديدة لقاعدة البيانات، عشان تظهر بعدين
            في صفحة البحث الرئيسية.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              السؤال (عربي) *
            </label>
            <textarea
              className="w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="مثال: هل النظام يدعم قفل الحساب بعد عدد محاولات فاشلة؟"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              السؤال (إنجليزي) – اختياري
            </label>
            <textarea
              className="w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2}
              value={questionTextEn}
              onChange={(e) => setQuestionTextEn(e.target.value)}
              placeholder="Does the system support account lockout after failed login attempts?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              الإجابة (للإستبيان) – غالباً إنجليزي *
            </label>
            <textarea
              className="w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={4}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Yes, the system enforces account lockout after 5 consecutive failed login attempts..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as QaStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <select
                className="w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                value={domain}
                onChange={(e) => setDomain(e.target.value as QaDomain)}
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              شرح مبسّط بالعربي (اختياري، للتعلّم)
            </label>
            <textarea
              className="w-full rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={3}
              value={explanationAr}
              onChange={(e) => setExplanationAr(e.target.value)}
              placeholder="هذه الخاصية تمنع محاولات التخمين على كلمة المرور عن طريق قفل الحساب بعد عدد معين من المحاولات الفاشلة..."
            />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-slate-700 bg-slate-900"
                checked={needsDev}
                onChange={(e) => setNeedsDev(e.target.checked)}
              />
              <span>يحتاج سؤال للديفلوبرز؟</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-slate-700 bg-slate-900"
                checked={needsInfra}
                onChange={(e) => setNeedsInfra(e.target.checked)}
              />
              <span>يحتاج سؤال للإنفرا؟</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {loading ? "جاري الحفظ..." : "حفظ السؤال والإجابة"}
          </button>
        </form>

        {errorMsg && (
          <div className="rounded-md bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-100">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-md bg-emerald-900/50 border border-emerald-700 px-4 py-3 text-sm text-emerald-100">
            {successMsg}
          </div>
        )}
      </div>
    </main>
  );
}
