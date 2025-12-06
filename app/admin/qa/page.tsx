// app/admin/qa/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { QaDomain, QaStatus } from "@/lib/types";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card, CardContent } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/contexts/LanguageContext";

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
  "strategy",
  "management",
  "operations",
  "governance",
  "other",
];

export default function AdminQaPage() {
  const { t } = useLanguage();
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
      setErrorMsg("Question and answer are required");
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
        setErrorMsg(data.error || "An error occurred while saving");
      } else {
        setSuccessMsg(`Successfully saved! ID: ${data.id}`);
        // Reset form
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
      setErrorMsg("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950">
        <Container className="py-8">
          <PageHeader
            title="Add Security Q&A"
            titleEn="إضافة سؤال وجواب أمني"
            description="From here you can add new questions and answers to the database, which will then appear in the main search page."
            icon={<Plus className="w-6 h-6 text-indigo-400" />}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Card variant="glass" padding="lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Arabic */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Question (Arabic) *
                  </label>
                  <textarea
                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Example: هل النظام يدعم قفل الحساب بعد عدد محاولات فاشلة؟"
                  />
                </div>

                {/* Question English */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Question (English) - Optional
                  </label>
                  <textarea
                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    rows={3}
                    value={questionTextEn}
                    onChange={(e) => setQuestionTextEn(e.target.value)}
                    placeholder="Does the system support account lockout after failed login attempts?"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Answer (usually English) *
                  </label>
                  <textarea
                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    rows={5}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Yes, the system enforces account lockout after 5 consecutive failed login attempts..."
                  />
                </div>

                {/* Status & Domain */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-200">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    <label className="block text-sm font-medium mb-2 text-slate-200">
                      Domain
                    </label>
                    <select
                      className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">
                    Simple Explanation (Arabic) - Optional
                  </label>
                  <textarea
                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    rows={3}
                    value={explanationAr}
                    onChange={(e) => setExplanationAr(e.target.value)}
                    placeholder="هذه الخاصية تمنع محاولات التخمين على كلمة المرور..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      checked={needsDev}
                      onChange={(e) => setNeedsDev(e.target.checked)}
                    />
                    <span className="text-sm text-slate-300">
                      Needs developer input?
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      checked={needsInfra}
                      onChange={(e) => setNeedsInfra(e.target.checked)}
                    />
                    <span className="text-sm text-slate-300">
                      Needs infrastructure input?
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    icon={<CheckCircle className="w-5 h-5" />}
                  >
                    {loading ? "Saving..." : "Save Q&A Entry"}
                  </Button>
                </div>
              </form>

              {/* Messages */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{errorMsg}</p>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-200">{successMsg}</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
