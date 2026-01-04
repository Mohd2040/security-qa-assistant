"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Activity,
    DollarSign,
    Zap,
    Users,
    BarChart2,
    PieChart,
    Clock,
    RefreshCw
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function MonitoringPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/monitoring");
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to fetch monitoring data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                </div>
            </MainLayout>
        );
    }

    const { stats, byFeature, byUser, dailyTrend, recentCalls } = data;

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#0f172a] p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">AI Monitoring Dashboard</h1>
                            <p className="text-slate-400">Real-time insights into OpenAI usage and costs.</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-slate-400 font-medium">Total Cost</h3>
                            </div>
                            <p className="text-4xl font-bold text-white">${stats.totalCost.toFixed(4)}</p>
                            <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Lifetime usage
                            </p>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-sky-500/20" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-sky-500/10 rounded-xl">
                                    <Zap className="w-6 h-6 text-sky-400" />
                                </div>
                                <h3 className="text-slate-400 font-medium">Total Tokens</h3>
                            </div>
                            <p className="text-4xl font-bold text-white">{(stats.totalTokens / 1000).toFixed(1)}k</p>
                            <p className="text-sky-400 text-sm mt-2">Processed tokens</p>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <Activity className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-slate-400 font-medium">Total Requests</h3>
                            </div>
                            <p className="text-4xl font-bold text-white">{stats.totalRequests}</p>
                            <p className="text-purple-400 text-sm mt-2">API calls made</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Trend */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-sky-400" /> Daily Cost Trend
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#38bdf8' }}
                                            formatter={(value: any) => [`$${Number(value || 0).toFixed(4)}`, 'Cost']}
                                        />
                                        <Bar dataKey="cost" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Usage by Feature */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-400" /> Cost by Feature
                            </h3>
                            <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={byFeature}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="cost"
                                        >
                                            {byFeature.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            formatter={(value: any) => [`$${Number(value || 0).toFixed(4)}`, 'Cost']}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {byFeature.map((entry: any, index: number) => (
                                    <div key={entry._id} className="flex items-center gap-2 text-sm text-slate-400">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        {entry._id}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Users & Recent Calls */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Users */}
                        <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-400" /> Top Users
                            </h3>
                            <div className="space-y-4">
                                {byUser.map((user: any, i: number) => (
                                    <div key={user._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {user._id.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white truncate w-24">{user._id}</p>
                                                <p className="text-xs text-slate-500">{user.requests} reqs</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-emerald-400">${user.cost.toFixed(4)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Calls */}
                        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-400" /> Recent API Calls
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs uppercase text-slate-500 border-b border-white/10">
                                            <th className="pb-3 pl-2">Time</th>
                                            <th className="pb-3">User</th>
                                            <th className="pb-3">Feature</th>
                                            <th className="pb-3">Model</th>
                                            <th className="pb-3">Tokens</th>
                                            <th className="pb-3 pr-2 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {recentCalls.map((call: any, i: number) => (
                                            <tr key={i} className="text-sm hover:bg-white/5 transition-colors">
                                                <td className="py-3 pl-2 text-slate-400">
                                                    {new Date(call.timestamp).toLocaleTimeString()}
                                                </td>
                                                <td className="py-3 text-white">{call.user}</td>
                                                <td className="py-3 text-slate-300">
                                                    <span className="px-2 py-1 rounded-full bg-white/10 text-xs">
                                                        {call.feature}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-400 text-xs">{call.model}</td>
                                                <td className="py-3 text-slate-400">{call.tokens_total}</td>
                                                <td className="py-3 pr-2 text-right font-mono text-emerald-400">
                                                    ${call.cost.toFixed(5)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
