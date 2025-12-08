"use client";

import { FormEvent, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Upload,
    FileSpreadsheet,
    Download,
    ArrowLeft,
    Settings,
    RefreshCw,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
} from "lucide-react";
import Link from "next/link";

interface MatchStats {
    totalQuestions: number;
    highMatches: number;
    mediumMatches: number;
    lowMatches: number;
    noMatches: number;
}

export default function MatchAnswersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [threshold, setThreshold] = useState<number>(0.7);
    const [includeAi, setIncludeAi] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    async function handleMatch(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!file) {
            setError("Please choose an Excel file first.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("threshold", threshold.toString());
            formData.append("includeAi", includeAi.toString());

            const res = await fetch("/api/admin/qa/match-answers", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to process the Excel file.");
                return;
            }

            // Download the Excel file
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${file.name.replace(".xlsx", "")}_matched.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError("Failed to contact server during matching.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
                <div className="container-neo max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-purple-400 mb-2">
                                <Link href="/" className="hover:text-purple-300 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                                <span className="text-xs font-medium uppercase tracking-wider">
                                    Administration
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Smart Answer Matching
                            </h1>
                            <p className="text-slate-400">
                                Upload questions and get auto-matched answers from your knowledge base.
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Upload Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                                    Upload Questions
                                </h3>

                                <form onSubmit={handleMatch} className="space-y-6">
                                    {/* File Drop Area */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => {
                                                setFile(e.target.files?.[0] || null);
                                                setSuccess(false);
                                                setError(null);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file
                                                    ? "border-purple-500 bg-purple-500/5"
                                                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                <Upload
                                                    className={`w-6 h-6 ${file ? "text-purple-400" : "text-slate-400"
                                                        }`}
                                                />
                                            </div>
                                            <p className="text-sm font-medium text-white mb-1">
                                                {file ? file.name : "Click or drag file here"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Supports .xlsx, .xls
                                            </p>
                                        </div>
                                    </div>

                                    {/* Threshold Slider */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Similarity Threshold
                                            </label>
                                            <span className="text-sm font-bold text-purple-400">
                                                {(threshold * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.6"
                                            max="0.9"
                                            step="0.05"
                                            value={threshold}
                                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Matches with {(threshold * 100).toFixed(0)}%+ similarity will be included
                                        </p>
                                    </div>

                                    {/* AI Suggestions Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            <span className="text-sm font-medium text-white">
                                                Include AI Suggestions
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={includeAi}
                                                onChange={(e) => setIncludeAi(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !file}
                                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        {loading ? "Processing..." : "Match & Download"}
                                    </button>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm text-red-200">
                                            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-sm text-emerald-200">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                            File downloaded successfully! Review and proceed to import.
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Instructions & Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* How it Works */}
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-sky-400" />
                                    How It Works
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Upload Questions</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Upload an Excel file containing questions (single column or with headers).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Semantic Matching</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                System searches database for similar questions using AI semantic search
                                                (70%+ similarity by default).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Download Results</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Get Excel with matched answers, source questions, and similarity scores.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">
                                            4
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Review & Import</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Review the file offline, then use{" "}
                                                <Link
                                                    href="/admin/import"
                                                    className="text-purple-400 hover:underline"
                                                >
                                                    Bulk Import
                                                </Link>{" "}
                                                to add to database.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Match Confidence Legend */}
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    Match Confidence Levels
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-emerald-300">
                                                High (≥85%)
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Very confident match - safe to auto-fill
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-amber-300">
                                                Medium ({(threshold * 100).toFixed(0)}%-84%)
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Good match - review recommended
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <Info className="w-5 h-5 text-orange-400 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-orange-300">
                                                Low (50%-{(threshold * 100 - 1).toFixed(0)}%)
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Weak match - manual review needed
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-red-300">
                                                None (&lt;50%)
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                No match found - manual input required
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
