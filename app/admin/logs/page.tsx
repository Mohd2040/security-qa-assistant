"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RefreshCw, Download, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface LogEntry {
    time: string;
    type: string;
    user: string;
    action: string;
    details: string;
    timestamp: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/admin/logs");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLogs();
    };

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
                <div className="container-neo max-w-7xl mx-auto">
                    {/* Back Button */}
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Admin Dashboard</span>
                    </Link>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">System Logs</h1>
                            <p className="text-slate-400">View security logs, access history, and system events.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {logs.length > 0 ? (
                                            logs.map((log, index) => (
                                                <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 text-sm text-slate-300">{log.time}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'INFO' ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'
                                                            }`}>
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-sm text-slate-300">{log.user}</td>
                                                    <td className="py-3 text-sm text-white">{log.action}</td>
                                                    <td className="py-3 text-sm text-slate-500">{log.details}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-500">
                                                    No logs available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
