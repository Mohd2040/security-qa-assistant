// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Security Q&A Assistant
            </h1>
            <p className="mt-2 text-slate-300 text-sm md:text-base">
              A smart workspace to manage, search, and grow your security
              questionnaire knowledge base.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Environment
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/60 bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Internal Tool – In Progress
            </span>
          </div>
        </header>

        {/* Quick actions */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/search"
            className="group rounded-2xl border border-sky-700/60 bg-sky-950/40 p-4 hover:border-sky-400 hover:bg-sky-900/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-200 text-lg">
                🔍
              </div>
              <div>
                <h2 className="text-lg font-semibold">Search Q&amp;A</h2>
                <p className="text-sm text-slate-200">
                  Ask a security question (Arabic or English) and find the closest
                  approved answer.
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-sky-200/80 group-hover:text-sky-100 flex items-center gap-1">
              <span>Go to search</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/qa"
            className="group rounded-2xl border border-emerald-700/60 bg-emerald-950/40 p-4 hover:border-emerald-400 hover:bg-emerald-900/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-lg">
                ✍️
              </div>
              <div>
                <h2 className="text-lg font-semibold">Add Single Q&amp;A</h2>
                <p className="text-sm text-slate-200">
                  Manually add or update one question and answer with status, domain,
                  and Arabic explanation.
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-emerald-200/80 group-hover:text-emerald-100 flex items-center gap-1">
              <span>Open admin form</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/import"
            className="group rounded-2xl border border-amber-700/60 bg-amber-950/40 p-4 hover:border-amber-400 hover:bg-amber-900/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-lg">
                📂
              </div>
              <div>
                <h2 className="text-lg font-semibold">Bulk Import (Excel)</h2>
                <p className="text-sm text-slate-200">
                  Upload an Excel file with multiple questions and answers to populate
                  your knowledge base in one go.
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-amber-200/80 group-hover:text-amber-100 flex items-center gap-1">
              <span>Import from Excel</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/prepare"
            className="group rounded-2xl border border-fuchsia-700/60 bg-fuchsia-950/40 p-4 hover:border-fuchsia-400 hover:bg-fuchsia-900/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-200 text-lg">
                🧩
              </div>
              <div>
                <h2 className="text-lg font-semibold">Prepare Client Questions</h2>
                <p className="text-sm text-slate-200">
                  Upload a one-column Excel file from the client and get back a ready
                  Q&amp;A import template with all meta fields prefilled (except
                  answers).
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-fuchsia-200/80 group-hover:text-fuchsia-100 flex items-center gap-1">
              <span>Prepare Excel</span>
              <span>→</span>
            </div>
          </Link>
        </section>
        {/* Info / tips */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-200">
          <h3 className="font-semibold text-slate-100 text-base">
            How to use this tool
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Start with <span className="font-semibold">Search Q&amp;A</span>{" "}
              to reuse existing approved answers before writing something new.
            </li>
            <li>
              Use <span className="font-semibold">Add Single Q&amp;A</span> when
              you receive a new question and have a confirmed answer.
            </li>
            <li>
              Use <span className="font-semibold">Bulk Import (Excel)</span> to
              import legacy spreadsheets from your team or vendor.
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            لاحقًا ممكن نضيف تكامل مع الذكاء الاصطناعي (AI Agent) لتوليد
            إجابات أولية واقتراح أسئلة للديفلوبرز والإنفرا بشكل أوتوماتيكي.
          </p>
        </section>
      </div>
    </main>
  );
}
