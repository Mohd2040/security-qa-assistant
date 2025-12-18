"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Activity,
    Shield,
    FileText,
    LogIn,
    Database,
    Globe
} from "lucide-react";
import * as XLSX from "xlsx";

interface LogEntry {
    time: string;
    type: "INFO" | "WARN" | "ERROR";
    user: string;
    action: string;
    details: any;
    timestamp: string;
    full_query?: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAction, setSelectedAction] = useState("all");
    const [selectedUser, setSelectedUser] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    // Stats
    const stats = {
        total: totalLogs,
        activeUsers: users.length,
        todayEvents: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length
    };

    const fetchLogs = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "50",
                search: searchQuery,
                action: selectedAction,
                user: selectedUser
            });

            const res = await fetch(`/api/admin/logs?${params}`);
            const data = await res.json();

            if (data.logs) {
                setLogs(data.logs);
                setTotalPages(data.pagination.pages);
                setTotalLogs(data.pagination.total);
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, searchQuery, selectedAction, selectedUser]);

    const handleExport = () => {
        const dataToExport = logs.map((log) => ({
            Timestamp: new Date(log.timestamp).toLocaleString(),
            User: log.user,
            Action: log.action,
            Details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details,
            Type: log.type,
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "System Logs");
        XLSX.writeFile(wb, `system_logs_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const getActionIcon = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes("LOGIN")) return <LogIn className="w-4 h-4 text-emerald-400" />;
        if (a.includes("SEARCH")) return <Search className="w-4 h-4 text-sky-400" />;
        if (a.includes("MATCH")) return <Activity className="w-4 h-4 text-purple-400" />;
        if (a.includes("EDIT")) return <FileText className="w-4 h-4 text-amber-400" />;
        if (a.includes("TRANSLATE")) return <Globe className="w-4 h-4 text-indigo-400" />;
        if (a.includes("IMPORT")) return <Database className="w-4 h-4 text-pink-400" />;
        return <Shield className="w-4 h-4 text-slate-400" />;
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#0f172a] p-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                            <h1 className="text-2xl font-bold text-white mb-2">Audit Logs</h1>
                            <p className="text-slate-400 text-sm">Monitor system activity and security events.</p>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-sky-500/10 rounded-xl">
                                <Activity className="w-6 h-6 text-sky-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold">Total Events</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <User className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold">Active Users</p>
                                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Clock className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold">Events Today</p>
                                <p className="text-2xl font-bold text-white">{stats.todayEvents}</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 w-64 transition-all"
                                />
                            </div>

                            {/* User Filter */}
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 appearance-none cursor-pointer hover:bg-slate-900/80 transition-all"
                                >
                                    <option value="all">All Users</option>
                                    {users.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>

                            {/* Action Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedAction}
                                    onChange={(e) => setSelectedAction(e.target.value)}
                                    className="bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 appearance-none cursor-pointer hover:bg-slate-900/80 transition-all"
                                >
                                    <option value="all">All Actions</option>
                                    <option value="LOGIN">Login</option>
                                    <option value="SEARCH">Search</option>
                                    <option value="MATCH">Match</option>
                                    <option value="EDIT">Edit</option>
                                    <option value="TRANSLATE">Translate</option>
                                    <option value="IMPORT">Import</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchLogs(true)}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/20 transition-all"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-slate-400">
                                        <th className="px-6 py-4 font-semibold">Time</th>
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Action</th>
                                        <th className="px-6 py-4 font-semibold">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                                Loading logs...
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                <Shield className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                No logs found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                            {log.user.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-slate-200">{log.user}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getActionIcon(log.action)}
                                                        <span className="text-sm font-medium text-white">
                                                            {log.action}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {typeof log.details === 'object' ? (
                                                        <pre className="text-xs font-mono bg-black/20 p-2 rounded max-w-md overflow-x-auto">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    ) : (
                                                        log.details
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-sm text-slate-400">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 disabled:opacity-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
