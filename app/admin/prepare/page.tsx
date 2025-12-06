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
  );
}
