"use client";

import { FormEvent, useState } from "react";
import { QaDomain, QaStatus } from "@/lib/types";
<<<<<<< HEAD
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card, CardContent } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/contexts/LanguageContext";
=======
import { MainLayout } from "@/components/layout/MainLayout";
import { Database, CheckCircle, AlertCircle, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
>>>>>>> devops3

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
<<<<<<< HEAD
      setErrorMsg("Question and answer are required");
=======
      setErrorMsg("Question and Answer are required fields.");
>>>>>>> devops3
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
<<<<<<< HEAD
        setErrorMsg(data.error || "An error occurred while saving");
      } else {
        setSuccessMsg(`Successfully saved! ID: ${data.id}`);
        // Reset form
=======
        setErrorMsg(data.error || "An error occurred while saving.");
      } else {
        setSuccessMsg(`Successfully saved. ID: ${data.id}`);
        // Reset fields
>>>>>>> devops3
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
<<<<<<< HEAD
      setErrorMsg("Failed to connect to server");
=======
      setErrorMsg("Failed to connect to the server.");
>>>>>>> devops3
    } finally {
      setLoading(false);
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <MainLayout>
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="container-neo max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-sky-400 mb-2">
                <Link href="/" className="hover:text-sky-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <span className="text-xs font-medium uppercase tracking-wider">Administration</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Add Knowledge Entry</h1>
              <p className="text-slate-400">Manually add new questions and answers to the intelligence database.</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Database className="w-6 h-6 text-sky-400" />
            </div>
          </div>

          {/* Main Form Panel */}
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

              {/* Section 1: Question */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">1</span>
                  Question Details
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Question (Arabic) <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                      rows={2}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="مثال: هل النظام يدعم قفل الحساب بعد عدد محاولات فاشلة؟"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Question (English) <span className="text-slate-500 text-xs">(Optional)</span>
                    </label>
                    <textarea
                      className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                      rows={2}
                      value={questionTextEn}
                      onChange={(e) => setQuestionTextEn(e.target.value)}
                      placeholder="Does the system support account lockout after failed login attempts?"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Answer */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span>
                  Answer & Context
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Standard Answer (English) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                    rows={4}
>>>>>>> devops3
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Yes, the system enforces account lockout after 5 consecutive failed login attempts..."
                  />
                </div>

<<<<<<< HEAD
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
=======
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Explanation (Arabic) <span className="text-slate-500 text-xs">(For learning)</span>
                  </label>
                  <textarea
                    className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                    rows={3}
                    value={explanationAr}
                    onChange={(e) => setExplanationAr(e.target.value)}
                    placeholder="شرح إضافي للفريق..."
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Section 3: Metadata */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">3</span>
                  Classification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all appearance-none"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as QaStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-slate-900">{s}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Domain</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all appearance-none"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value as QaDomain)}
                      >
                        {DOMAIN_OPTIONS.map((d) => (
                          <option key={d} value={d} className="bg-slate-900">{d}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="inline-flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${needsDev ? 'bg-sky-500 border-sky-500' : 'border-slate-600 bg-slate-900/50 group-hover:border-slate-500'}`}>
                      {needsDev && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={needsDev} onChange={(e) => setNeedsDev(e.target.checked)} />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Requires Developer Input</span>
                  </label>

                  <label className="inline-flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${needsInfra ? 'bg-sky-500 border-sky-500' : 'border-slate-600 bg-slate-900/50 group-hover:border-slate-500'}`}>
                      {needsInfra && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={needsInfra} onChange={(e) => setNeedsInfra(e.target.checked)} />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Requires Infrastructure Input</span>
                  </label>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                {successMsg && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm animate-fade-in">
                    <CheckCircle className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="flex items-center gap-2 text-red-400 text-sm animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? "Saving..." : "Save Entry"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </MainLayout>
>>>>>>> devops3
  );
}
