<<<<<<< HEAD
// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, Upload, FileSpreadsheet, Shield, Zap, Database, Lock, TrendingUp, Users } from "lucide-react";
import { Card } from "./components/ui/Card";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Navbar } from "./components/layout/Navbar";
import { Container } from "./components/layout/Container";
import { Footer } from "./components/layout/Footer";
import { useLanguage } from "./contexts/LanguageContext";
=======
"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Search, Shield, Database, Zap, Lock, Activity, FileText, Upload, ChevronRight, Sparkles } from 'lucide-react';
>>>>>>> devops3

export default function HomePage() {
  const { t } = useLanguage();

<<<<<<< HEAD
  const quickActions = [
    {
      href: "/search",
      title: t("Search Q&A", "البحث في الأسئلة"),
      description: t(
        "Search for approved security question answers in Arabic or English with advanced filters",
        "ابحث عن إجابات الأسئلة الأمنية المعتمدة بالعربي أو الإنجليزي مع فلاتر متقدمة"
      ),
      icon: Search,
      gradient: "from-sky-600 to-blue-600",
      borderColor: "border-sky-500/30",
      iconBg: "bg-sky-500/20",
    },
    {
      href: "/admin/qa",
      title: t("Add Single Q&A", "إضافة سؤال وجواب"),
      description: t(
        "Manually add a single question and answer with full classifications and explanations",
        "أضف سؤال وجواب واحد يدوياً مع كامل التصنيفات والشروحات"
      ),
      icon: Plus,
      gradient: "from-emerald-600 to-teal-600",
      borderColor: "border-emerald-500/30",
      iconBg: "bg-emerald-500/20",
    },
    {
      href: "/admin/import",
      title: t("Bulk Import (Excel)", "استيراد جماعي"),
      description: t(
        "Upload an Excel file containing multiple questions and answers to import them all at once",
        "ارفع ملف Excel يحتوي على أسئلة وأجوبة متعددة لاستيرادها دفعة واحدة"
      ),
      icon: Upload,
      gradient: "from-amber-600 to-orange-600",
      borderColor: "border-amber-500/30",
      iconBg: "bg-amber-500/20",
    },
    {
      href: "/admin/prepare",
      title: t("Prepare Client Questions", "تحضير الأسئلة"),
      description: t(
        "Convert client questions from a simple Excel file to a ready-to-import template",
        "حوّل أسئلة العميل من ملف Excel بسيط إلى قالب جاهز للاستيراد"
      ),
      icon: FileSpreadsheet,
      gradient: "from-fuchsia-600 to-pink-600",
      borderColor: "border-fuchsia-500/30",
      iconBg: "bg-fuchsia-500/20",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: t("Comprehensive Knowledge Base", "قاعدة معرفية شاملة"),
      description: t(
        "Centralized management for all security questions",
        "إدارة مركزية لجميع الأسئلة الأمنية"
      ),
    },
    {
      icon: Zap,
      title: t("Smart & Fast Search", "بحث ذكي وسريع"),
      description: t(
        "Advanced filters and instant results",
        "فلاتر متقدمة ونتائج فورية"
      ),
    },
    {
      icon: Database,
      title: t("Bilingual Support", "دعم ثنائي اللغة"),
      description: t(
        "Arabic and English with RTL",
        "عربي وإنجليزي مع RTL"
      ),
    },
    {
      icon: Lock,
      title: t("Comprehensive Classification", "تصنيف شامل"),
      description: t(
        "Domains, statuses, and owners",
        "نطاقات، حالات، ومسؤولين"
      ),
    },
  ];

  const stats = [
    { value: "100+", label: t("Security Questions", "سؤال أمني"), icon: Database },
    { value: "5", label: t("Main Domains", "نطاقات رئيسية"), icon: TrendingUp },
    { value: "24/7", label: t("Always Available", "متاح دائماً"), icon: Zap },
    { value: "3", label: t("Responsible Teams", "فرق مسؤولة"), icon: Users },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <Container className="relative z-10 py-12 space-y-16">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 pt-8"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block"
            >
              <Badge variant="purple" size="md" animated>
                <Zap className="w-3 h-3" />
                <span>{t("Internal Tool - In Development", "أداة داخلية - قيد التطوير")}</span>
              </Badge>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              <span className="gradient-text">
                {t("Security Q&A Assistant", "مساعد الأسئلة الأمنية")}
              </span>
              <br />
              <span className="text-slate-300 text-2xl md:text-3xl lg:text-4xl mt-2 block">
                {t("Smart Security Questionnaire Manager", "إدارة ذكية لاستبيانات الأمن السيبراني")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t(
                "A smart workspace to manage and search your comprehensive security Q&A knowledge base.",
                "أداة ذكية لإدارة والبحث في قاعدة معرفية شاملة لأسئلة وأجوبة الأمن السيبراني."
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                icon={<Search className="w-5 h-5" />}
                onClick={() => (window.location.href = "/search")}
              >
                {t("Start Searching Now", "ابدأ البحث الآن")}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
                onClick={() => (window.location.href = "/admin/qa")}
              >
                {t("Add New Question", "أضف سؤال جديد")}
              </Button>
            </div>
          </motion.section>

          {/* Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <Card variant="glass" padding="md" className="text-center">
                    <Icon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-slate-400">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.section>

          {/* Quick Actions */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t("Quick Actions", "الإجراءات السريعة")}
              </h2>
              <p className="text-slate-400">{t("Choose what you want to do", "اختر ما تريد القيام به")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  >
                    <Link href={action.href} className="block group">
                      <Card
                        variant="glass"
                        padding="lg"
                        hoverable
                        className={`border ${action.borderColor} h-full`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 p-3 rounded-xl ${action.iconBg} border ${action.borderColor}`}
                          >
                            <Icon className={`w-6 h-6 bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:gradient-text transition-all">
                              {action.title}
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <span className="text-slate-400 group-hover:text-white transition-colors">
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Features */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t("Key Features", "المميزات الرئيسية")}
              </h2>
              <p className="text-slate-400">{t("Why use this tool", "لماذا تستخدم هذه الأداة")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  >
                    <Card variant="glass" padding="md" className="text-center h-full">
                      <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 mb-3">
                        <Icon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* How to use */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card variant="bordered" padding="lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                {t("How to Use This Tool", "كيفية استخدام الأداة")}
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    1
                  </span>
                  <span>
                    {t(
                      "Start with Search to reuse existing approved answers before writing something new.",
                      "ابدأ بالبحث لإعادة استخدام الإجابات المعتمدة قبل كتابة إجابة جديدة"
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    2
                  </span>
                  <span>
                    {t(
                      "Use Add Single Q&A when you receive a new question and have a confirmed answer.",
                      "استخدم إضافة سؤال عند حصولك على سؤال جديد وإجابة مؤكدة"
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    3
                  </span>
                  <span>
                    {t(
                      "Use Bulk Import (Excel) to import legacy spreadsheets from your team or vendor.",
                      "استخدم الاستيراد الجماعي لاستيراد ملفات Excel من فريقك أو الموردين"
                    )}
                  </span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    <strong className="text-slate-300">{t("Coming Soon:", "قريباً:")}</strong>{" "}
                    {t(
                      "AI Agent integration to generate initial answers and suggest questions for different teams automatically.",
                      "تكامل مع الذكاء الاصطناعي (AI Agent) لتوليد إجابات أولية واقتراح أسئلة للفرق المختلفة بشكل تلقائي."
                    )}
                  </span>
                </p>
              </div>
            </Card>
          </motion.section>
        </Container>
      </main>
      <Footer />
    </>
=======
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
