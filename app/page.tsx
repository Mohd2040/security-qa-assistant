<<<<<<< HEAD
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
=======
"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Search, Shield, Database, Zap, Lock, Activity, FileText, Upload, ChevronRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();

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
          <div className="glass-panel rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-50" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { label: 'Total Entries', value: '1,234', icon: Database },
                { label: 'Verified Answers', value: '856', icon: Shield },
                { label: 'Pending Review', value: '127', icon: Activity },
                { label: 'Security Domains', value: '24', icon: Lock },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex items-center gap-3 mb-2 text-slate-400">
                    <stat.icon className="w-5 h-5" />
                    <span className="text-sm font-medium uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-4xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
>>>>>>> devops3
  );
}
