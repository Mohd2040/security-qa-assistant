"use client";

import { FormEvent, useState } from "react";

type UiLang = "en" | "ar";
type ThemeMode = "dark" | "light";

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
  const [uiLang, setUiLang] = useState<UiLang>("en"); // افتراضي إنجليزي
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const [strategy, setStrategy] = useState<string>("upsert");

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isArabic = uiLang === "ar";
  const isDark = theme === "dark";

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }

  const mainBgClass = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-slate-100 text-slate-900";

  const cardBgClass = isDark
    ? "bg-slate-900/80 border-slate-800"
    : "bg-white border-slate-200";

  const inputBgClass = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-300 text-slate-900";

  async function handlePreview(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setImportResult(null);

    if (!file) {
      const msg = isArabic
        ? "الرجاء اختيار ملف Excel أولاً."
        : "Please choose an Excel file first.";
      setError(msg);
      showToast("error", msg);
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
        const msg =
          data.error ||
          (isArabic
            ? "فشل في عملية المعاينة."
            : "Failed to preview the Excel file.");
        setError(msg);
        showToast("error", msg);
        return;
      }

      setPreview(data as PreviewResponse);
      showToast(
        "success",
        isArabic
          ? "تم إنشاء معاينة للملف بنجاح."
          : "Preview generated successfully."
      );
    } catch (err: any) {
      console.error(err);
      const msg = isArabic
        ? "تعذر الاتصال بالسيرفر أثناء المعاينة."
        : "Failed to contact server during preview.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleImport() {
    setError(null);
    if (!file) {
      const msg = isArabic
        ? "الرجاء اختيار ملف Excel أولاً."
        : "Please choose an Excel file first.";
      setError(msg);
      showToast("error", msg);
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
        const msg =
          data.error ||
          (isArabic
            ? "فشل في عملية الاستيراد."
            : "Failed to import the Excel file.");
        setError(msg);
        showToast("error", msg);
        return;
      }

      setImportResult(data as ImportResponse);
      showToast(
        "success",
        isArabic
          ? "تم استيراد البيانات بنجاح."
          : "Data imported successfully."
      );
    } catch (err: any) {
      console.error(err);
      const msg = isArabic
        ? "تعذر الاتصال بالسيرفر أثناء الاستيراد."
        : "Failed to contact server during import.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoadingImport(false);
    }
  }

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className={`min-h-screen ${mainBgClass} flex justify-center px-4 py-8`}
    >
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className={isArabic ? "text-right" : "text-left"}>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/20 via-emerald-500/20 to-sky-500/20 border border-sky-500/40 px-3 py-1 text-xs text-sky-200 mb-2">
              <span>⚙️</span>
              <span>
                {isArabic
                  ? "لوحة استيراد بيانات الضوابط الأمنية"
                  : "Security controls import console"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isArabic
                ? "استيراد أسئلة السيكوريتي من Excel"
                : "Import Security Q&A from Excel"}
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 max-w-2xl">
              {isArabic
                ? "ارفع ملف Excel يحتوي على الأسئلة (والإجابات إن وجدت). النظام سيعرض معاينة قبل الاستيراد مع التحقق من صحة البيانات ثم يقوم بالإدخال أو التحديث حسب الاستراتيجية التي تختارها."
                : "Upload an Excel file that contains questions (and answers if available). The system will validate and preview the data before importing, then insert or update records according to your chosen strategy."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              <span>{isDark ? "☀️" : "🌙"}</span>
              <span className="opacity-80">
                {isDark
                  ? isArabic
                    ? "وضع فاتح"
                    : "Light mode"
                  : isArabic
                  ? "وضع داكن"
                  : "Dark mode"}
              </span>
            </button>

            {/* Lang toggle */}
            <button
              type="button"
              onClick={() => setUiLang(isArabic ? "en" : "ar")}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              <span>{isArabic ? "EN" : "AR"}</span>
              <span className="opacity-70">
                {isArabic ? "Switch to English" : "تبديل إلى العربية"}
              </span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-900/70 border border-red-700 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={handlePreview}
          className={`rounded-2xl border ${cardBgClass} p-5 md:p-6 shadow-lg shadow-slate-950/40 space-y-5`}
        >
          {/* File input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-100">
              {isArabic ? "ملف Excel" : "Excel file"}
            </label>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setPreview(null);
                  setImportResult(null);
                  setError(null);
                }}
                className={`block w-full text-xs md:text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 ${inputBgClass}`}
              />
              {file && (
                <span className="text-xs text-slate-400 truncate max-w-xs md:max-w-sm">
                  {isArabic ? "الملف المختار:" : "Selected:"}{" "}
                  <span className="text-slate-200 font-mono">
                    {file.name}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isArabic ? (
                <>
                  يجب أن يحتوي الملف على عمود للسؤال باسم{" "}
                  <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded">
                    question_text
                  </span>{" "}
                  أو{" "}
                  <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded">
                    السؤال
                  </span>
                  . الأعمدة الاختيارية:
                  <span className="font-mono">
                    {" "}
                    answer_text, status, domain, owner_group, explanation_ar,
                    client_name, source_file, source_ref
                  </span>
                  .
                </>
              ) : (
                <>
                  The file must contain a question column named{" "}
                  <span className="font-mono bg-slate-200/10 px-1.5 py-0.5 rounded">
                    question_text
                  </span>{" "}
                  or{" "}
                  <span className="font-mono bg-slate-200/10 px-1.5 py-0.5 rounded">
                    السؤال
                  </span>
                  . Optional columns:
                  <span className="font-mono">
                    {" "}
                    answer_text, status, domain, owner_group, explanation_ar,
                    client_name, source_file, source_ref
                  </span>
                  .
                </>
              )}
            </p>
          </div>

          {/* Strategy */}
          <div className="grid gap-4 md:grid-cols-3 text-xs md:text-sm">
            <div>
              <label className="block mb-1 text-slate-100">
                {isArabic ? "إستراتيجية الاستيراد" : "Import strategy"}
              </label>
              <select
                className={`w-full rounded-md px-2 py-1.5 ${inputBgClass}`}
                value={strategy}
                onChange={(e) => {
                  setStrategy(e.target.value);
                  setImportResult(null);
                }}
              >
                <option value="upsert">
                  {isArabic
                    ? "Upsert (تحديث إذا موجود، وإلا إدخال جديد)"
                    : "Upsert (update if exists, otherwise insert)"}
                </option>
                <option value="insertOnly">
                  {isArabic
                    ? "Insert only (إدخال جديد فقط، تخطي الأسئلة الموجودة)"
                    : "Insert only (skip existing questions)"}
                </option>
                <option value="updateExisting">
                  {isArabic
                    ? "Update only (تحديث الموجود فقط، تخطي الأسئلة الجديدة)"
                    : "Update only (update existing only, skip new questions)"}
                </option>
              </select>
            </div>

            <div className="md:col-span-2 text-xs text-slate-400 flex items-center">
              {isArabic ? (
                <p>
                  * يتم اعتبار السؤال مميزًا بالتركيبة:{" "}
                  <span className="font-semibold">
                    question_text + client_name
                  </span>
                  . نفس السؤال مع عميل مختلف مسموح، لكن نفس السؤال مع نفس
                  العميل يعامل كسجل واحد (يتم تحديثه أو تخطيه حسب الاستراتيجية).
                </p>
              ) : (
                <p>
                  * Each question is identified by{" "}
                  <span className="font-semibold">
                    question_text + client_name
                  </span>
                  . Same question with a different client is allowed; same
                  question with the same client is treated as a single record
                  (updated or skipped depending on the strategy).
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loadingPreview || !file}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-sm font-medium transition-colors shadow-sm shadow-sky-900/40"
              >
                {loadingPreview
                  ? isArabic
                    ? "جارٍ إنشاء المعاينة..."
                    : "Generating preview..."
                  : isArabic
                  ? "معاينة (Preview)"
                  : "Preview"}
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={loadingImport || !file}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-medium transition-colors shadow-sm shadow-emerald-900/40"
              >
                {loadingImport
                  ? isArabic
                    ? "جارٍ الاستيراد..."
                    : "Importing..."
                  : isArabic
                  ? "استيراد الآن"
                  : "Import now"}
              </button>
            </div>

            {preview && (
              <div className="text-xs text-slate-300 bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2">
                {isArabic ? "نتائج المعاينة: " : "Preview stats: "}
                <span className="font-mono">
                  {isArabic ? "إجمالي" : "Total"}: {preview.totalRows} |{" "}
                  {isArabic ? "صحيحة" : "Valid"}: {preview.validRows} |{" "}
                  {isArabic ? "غير صحيحة" : "Invalid"}: {preview.invalidRows}
                </span>
              </div>
            )}
          </div>
        </form>

        {/* Preview table */}
        {preview && (
          <div className={`rounded-2xl border ${cardBgClass} p-4 md:p-5 space-y-3`}>
            <h2 className="text-lg font-semibold">
              {isArabic ? "معاينة أول 10 صفوف" : "Preview of first 10 rows"}
            </h2>
            <p className="text-xs text-slate-400">
              {isArabic
                ? "الصفوف التي تحتوي على أخطاء لن يتم استيرادها. يمكنك استخدام رقم الصف لتصحيح الملف في Excel."
                : "Rows with validation errors will not be imported. Use the row number to fix them in Excel."}
            </p>

            <div className="overflow-auto border border-slate-800 rounded-md text-xs max-h-72">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/80">
                    <th className="border border-slate-800 px-2 py-1 text-left">
                      #
                    </th>
                    <th className="border border-slate-800 px-2 py-1 text-left">
                      question_text
                    </th>
                    <th className="border border-slate-800 px-2 py-1 text-left">
                      status
                    </th>
                    <th className="border border-slate-800 px-2 py-1 text-left">
                      domain
                    </th>
                    <th className="border border-slate-800 px-2 py-1 text-left">
                      client_name
                    </th>
                    <th className="border border-slate-800 px-2 py-1 text-left">
                      errors
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.errors.length > 0
                          ? "bg-red-900/25"
                          : "bg-slate-900/40"
                      }
                    >
                      <td className="border border-slate-800 px-2 py-1">
                        {row.rowNumber}
                      </td>
                      <td className="border border-slate-800 px-2 py-1">
                        {row.data.question_text}
                      </td>
                      <td className="border border-slate-800 px-2 py-1">
                        {row.data.status || "unknown"}
                      </td>
                      <td className="border border-slate-800 px-2 py-1">
                        {row.data.domain || ""}
                      </td>
                      <td className="border border-slate-800 px-2 py-1">
                        {row.data.client_name || ""}
                      </td>
                      <td className="border border-slate-800 px-2 py-1 text-red-200">
                        {row.errors.join(" | ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <div className={`rounded-2xl border ${cardBgClass} p-4 md:p-5 space-y-3`}>
            <h2 className="text-lg font-semibold">
              {isArabic ? "نتائج عملية الاستيراد" : "Import results"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
              <StatBox
                label={isArabic ? "إجمالي الصفوف" : "Total rows"}
                value={importResult.totalRows}
                colorClass="text-slate-100"
              />
              <StatBox
                label={isArabic ? "صفوف صحيحة" : "Valid rows"}
                value={importResult.validRows}
                colorClass="text-emerald-300"
              />
              <StatBox
                label={isArabic ? "صفوف غير صحيحة" : "Invalid rows"}
                value={importResult.invalidRows}
                colorClass="text-red-300"
              />
              <StatBox
                label={isArabic ? "تم إدخالها (جديدة)" : "Inserted (new)"}
                value={importResult.imported}
                colorClass="text-emerald-300"
              />
              <StatBox
                label={isArabic ? "تم تحديثها" : "Updated"}
                value={importResult.updated}
                colorClass="text-sky-300"
              />
              <StatBox
                label={isArabic ? "تم تخطيها" : "Skipped"}
                value={importResult.skippedExisting}
                colorClass="text-yellow-300"
              />
            </div>

            {importResult.errorsSample &&
              importResult.errorsSample.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-slate-400">
                    {isArabic
                      ? "أمثلة على الصفوف التي تحتوي على أخطاء (للتصحيح اليدوي في الملف):"
                      : "Sample of rows with errors (for manual correction in the file):"}
                  </p>
                  <div className="overflow-auto border border-slate-800 rounded-md text-xs max-h-64">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80">
                          <th className="border border-slate-800 px-2 py-1 text-left">
                            #
                          </th>
                          <th className="border border-slate-800 px-2 py-1 text-left">
                            question_text
                          </th>
                          <th className="border border-slate-800 px-2 py-1 text-left">
                            errors
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errorsSample.map((row, idx) => (
                          <tr key={idx} className="bg-red-900/30">
                            <td className="border border-slate-800 px-2 py-1">
                              {row.rowNumber}
                            </td>
                            <td className="border border-slate-800 px-2 py-1">
                              {row.data.question_text}
                            </td>
                            <td className="border border-slate-800 px-2 py-1 text-red-200">
                              {row.errors.join(" | ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 max-w-sm px-4 py-2 rounded-md text-xs md:text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}

function StatBox({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg bg-slate-900/75 border border-slate-800 px-3 py-2">
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className={`font-mono text-base ${colorClass}`}>{value}</div>
    </div>
  );
}
