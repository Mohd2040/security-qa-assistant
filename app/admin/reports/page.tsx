"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Database, Trash2, RefreshCw, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

interface DuplicateGroup {
    key: string;
    field: string;
    count: number;
    ids: string[];
    documents: {
        _id: string;
        question_text: string;
        question_text_en?: string;
        created_at?: string;
        updated_at?: string;
        willKeep: boolean;
    }[];
}

interface Summary {
    totalEntries: number;
    uniqueQuestions: number;
    duplicateGroups: number;
    duplicateEntries: number;
    deletedCount: number;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [field, setField] = useState<'question_text_en' | 'question_text'>('question_text_en');
    const [summary, setSummary] = useState<Summary | null>(null);
    const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    // Data Explorer State
    const [entries, setEntries] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // Custom page size
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [explorerLoading, setExplorerLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // Selection state

    React.useEffect(() => {
        fetchEntries();
    }, [page, searchQuery, limit]); // Refetch when limit changes

    const fetchEntries = async () => {
        setExplorerLoading(true);
        try {
            const res = await fetch(`/api/admin/qa/list?page=${page}&limit=${limit}&search=${searchQuery}`);
            const data = await res.json();
            if (data.ok) {
                setEntries(data.data);
                setTotalPages(data.pagination.totalPages);
                setSelectedIds(new Set()); // Clear selection on new data
            }
        } catch (error) {
            console.error("Failed to fetch entries:", error);
        } finally {
            setExplorerLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected = new Set(entries.map(e => e._id));
            setSelectedIds(newSelected);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

        try {
            const res = await fetch("/api/admin/qa/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            const data = await res.json();
            if (data.ok) {
                setMessage(`Successfully deleted ${data.deletedCount} items`);
                fetchEntries();
            } else {
                alert("Failed to delete: " + data.error);
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            alert("Failed to delete items");
        }
    };

    const handleExport = () => {
        window.location.href = "/api/admin/qa/export";
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        try {
            const res = await fetch("/api/admin/qa/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.ok) {
                setMessage("Entry deleted successfully");
                fetchEntries(); // Refresh list
            } else {
                alert("Failed to delete: " + data.error);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete entry");
        }
    };

    const checkDuplicates = async (dryRun: boolean = true) => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/qa/remove-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dryRun, field })
            });

            const data = await res.json();

            if (data.ok) {
                setSummary(data.summary);
                setDuplicates(data.duplicates || []);
                setMessage(data.message);

                if (!dryRun) {
                    // If actual deletion happened, clear the list
                    setDuplicates([]);
                }
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            setMessage('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Database className="w-8 h-8 text-sky-400" />
                            Database Management & Reports
                        </h1>
                        <p className="text-slate-400">Manage database health, remove duplicates, and view system statistics.</p>
                    </div>

                    {/* Controls Card */}
                    <div className="glass-panel p-6 rounded-2xl mb-8">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-sky-400" />
                            Deduplication Controls
                        </h2>

                        <div className="flex flex-wrap items-end gap-6">

                            {/* Field Selector */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Check Duplicates Based On:
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setField('question_text_en')}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition-all ${field === 'question_text_en'
                                            ? 'bg-sky-500/20 border-sky-500 text-white'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        English Question
                                    </button>
                                    <button
                                        onClick={() => setField('question_text')}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition-all ${field === 'question_text'
                                            ? 'bg-sky-500/20 border-sky-500 text-white'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        Arabic Question
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => checkDuplicates(true)}
                                    disabled={loading}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Scan for Duplicates
                                </button>

                                {summary && summary.duplicateGroups > 0 && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete these duplicates? This action cannot be undone.')) {
                                                checkDuplicates(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="btn-primary bg-red-500 hover:bg-red-600 border-red-500 text-white flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete {summary.duplicateEntries} Duplicates
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {message.includes('Error') ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Stats Summary */}
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="glass-card p-4 rounded-xl text-center">
                                <div className="text-sm text-slate-400 mb-1">Total Entries</div>
                                <div className="text-2xl font-bold text-white">{summary.totalEntries}</div>
                            </div>
                            <div className="glass-card p-4 rounded-xl text-center">
                                <div className="text-sm text-slate-400 mb-1">Unique Questions</div>
                                <div className="text-2xl font-bold text-sky-400">{summary.uniqueQuestions}</div>
                            </div>
                            <div className="glass-card p-4 rounded-xl text-center bg-amber-500/5 border-amber-500/20">
                                <div className="text-sm text-amber-400 mb-1">Duplicate Groups</div>
                                <div className="text-2xl font-bold text-amber-500">{summary.duplicateGroups}</div>
                            </div>
                            <div className="glass-card p-4 rounded-xl text-center bg-red-500/5 border-red-500/20">
                                <div className="text-sm text-red-400 mb-1">To Be Deleted</div>
                                <div className="text-2xl font-bold text-red-500">{summary.duplicateEntries}</div>
                            </div>
                        </div>
                    )}

                    {/* Duplicates List */}
                    {duplicates.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white">Duplicate Details</h3>

                            {duplicates.map((group, idx) => (
                                <div key={idx} className="glass-card p-6 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded mb-2 inline-block">
                                                Group #{idx + 1} • {group.count} copies
                                            </span>
                                            <h4 className="text-lg font-medium text-white">{group.key}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {group.documents.map((doc) => (
                                            <div
                                                key={doc._id}
                                                className={`p-4 rounded-lg border flex justify-between items-center ${doc.willKeep
                                                    ? 'bg-emerald-500/5 border-emerald-500/30'
                                                    : 'bg-red-500/5 border-red-500/30'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {doc.willKeep ? (
                                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">KEEP (Newest)</span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">DELETE</span>
                                                        )}
                                                        <span className="text-xs text-slate-500">ID: {doc._id}</span>
                                                        <span className="text-xs text-slate-500">
                                                            {doc.updated_at ? `Updated: ${new Date(doc.updated_at).toLocaleDateString()}` : `Created: ${new Date(doc.created_at || '').toLocaleDateString()}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-300">{doc.question_text}</p>
                                                    {doc.question_text_en && doc.question_text_en !== group.key && (
                                                        <p className="text-xs text-slate-500 mt-1">{doc.question_text_en}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Data Explorer Section */}
                    <div className="mt-12 border-t border-white/10 pt-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Search className="w-6 h-6 text-purple-400" />
                                Data Explorer
                            </h2>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Bulk Delete Button */}
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium flex items-center gap-2 transition-colors animate-fade-in"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected ({selectedIds.size})
                                    </button>
                                )}

                                {/* Export Button */}
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Database className="w-4 h-4" />
                                    Export Excel
                                </button>

                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setPage(1); // Reset to page 1 on search
                                        }}
                                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-sm">
                                            <th className="p-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    checked={entries.length > 0 && selectedIds.size === entries.length}
                                                />
                                            </th>
                                            <th className="p-4 font-medium">Question (Arabic)</th>
                                            <th className="p-4 font-medium">Question (English)</th>
                                            <th className="p-4 font-medium">Answer</th>
                                            <th className="p-4 font-medium w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {explorerLoading ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                                    Loading data...
                                                </td>
                                            </tr>
                                        ) : entries.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                                    No entries found.
                                                </td>
                                            </tr>
                                        ) : (
                                            entries.map((entry) => (
                                                <tr key={entry._id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(entry._id) ? 'bg-purple-500/5' : ''}`}>
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                                                            checked={selectedIds.has(entry._id)}
                                                            onChange={(e) => handleSelectRow(entry._id, e.target.checked)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-slate-300 text-sm max-w-xs truncate" dir="rtl">
                                                        {entry.question_text}
                                                    </td>
                                                    <td className="p-4 text-slate-300 text-sm max-w-xs truncate">
                                                        {entry.question_text_en || "-"}
                                                    </td>
                                                    <td className="p-4 text-slate-400 text-xs max-w-xs truncate">
                                                        {entry.answer_text}
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDelete(entry._id)}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination & Limit */}
                            <div className="p-4 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Rows per page:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span className="text-sm text-slate-500 ml-4">
                                        Page {page} of {totalPages}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 text-sm"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 text-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
