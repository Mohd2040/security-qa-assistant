// app/admin/import/page.tsx
"use client";

import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function ImportQaPage() {
  const { t } = useLanguage();
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950">
        <Container className="py-8">
          <PageHeader
            title="Bulk Import from Excel"
            titleEn="استيراد جماعي من Excel"
            description="Upload an Excel file containing approved questions and answers, and import them all at once into the database."
            icon={<Upload className="w-6 h-6 text-amber-400" />}
          />

          <div className="mt-8 space-y-6">
            {/* Template Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card variant="glass" padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  Required Excel Format
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  The first row must contain headers (in English) with the following names:
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">question_text</code> – Question (Arabic or English)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">question_text_en</code> – Question in English (optional)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">answer_text</code> – Approved answer (usually English)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">status</code> – One of: applied / not_applied / not_applicable / unknown
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">domain</code> – One of: application / database / network / cloud / process
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">explanation_ar</code> – Simple explanation in Arabic (optional)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">needs_dev_input</code> – TRUE/FALSE or 1/0 (optional)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <code className="px-2 py-0.5 rounded bg-slate-800/50 text-amber-300">needs_infra_input</code> – TRUE/FALSE or 1/0 (optional)
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <p className="text-sm text-slate-300 mb-3">
                    You can download a ready template with these columns:
                  </p>
                  <a href="/api/qa/template">
                    <Button variant="secondary" size="md" icon={<Download className="w-4 h-4" />}>
                      Download Excel Template
                    </Button>
                  </a>
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
                  action="/api/qa/import"
                  method="POST"
                  encType="multipart/form-data"
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-3 text-slate-200">
                      Select Excel File to Import *
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept=".xlsx,.xls"
                      required
                      className="w-full text-sm text-slate-100 file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-amber-600 file:to-orange-600 file:text-white hover:file:from-amber-500 hover:file:to-orange-500 file:transition-all file:cursor-pointer cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Note:</strong> When you click the import button, the browser will send the file to the server.
                      After processing, a new Excel file will be downloaded containing the import result for each row (success / error / error message).
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<Upload className="w-5 h-5" />}
                  >
                    Import File Now
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
