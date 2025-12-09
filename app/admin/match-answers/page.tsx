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
    Eye,
    FileDown
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

interface MatchedAnswer {
    question_text: string;
    status: string;
    answer_text: string;
    source_question: string;
    similarity_score: number;
    match_confidence: "high" | "medium" | "low" | "none";
    domain: string;
}

interface MatchStats {
    totalQuestions: number;
    highMatches: number;
    mediumMatches: number;
    lowMatches: number;
    noMatches: number;
    matches: MatchedAnswer[];
}

export default function MatchAnswersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [threshold, setThreshold] = useState<number>(0.7);
    const [includeAi, setIncludeAi] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchData, setMatchData] = useState<MatchStats | null>(null);

    // Function to download the template
    function handleDownloadTemplate() {
        const ws = XLSX.utils.json_to_sheet([
            { question_text: "Put your security question here" },
            { question_text: "Do you perform regular penetration testing?" },
            { question_text: "Is multi-factor authentication enforced?" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");
        XLSX.writeFile(wb, "question_template.xlsx");
    }

    async function handlePreview(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setMatchData(null);

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
            formData.append("mode", "preview"); // Request JSON preview

            const res = await fetch("/api/admin/qa/match-answers", {
                method: "POST",
                body: formData,
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (!res.ok || !data.ok) {
                    setError(data.error || "Failed to process the Excel file.");
                    return;
                }
                setMatchData(data);
            } else {
                const text = await res.text();
                // console.error("Non-JSON response:", text);
                setError(`Server error: ${res.status} ${res.statusText}`);
            }

        } catch (err: any) {
            console.error("Error submitting form:", err);
            setError(err.message || "Failed to contact server during matching.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDownloadExcel() {
        if (!file) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("threshold", threshold.toString());
            formData.append("includeAi", includeAi.toString());
            formData.append("mode", "download"); // Request Excel File

            const res = await fetch("/api/admin/qa/match-answers", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                // Try to parse error if json
                try {
                    const json = JSON.parse(text);
                    setError(json.error || "Failed to download file");
                } catch (e) {
                    setError(`Server Error: ${res.statusText}`);
                }
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
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to download file.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
                <div className="container-neo max-w-[1400px] mx-auto">
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
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownloadTemplate}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-lg shadow-orange-500/20"
                            >
                                <FileDown className="w-4 h-4" />
                                Download Template
                            </button>
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Column: Upload Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                                    Step 1: Upload
                                </h3>

                                <form onSubmit={handlePreview} className="space-y-6">
                                    {/* File Drop Area */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => {
                                                setFile(e.target.files?.[0] || null);
                                                setMatchData(null);
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

                                    {/* Preview Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !file}
                                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                        {loading ? "Processing..." : "Preview Matches"}
                                    </button>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm text-red-200">
                                            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            {error}
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Instructions */}
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-sky-400" />
                                    How It Works
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">1</div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Upload</h4>
                                            <p className="text-sm text-slate-400">Upload your questions Excel file.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">2</div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Preview</h4>
                                            <p className="text-sm text-slate-400">Review matches found in database.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">3</div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Download</h4>
                                            <p className="text-sm text-slate-400">Get the completed file.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Preview & Results */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* If no data yet, show empty state or instructions */}
                            {!matchData && !loading && (
                                <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full border-dashed border-2 border-white/5 min-h-[400px]">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Sparkles className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-white mb-2">Ready to Match</h3>
                                    <p className="text-slate-400 max-w-md">
                                        Upload your questions file to see AI-powered matches here.
                                        <br />We'll show you a preview before you download the results.
                                    </p>
                                </div>
                            )}

                            {/* Data Preview */}
                            {matchData && (
                                <div className="flex flex-col h-full animate-fade-in">

                                    {/* Stats Bar */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                        <div className="glass-panel p-4 rounded-xl text-center">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total</div>
                                            <div className="text-2xl font-bold text-white">{matchData.totalQuestions}</div>
                                        </div>
                                        <div className="glass-panel p-4 rounded-xl text-center border-emerald-500/20 bg-emerald-500/5">
                                            <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">High Match</div>
                                            <div className="text-2xl font-bold text-emerald-400">{matchData.highMatches}</div>
                                        </div>
                                        <div className="glass-panel p-4 rounded-xl text-center border-amber-500/20 bg-amber-500/5">
                                            <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Medium</div>
                                            <div className="text-2xl font-bold text-amber-400">{matchData.mediumMatches}</div>
                                        </div>
                                        <div className="glass-panel p-4 rounded-xl text-center border-orange-500/20 bg-orange-500/5">
                                            <div className="text-xs text-orange-400 uppercase tracking-wider mb-1">Low</div>
                                            <div className="text-2xl font-bold text-orange-400">{matchData.lowMatches}</div>
                                        </div>
                                        <div className="glass-panel p-4 rounded-xl text-center border-red-500/20 bg-red-500/5">
                                            <div className="text-xs text-red-400 uppercase tracking-wider mb-1">None</div>
                                            <div className="text-2xl font-bold text-red-400">{matchData.noMatches}</div>
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className="glass-panel rounded-2xl p-6 flex-1 overflow-hidden flex flex-col mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white">Matches Preview</h3>
                                            <div className="flex gap-2 text-sm text-slate-400">
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> High</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Medium</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> Low/None</span>
                                            </div>
                                        </div>

                                        <div className="overflow-auto max-h-[500px] border border-white/10 rounded-xl bg-black/20">
                                            <table className="w-full text-sm text-left border-collapse">
                                                <thead className="bg-[#0f172a] text-slate-300 font-medium sticky top-0 z-10 shadow-sm">
                                                    <tr>
                                                        <th className="px-4 py-3 border-b border-white/10 w-12">#</th>
                                                        <th className="px-4 py-3 border-b border-white/10 w-1/3">Question</th>
                                                        <th className="px-4 py-3 border-b border-white/10">Match Status</th>
                                                        <th className="px-4 py-3 border-b border-white/10 w-1/3">Matched Answer snippet</th>
                                                        <th className="px-4 py-3 border-b border-white/10 text-center">Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {matchData.matches.map((row, idx) => {
                                                        let scoreColor = "text-red-400";
                                                        let bgClass = "hover:bg-red-500/5";
                                                        if (row.match_confidence === "high") {
                                                            scoreColor = "text-emerald-400";
                                                            bgClass = "hover:bg-emerald-500/5";
                                                        } else if (row.match_confidence === "medium") {
                                                            scoreColor = "text-amber-400";
                                                            bgClass = "hover:bg-amber-500/5";
                                                        }

                                                        return (
                                                            <tr key={idx} className={`transition-colors ${bgClass}`}>
                                                                <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                                                <td className="px-4 py-3 text-white font-medium">
                                                                    {row.question_text}
                                                                    <div className="text-xs text-slate-500 mt-1">{row.domain}</div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {row.status !== "unknown" ? (
                                                                        <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-medium text-white border border-white/10">
                                                                            {row.status.replace(/_/g, " ")}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-500">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-300">
                                                                    {row.answer_text ? (
                                                                        <div className="line-clamp-2 max-w-xs text-xs">{row.answer_text}</div>
                                                                    ) : (
                                                                        <span className="text-slate-600 italic">No answer matched</span>
                                                                    )}
                                                                    {row.source_question && (
                                                                        <div className="text-[10px] text-sky-400/70 mt-1 truncate max-w-xs">
                                                                            Source: {row.source_question}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={`px-4 py-3 text-center font-bold ${scoreColor}`}>
                                                                    {(row.similarity_score * 100).toFixed(0)}%
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex justify-end p-6 glass-panel rounded-2xl border-t border-white/10">
                                        <button
                                            onClick={handleDownloadExcel}
                                            disabled={loading}
                                            className="btn-primary px-8 py-3 flex items-center justify-center gap-2 font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20"
                                        >
                                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                            Download Matched File
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
