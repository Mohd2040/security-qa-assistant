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
  skippedDuplicates?: number;
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

  const handleDownloadTemplate = () => {
    window.location.href = "/api/admin/qa/template";
  };

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
        <div className="container-neo max-w-6xl mx-auto">

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
              <p className="text-slate-400">Manage and upload your security controls database securely.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Instructions & Template (4 cols) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Step 1: Download Template */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-sky-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-sky-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Download Template</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Start by downloading the official Excel template. It contains the required structure and sample data.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="btn-glass w-full py-3 flex items-center justify-center gap-2 text-sky-300 hover:text-sky-200"
                >
                  <FileSpreadsheet className="w-5 h-5 text-orange-400" />
                  Download Standard Template
                </button>
              </div>

              {/* Step 2: Rules */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-indigo-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Fill Data</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Fill in your data following these strict rules to ensure data integrity:
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300"><strong className="text-white">Question (En):</strong> Required. Must be unique.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-slate-400">opt</div>
                    <span className="text-slate-300"><strong className="text-white">Question (Ar):</strong> Literal translation.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300"><strong className="text-white">Status:</strong> Required. Allowed: applied, not applied, not applicable, unknown.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-slate-400">opt</div>
                    <span className="text-slate-400">Arabic Explanation, Domain...</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-slate-400">opt</div>
                    <span className="text-slate-400">Domain, Owner, Answer, Source...</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Right Column: Upload & Preview (8 cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Step 3: Upload */}
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-400">3</div>
                    <h3 className="text-lg font-bold text-white">Upload & Verify</h3>
                  </div>
                  {/* Strategy Select */}
                  <div className="relative w-56">
                    <select
                      className="w-full bg-[#0f172a] border border-orange-500/30 rounded-lg pl-3 pr-10 py-2.5 text-orange-200 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 appearance-none transition-all shadow-lg shadow-orange-900/10 cursor-pointer hover:border-orange-500/50"
                      value={strategy}
                      onChange={(e) => {
                        setStrategy(e.target.value);
                        setImportResult(null);
                      }}
                    >
                      <option value="upsert">Upsert (Update/Insert)</option>
                      <option value="insertOnly">Insert New Only</option>
                      <option value="updateExisting">Update Existing Only</option>
                    </select>
                    <Settings className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                  </div>
                </div>

                <form onSubmit={handlePreview}>
                  {/* File Drop Area */}
                  <div className="relative group mb-6">
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
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-emerald-500 bg-emerald-500/5' : 'border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/5'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${file ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                        <Upload className={`w-6 h-6 ${file ? 'text-emerald-400' : 'text-orange-400'}`} />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">
                        {file ? file.name : "Click or drag your filled template here"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Supports .xlsx, .xls
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loadingPreview || !file}
                      className="btn-glass flex-1 py-3 flex items-center justify-center gap-2 font-medium hover:bg-white/10 disabled:opacity-50"
                    >
                      {loadingPreview ? <RefreshCw className="w-4 h-4 animate-spin text-orange-400" /> : <FileText className="w-4 h-4 text-orange-400" />}
                      Generate Preview
                    </button>
                    {preview && !importResult && (
                      <button
                        type="button"
                        onClick={handleImport}
                        disabled={loadingImport || !file || preview.invalidRows > 0 && preview.validRows === 0}
                        className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:grayscale"
                      >
                        {loadingImport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Confirm & Import
                      </button>
                    )}
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm text-red-200 animate-fade-in">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

              </div>

              {/* Results Area */}
              <div className="space-y-6">
                {/* Preview Section */}
                {preview && !importResult && (
                  <div className="glass-panel rounded-2xl p-6 animate-fade-in border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preview Results</h3>
                      <div className="flex gap-4 text-xs">
                        <span className="text-slate-400">Total: <b className="text-white">{preview.totalRows}</b></span>
                        <span className="text-emerald-400">Valid: <b>{preview.validRows}</b></span>
                        <span className="text-red-400">Invalid: <b>{preview.invalidRows}</b></span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/5 text-slate-400 font-medium text-xs uppercase">
                            <tr>
                              <th className="px-4 py-3">Row</th>
                              <th className="px-4 py-3">Question</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Issues</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {preview.sampleRows.map((row, idx) => (
                              <tr key={idx} className={row.errors.length > 0 ? "bg-red-500/5" : "hover:bg-white/5"}>
                                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{row.rowNumber}</td>
                                <td className="px-4 py-3 text-white max-w-[200px] truncate" title={row.data.question_text}>
                                  {row.data.question_text}
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-xs">
                                  <span className={`px-2 py-1 rounded-full ${row.data.status === 'applied' ? 'bg-emerald-500/20 text-emerald-400' :
                                    row.data.status === 'not_applied' ? 'bg-red-500/20 text-red-400' :
                                      'bg-slate-700 text-slate-300'
                                    }`}>
                                    {(row.data.status || '-').replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-red-400 text-xs">
                                  {row.errors.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {row.errors[0]} {row.errors.length > 1 && `+${row.errors.length - 1} more`}
                                    </div>
                                  ) : (
                                    <CheckCircle className="w-4 h-4 text-emerald-500/50" />
                                  )}
                                </td>
                              </tr>
                            ))}
                            {preview.totalRows > preview.sampleRows.length && (
                              <tr>
                                <td colSpan={4} className="px-4 py-2 text-center text-xs text-slate-500 italic">
                                  ... and {preview.totalRows - preview.sampleRows.length} more rows
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {preview.invalidRows > 0 && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>Found <b>{preview.invalidRows}</b> invalid rows. These will be skipped during import. Please correct them in your file and upload again if needed.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Results Section */}
                {importResult && (
                  <div className="glass-panel rounded-2xl p-6 animate-fade-in border border-emerald-500/30 bg-emerald-950/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Import Successful</h3>
                        <p className="text-sm text-emerald-200/70">Your data has been processed and saved.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <StatBox label="Total Processed" value={importResult.totalRows} />
                      <StatBox label="Valid" value={importResult.validRows} color="text-emerald-400" />
                      <StatBox label="Imported/Updated" value={importResult.imported + importResult.updated} color="text-sky-400" />
                      <StatBox label="Skipped (Duplicates)" value={importResult.skippedDuplicates || 0} color="text-amber-400" />
                      <StatBox label="Failed" value={importResult.invalidRows - (importResult.skippedDuplicates || 0)} color="text-red-400" />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => { setImportResult(null); setPreview(null); setFile(null); }}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        Import Another File
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatBox({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#0f172a]/50 rounded-xl p-4 border border-white/5 text-center">
      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
