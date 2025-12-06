// app/components/layout/Footer.tsx
import Link from "next/link";
import { Github, Mail, Shield } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-lg mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Security Q&A</h3>
                                <p className="text-xs text-slate-400">مساعد الأسئلة الأمنية</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            A modern workspace to manage and search your security questionnaire knowledge base.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-3">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/search"
                                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                                >
                                    Search Q&A
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/qa"
                                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                                >
                                    Add Question
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/import"
                                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                                >
                                    Bulk Import
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/prepare"
                                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                                >
                                    Prepare Questions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-3">Contact</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="mailto:support@example.com"
                                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    support@masterteam.sa
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2"
                                >
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-400">
                            © {currentYear} Master Team. All rights reserved.
                        </p>
                        <p className="text-xs text-slate-500">
                            Made with ❤️ for Security Teams
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
