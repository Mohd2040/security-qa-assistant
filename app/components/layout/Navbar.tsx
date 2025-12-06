// app/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Search, Home, Plus, Upload, FileSpreadsheet, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

export function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { href: "/", label: "Home", labelAr: "الرئيسية", icon: Home },
        { href: "/search", label: "Search", labelAr: "البحث", icon: Search },
        { href: "/admin/qa", label: "Add", labelAr: "إضافة", icon: Plus },
        { href: "/admin/import", label: "Import", labelAr: "استيراد", icon: Upload },
        { href: "/admin/prepare", label: "Prepare", labelAr: "تحضير", icon: FileSpreadsheet },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold gradient-text">
                                Security Q&A
                            </h1>
                            <p className="text-[10px] text-slate-400">Smart Security Assistant</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                            "flex items-center gap-2",
                                            active
                                                ? "text-white"
                                                : "text-slate-400 hover:text-slate-200"
                                        )}
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-indigo-500/30"
                                                transition={{ type: "spring", duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="h-6 w-px bg-slate-700/50" />
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-slate-800/50 bg-slate-900/95 backdrop-blur-lg"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                            active
                                                ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                            <div className="pt-2">
                                <LanguageSwitcher className="w-full justify-center" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
