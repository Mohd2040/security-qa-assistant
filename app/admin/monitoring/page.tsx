"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Server, Database, DollarSign, Activity, Loader2, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

interface MonitoringStats {
    qaEntries: number;
    totalSearches: number;
    totalUsers: number;
    apiCost: string;
    embeddingCost: string;
    totalCost: string;
    recentActivity: Array<{
        query: string;
        timestamp: string;
        resultsCount: number;
    }>;
}

export default function MonitoringPage() {
    const [stats, setStats] = useState<MonitoringStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/monitoring");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch monitoring stats", error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = stats ? [
        { label: "QA Entries", value: stats.qaEntries.toLocaleString(), icon: Database, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
        { label: "Total Searches", value: stats.totalSearches.toLocaleString(), icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Active Users", value: stats.totalUsers.toString(), icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { label: "Total Cost", value: stats.totalCost, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    ] : [];

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

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Infrastructure Monitoring</h1>
                        <p className="text-slate-400">Monitor API usage, costs, and system performance.</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {statsCards.map((stat, index) => (
                                    <div key={index} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                {stat.label}
                                            </span>
                                        </div>
                                        <div className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cost Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-amber-400" />
                                        Cost Breakdown
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-sky-500" />
                                                <span className="text-slate-300">API Calls</span>
                                            </div>
                                            <span className="text-white font-bold">{stats?.apiCost}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                <span className="text-slate-300">Embeddings</span>
                                            </div>
                                            <span className="text-white font-bold">{stats?.embeddingCost}</span>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-center gap-3">
                                                <TrendingUp className="w-5 h-5 text-amber-400" />
                                                <span className="text-white font-medium">Total Estimated</span>
                                            </div>
                                            <span className="text-amber-400 font-bold text-xl">{stats?.totalCost}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-purple-400" />
                                        Recent Search Activity
                                    </h2>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                            stats.recentActivity.map((activity, index) => (
                                                <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="text-sm text-white font-medium mb-1 truncate">
                                                        {activity.query}
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                                        <span>{activity.resultsCount} results</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-500 py-8">
                                                No recent activity
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* System Health */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/5">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-emerald-400" />
                                    System Health
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border-emerald-500/20 border">
                                        <div className="text-sm text-slate-400 mb-1">Database</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-emerald-400 font-bold">Operational</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border-emerald-500/20 border">
                                        <div className="text-sm text-slate-400 mb-1">API</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-emerald-400 font-bold">Operational</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border-emerald-500/20 border">
                                        <div className="text-sm text-slate-400 mb-1">Search</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-emerald-400 font-bold">Operational</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
