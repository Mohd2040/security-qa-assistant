"use client";

import { FormEvent, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, Settings, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
}

interface PreviewResponse {
  ok: boolean;
  mode: "preview";
  totalRows: number;
  validRows: number;
  invalidRows: number;
  sampleRows: ParsedRow[];
}

interface ImportResponse {
  ok: boolean;
  mode: "import";
  totalRows: number;
  validRows: number;
  invalidRows: number;
  imported: number;
  updated: number;
  skippedExisting: number;
  errorsSample: ParsedRow[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<string>("upsert");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePreview(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setImportResult(null);

    if (!file) {
      setError("Please choose an Excel file first.");
      return;
    }

    try {
      setLoadingPreview(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "preview");
      formData.append("strategy", strategy);

      const res = await fetch("/api/admin/qa/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to preview the Excel file.");
        return;
      }

      setPreview(data as PreviewResponse);
    } catch (err: any) {
      console.error(err);
      setError("Failed to contact server during preview.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleImport() {
    setError(null);
    if (!file) {
      setError("Please choose an Excel file first.");
      return;
    }

    try {
      setLoadingImport(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "import");
      formData.append("strategy", strategy);

      const res = await fetch("/api/admin/qa/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to import the Excel file.");
        return;
      }

      setImportResult(data as ImportResponse);
    } catch (err: any) {
      console.error(err);
      setError("Failed to contact server during import.");
    } finally {
      setLoadingImport(false);
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="container-neo max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-sky-400 mb-2">
                <Link href="/" className="hover:text-sky-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <span className="text-xs font-medium uppercase tracking-wider">Administration</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Bulk Import</h1>
              <p className="text-slate-400">Upload Excel files to bulk insert or update security questions.</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Upload className="w-6 h-6 text-sky-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Upload Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                  Upload File
                </h3>

                <form onSubmit={handlePreview} className="space-y-6">
                  {/* File Drop Area (Simulated) */}
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setPreview(null);
                        setImportResult(null);
                        setError(null);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-sky-500 bg-sky-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Upload className={`w-6 h-6 ${file ? 'text-sky-400' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">
                        {file ? file.name : "Click or drag file here"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Supports .xlsx, .xls
                      </p>
                    </div>
                  </div>

                  {/* Strategy Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Import Strategy</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all appearance-none"
                        value={strategy}
                        onChange={(e) => {
                          setStrategy(e.target.value);
                          setImportResult(null);
                        }}
                      >
                        <option value="upsert">Upsert (Update or Insert)</option>
                        <option value="insertOnly">Insert Only (Skip existing)</option>
                        <option value="updateExisting">Update Only (Skip new)</option>
                      </select>
                      <Settings className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={loadingPreview || !file}
                      className="btn-glass w-full py-3 flex items-center justify-center gap-2 font-medium hover:bg-white/10 disabled:opacity-50"
                    >
                      {loadingPreview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Generate Preview
                    </button>

                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={loadingImport || !file}
                      className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    >
                      {loadingImport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Start Import
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm text-red-200">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Column: Preview & Results */}
            <div className="lg:col-span-2 space-y-6">

              {/* Preview Section */}
              {preview && !importResult && (
                <div className="glass-panel rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">File Preview</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-slate-400">Total: <b className="text-white">{preview.totalRows}</b></span>
                      <span className="text-emerald-400">Valid: <b>{preview.validRows}</b></span>
                      <span className="text-red-400">Invalid: <b>{preview.invalidRows}</b></span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-slate-300 font-medium">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Question</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Domain</th>
                            <th className="px-4 py-3">Errors</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {preview.sampleRows.map((row, idx) => (
                            <tr key={idx} className={row.errors.length > 0 ? "bg-red-500/5" : "hover:bg-white/5"}>
                              <td className="px-4 py-3 text-slate-500">{row.rowNumber}</td>
                              <td className="px-4 py-3 text-white max-w-xs truncate" title={row.data.question_text}>
                                {row.data.question_text}
                              </td>
                              <td className="px-4 py-3 text-slate-300">{row.data.status || '-'}</td>
                              <td className="px-4 py-3 text-slate-300">{row.data.domain || '-'}</td>
                              <td className="px-4 py-3 text-red-400 text-xs">
                                {row.errors.join(", ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results Section */}
              {importResult && (
                <div className="glass-panel rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Import Completed</h3>
                      <p className="text-sm text-slate-400">The operation finished successfully.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <StatBox label="Total Processed" value={importResult.totalRows} />
                    <StatBox label="New Inserted" value={importResult.imported} color="text-emerald-400" />
                    <StatBox label="Updated" value={importResult.updated} color="text-sky-400" />
                    <StatBox label="Skipped" value={importResult.skippedExisting} color="text-amber-400" />
                    <StatBox label="Invalid" value={importResult.invalidRows} color="text-red-400" />
                  </div>

                  {importResult.errorsSample.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-red-300 mb-3">Error Log (Sample)</h4>
                      <div className="bg-red-950/30 rounded-xl border border-red-500/20 p-4 max-h-48 overflow-y-auto text-xs font-mono text-red-200">
                        {importResult.errorsSample.map((row, i) => (
                          <div key={i} className="mb-1 border-b border-red-500/10 pb-1 last:border-0">
                            Row {row.rowNumber}: {row.errors.join(" | ")}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!preview && !importResult && (
                <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full border-dashed border-2 border-white/5">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Ready to Import</h3>
                  <p className="text-slate-400 max-w-sm">
                    Select an Excel file from the left panel to preview and import data into the system.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatBox({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
