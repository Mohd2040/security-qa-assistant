"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users, Shield, Activity, Database, Server, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    securityEvents: number;
    systemLoad: string;
    knowledgeBase: number;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const statsDisplay = stats ? [
        { label: "Total Users", value: stats.totalUsers.toString(), icon: Users, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
        { label: "Security Events", value: stats.securityEvents.toString(), icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { label: "System Load", value: stats.systemLoad, icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Knowledge Base", value: stats.knowledgeBase.toLocaleString(), icon: Database, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    ] : [];

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
                <div className="container-neo max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                            <p className="text-slate-400">
                                Welcome back, <span className="text-sky-400 font-medium">{session?.user?.name}</span>
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-medium text-slate-300">System Operational</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {statsDisplay.map((stat, index) => (
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

                            {/* Quick Actions */}
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-sky-400" />
                                Management Console
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Link href="/admin/users" className="glass-panel p-6 rounded-2xl hover:bg-white/[0.02] transition-all group border border-white/5 hover:border-sky-500/30">
                                    <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6 text-sky-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                                    <p className="text-sm text-slate-400">Create, edit, and manage user accounts and roles.</p>
                                </Link>

                                <Link href="/admin/logs" className="glass-panel p-6 rounded-2xl hover:bg-white/[0.02] transition-all group border border-white/5 hover:border-purple-500/30">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Activity className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">System Logs</h3>
                                    <p className="text-sm text-slate-400">View security logs, access history, and system events.</p>
                                </Link>

                                <Link href="/admin/monitoring" className="glass-panel p-6 rounded-2xl hover:bg-white/[0.02] transition-all group border border-white/5 hover:border-emerald-500/30">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Server className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Infrastructure</h3>
                                    <p className="text-sm text-slate-400">Monitor API usage, costs, and server performance.</p>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
