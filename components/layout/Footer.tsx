"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Github, Twitter, Linkedin, Mail, Heart, ArrowRight } from 'lucide-react';

export function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-20 border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-xl overflow-hidden">

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-neo relative z-10 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <Shield className="w-5 h-5 text-white" fill="currentColor" fillOpacity={0.2} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white tracking-tight leading-none">Security<span className="text-sky-400">Hub</span></span>
                                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">Intelligence</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
                            Advanced AI-powered security knowledge base designed for modern cybersecurity teams. Detect, analyze, and respond faster.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-sky-400 transition-all hover:-translate-y-1">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-bold tracking-wide">Platform</h4>
                        <ul className="space-y-3">
                            {['Dashboard', 'Search Engine', 'Analytics', 'API Access'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-sky-400 transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-bold tracking-wide">Resources</h4>
                        <ul className="space-y-3">
                            {['Documentation', 'Security Guide', 'Compliance', 'Changelog'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-sky-400 transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <h4 className="text-white font-bold tracking-wide">Stay Updated</h4>
                        <p className="text-sm text-slate-400">
                            Get the latest security insights and platform updates directly to your inbox.
                        </p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all"
                            />
                            <button className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Shield className="w-3 h-3" />
                            <span>Bank-grade encryption. Your data is safe.</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        © {currentYear} Security Intelligence Hub. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400">Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
