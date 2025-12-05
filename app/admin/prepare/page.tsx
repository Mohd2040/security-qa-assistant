// app/admin/prepare/page.tsx

export default function PrepareFromClientPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Prepare Excel from Client Questions
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            ارفع ملف Excel يحتوي على عمود واحد فقط فيه أسئلة السيكوريتي من
            الكلينت، والنظام سيرجع لك ملف جديد جاهز بنفس قالب الاستيراد (import
            template) مع تعبئة الأعمدة الأساسية ما عدا الإجابة.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-sm">
          <p className="font-semibold mb-1">📌 متطلبات ملف الكلينت:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-200">
            <li>عمود واحد فقط يحتوي على الأسئلة (سطر لكل سؤال).</li>
            <li>
              يمكن أن يحتوي الصف الأول على عنوان مثل{" "}
              <code>Question</code> أو <code>السؤال</code> – سيتم تخطيه.
            </li>
            <li>لا يلزم وجود أي أعمدة أخرى.</li>
          </ul>

          <p className="text-slate-300 mt-3">
            الملف الناتج سيتضمن الأعمدة التالية جاهزة:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-200">
            <li>
              <code>question_text</code> / <code>question_text_en</code>
            </li>
            <li>
              <code>status</code> = <code>unknown</code> (تقدر تعدلها لاحقاً)
            </li>
            <li>
              <code>domain</code> = <code>application</code> (مبدئيًا)
            </li>
            <li>
              <code>owner_group</code> = <code>dev</code> (مبدئيًا)
            </li>
            <li>
              <code>needs_dev_input</code> = <code>TRUE</code>
            </li>
            <li>
              <code>answer_text</code> و <code>explanation_ar</code> تبقى
              فارغة لتعبئتها لاحقاً.
            </li>
          </ul>

          <p className="text-xs text-slate-400 mt-2">
            بعد تنزيل الملف الجاهز، يمكنك تعبئة الإجابات والتصنيفات الإضافية ثم
            رفعه من صفحة{" "}
            <span className="font-semibold">Bulk Import (Excel)</span>.
          </p>
        </div>

        <form
          action="/api/qa/prepare"
          method="POST"
          encType="multipart/form-data"
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4 text-sm"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              اختر ملف أسئلة الكلينت (Excel) *
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
            بعد الضغط على زر التحضير، سيقوم المتصفح بتنزيل ملف Excel جديد جاهز
            للاستخدام في صفحة الاستيراد.
          </p>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors"
          >
            تحضير ملف الأسئلة
          </button>
        </form>
      </div>
    </main>
  );
}
