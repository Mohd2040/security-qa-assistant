// app/admin/import/page.tsx

export default function ImportQaPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Admin – استيراد أسئلة من ملف Excel
          </h1>
          <p className="text-slate-300 text-sm">
            من هنا تقدر ترفع ملف Excel يحتوي على الأسئلة والأجوبة المعتمدة، وسيتم
            استيرادها مرة واحدة إلى قاعدة البيانات. بعد الاستيراد، سيقوم
            النظام بتحميل ملف Excel جديد فيه نتيجة الاستيراد (كل صف تم/فشل).
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-sm">
          <p className="font-semibold mb-1">📌 شكل ملف Excel المطلوب:</p>
          <p className="text-slate-300">
            السطر الأول يجب أن يكون عناوين أعمدة (Headers) بالأسماء التالية
            بالإنجليزي:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-200 mt-2">
            <li><code>question_text</code> – السؤال (عربي أو إنجليزي)</li>
            <li><code>question_text_en</code> – السؤال بالإنجليزي (اختياري)</li>
            <li><code>answer_text</code> – الإجابة المعتمدة (غالباً إنجليزي)</li>
            <li><code>status</code> – واحدة من: applied / not_applied / not_applicable / unknown</li>
            <li><code>domain</code> – واحدة من: application / database / network / cloud / process</li>
            <li><code>explanation_ar</code> – شرح مبسّط بالعربي (اختياري)</li>
            <li><code>needs_dev_input</code> – TRUE/FALSE أو 1/0 (اختياري)</li>
            <li><code>needs_infra_input</code> – TRUE/FALSE أو 1/0 (اختياري)</li>
            <li><code>source_file</code> – اسم الملف الأصلي (اختياري)</li>
            <li><code>source_ref</code> – رقم البند/المرجع في الملف الأصلي (اختياري)</li>
          </ul>

          <p className="text-slate-300 mt-3">
            تقدر تنزل قالب جاهز بهذي الأعمدة وتلصق فيه بياناتك:
          </p>
          <a
            href="/api/qa/template"
            className="inline-flex items-center px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-medium transition-colors"
          >
            تحميل قالب Excel جاهز
          </a>
        </div>

        <form
          action="/api/qa/import"
          method="POST"
          encType="multipart/form-data"
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4 text-sm"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              اختر ملف Excel للاستيراد *
            </label>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls"
              required
              className="w-full text-sm text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
            />
          </div>

          <p className="text-slate-400 text-xs">
            عند الضغط على زر الاستيراد، سيقوم المتصفح بإرسال الملف إلى السيرفر.
            بعد الانتهاء، سيتم تحميل ملف Excel جديد يحتوي على نتيجة الاستيراد
            لكل صف (تم / خطأ / رسالة الخطأ).
          </p>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors"
          >
            استيراد الملف الآن
          </button>
        </form>
      </div>
    </main>
  );
}
