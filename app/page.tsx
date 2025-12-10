"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Search, Shield, Database, Zap, Lock, Activity, FileText, Upload, ChevronRight, Sparkles, Brain, Layers, BarChart3, Cpu } from 'lucide-react';

interface SystemStats {
  totalEntries: number;
  verifiedAnswers: number;
  pendingReview: number;
  domainsCount: number;
  accuracy: number;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<SystemStats>({
    totalEntries: 0,
    verifiedAnswers: 0,
    pendingReview: 0,
    domainsCount: 0,
    accuracy: 92
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <MainLayout>
      <div className="relative min-h-screen flex flex-col pt-24 pb-12 overflow-hidden">

        {/* Abstract 3D Background Elements */}
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/10 to-blue-500/10 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="container-neo relative z-10">

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium text-sky-100 tracking-wide">Next-Gen Security Intelligence</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl heading-hero mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Security Q&A <br />
              <span className="text-gradient-primary">Intelligence Hub</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Empowering security teams with AI-driven insights.
              Search, analyze, and manage your security knowledge base with unprecedented clarity.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/search" className="block group">
                <div className="neo-search flex items-center p-2 pr-6">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white mr-4 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-sm text-slate-400 font-medium mb-0.5">Quick Search</span>
                    <span className="block text-slate-200 text-lg">Find security answers...</span>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {[
              {
                title: 'Semantic Search',
                desc: 'AI-powered deep search',
                icon: Search,
                href: '/search',
                color: 'from-sky-400 to-blue-500'
              },
              {
                title: 'Add Knowledge',
                desc: 'Expand the database',
                icon: Database,
                href: '/admin/qa',
                color: 'from-emerald-400 to-teal-500'
              },
              {
                title: 'Smart Match',
                desc: 'Auto-fill answers',
                icon: Sparkles,
                href: '/admin/match-answers',
                color: 'from-purple-400 to-pink-500'
              },
              {
                title: 'Bulk Import',
                desc: 'Process Excel files',
                icon: Upload,
                href: '/admin/import',
                color: 'from-orange-400 to-amber-500'
              }
            ].map((card, i) => (
              <Link key={i} href={card.href} className="block group">
                <div className="glass-card h-full p-8 flex flex-col items-start hover:bg-white/[0.02]">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {card.desc}
                  </p>

                  <div className="mt-auto flex items-center text-sm font-medium text-sky-400 group-hover:text-sky-300 transition-colors">
                    Access Tool <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats Section - Glass Panel */}
          <div className="glass-panel rounded-3xl p-10 relative overflow-hidden mb-24">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-50" />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-12">
              {[
                { label: 'Total Entries', value: stats.totalEntries.toLocaleString(), icon: Database },
                { label: 'Verified Answers', value: stats.verifiedAnswers.toLocaleString(), icon: Shield },
                { label: 'Pending Review', value: stats.pendingReview.toLocaleString(), icon: Activity },
                { label: 'Security Domains', value: stats.domainsCount.toLocaleString(), icon: Lock },
                { label: 'System Accuracy', value: `${stats.accuracy}%`, icon: Sparkles },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex items-center gap-3 mb-2 text-slate-400">
                    <stat.icon className="w-5 h-5" />
                    <span className="text-sm font-medium uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-4xl font-bold text-white tracking-tight">
                    {loading ? (
                      <span className="animate-pulse bg-white/10 rounded h-10 w-24 block"></span>
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Section */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Powered by Advanced Technology</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Our system leverages cutting-edge AI and search algorithms to deliver precise, context-aware results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Semantic Intelligence",
                  desc: "OpenAI Embeddings (text-embedding-3-small) for deep contextual understanding.",
                  icon: Brain,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20"
                },
                {
                  title: "Hybrid Search Engine",
                  desc: "Advanced fusion of BM25 Keyword Ranking + Fuse.js Fuzzy Matching.",
                  icon: Layers,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20"
                },
                {
                  title: "Adaptive Learning",
                  desc: "Self-improving system that learns from user feedback to optimize results.",
                  icon: BarChart3,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20"
                },
                {
                  title: "Vector Optimization",
                  desc: "LRU Caching & Cosine Similarity for millisecond-latency performance.",
                  icon: Cpu,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20"
                }
              ].map((tech, i) => (
                <div key={i} className={`glass-card p-6 rounded-2xl border ${tech.border} hover:bg-white/[0.03] transition-colors`}>
                  <div className={`w-12 h-12 rounded-xl ${tech.bg} flex items-center justify-center mb-4`}>
                    <tech.icon className={`w-6 h-6 ${tech.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{tech.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
