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

                </div>
            </div>
        </MainLayout>
    );
}
