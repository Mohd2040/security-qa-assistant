"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Bell, Globe, Search, Menu, X } from 'lucide-react';

export function Header() {
    const { language, setLanguage } = useLanguage();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container-neo flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                        <Shield className="w-5 h-5 text-white" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-tight leading-none">Security<span className="text-sky-400">Hub</span></span>
                        <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">Intelligence</span>
                    </div>
                </Link>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                    {[
                        { href: '/', label: 'Overview' },
                        { href: '/search', label: 'Search' },
                        { href: '/admin/qa', label: 'Manage' },
                        { href: '/admin/match-answers', label: 'Match' },
                        { href: '/admin/import', label: 'Import' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-5 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border-2 border-[#0f172a]"></span>
                    </button>

                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-200">{language === 'en' ? 'EN' : 'AR'}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
