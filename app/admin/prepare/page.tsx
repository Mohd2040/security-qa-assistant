<<<<<<< HEAD
// app/admin/prepare/page.tsx
"use client";

import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function PrepareFromClientPage() {
  const { t } = useLanguage();
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950">
        <Container className="py-8">
          <PageHeader
            title="Prepare Client Questions"
            titleEn="تحضير أسئلة العملاء"
            description="Upload an Excel file with a single column containing security questions from the client, and get back a ready-to-import template with all meta fields pre-filled (except answers)."
            icon={<FileSpreadsheet className="w-6 h-6 text-fuchsia-400" />}
          />

          <div className="mt-8 space-y-6">
            {/* Requirements Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card variant="glass" padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-fuchsia-400" />
                  Client File Requirements
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-1">•</span>
                    <span>
                      A single column containing questions (one question per row).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-1">•</span>
                    <span>
                      The first row can contain a header like <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">Question</code> or <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">السؤال</code> - it will be skipped.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-1">•</span>
                    <span>
                      No other columns are required.
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h4 className="font-semibold text-white mb-3">Output File Will Include:</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">question_text</code> / <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">question_text_en</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">status</code> = <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">unknown</code> (you can edit later)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">domain</code> = <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">application</code> (initially)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">owner_group</code> = <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">dev</code> (initially)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">needs_dev_input</code> = <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">TRUE</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">answer_text</code> and <code className="px-2 py-0.5 rounded bg-slate-800/50 text-fuchsia-300">explanation_ar</code> remain empty for you to fill later.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-fuchsia-300">Tip:</strong> After downloading the prepared file, you can fill in the answers and additional classifications, then upload it from the <span className="font-semibold text-white">Bulk Import (Excel)</span> page.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Upload Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card variant="glass" padding="lg">
                <form
                  action="/api/qa/prepare"
                  method="POST"
                  encType="multipart/form-data"
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-3 text-slate-200">
                      Select Client Questions File (Excel) *
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept=".xlsx,.xls"
                      required
                      className="w-full text-sm text-slate-100 file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-fuchsia-600 file:to-pink-600 file:text-white hover:file:from-fuchsia-500 hover:file:to-pink-500 file:transition-all file:cursor-pointer cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Note:</strong> After clicking the prepare button, your browser will download a new Excel file ready to use on the import page.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<FileSpreadsheet className="w-5 h-5" />}
                  >
                    Prepare Questions File
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
=======
"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileSpreadsheet, Download, ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PrepareFromClientPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/qa/prepare', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process file');
      }

      // Handle file download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qa_prepared_from_client.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
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
              <h1 className="text-3xl font-bold text-white mb-2">Prepare Data Template</h1>
              <p className="text-slate-400">Convert raw client questions into a system-compatible Excel format.</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Instructions Panel */}
            <div className="glass-panel rounded-2xl p-8 h-full">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                How it works
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">1</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Upload Client File</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Upload an Excel file containing a single column of questions. The system ignores headers automatically.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">2</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Auto-Formatting</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      The system will generate a new Excel file with all required columns (status, domain, etc.) pre-filled with default values.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">3</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Download & Edit</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Download the prepared file, fill in the answers, and then use the <Link href="/admin/import" className="text-sky-400 hover:underline">Bulk Import</Link> tool.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Output Columns</h5>
                <div className="flex flex-wrap gap-2">
                  {['question_text', 'status', 'domain', 'owner_group', 'needs_dev_input'].map(col => (
                    <span key={col} className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-200 text-xs font-mono border border-purple-500/20">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload Form Panel */}
            <div className="glass-panel rounded-2xl p-8 flex flex-col justify-center h-full relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

              <form
                onSubmit={handleSubmit}
                className="relative z-10 space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 border border-white/10">
                  <Upload className="w-10 h-10 text-slate-400" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Raw Questions</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Select the Excel file (.xlsx) containing the client's questions list.
                  </p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls"
                    required
                    className="block w-full text-sm text-slate-300
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-600 file:text-white
                      hover:file:bg-purple-500
                      file:cursor-pointer cursor-pointer"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-sm text-red-200">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 py-3.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {loading ? 'Processing...' : 'Process & Download'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
>>>>>>> devops3
  );
}
