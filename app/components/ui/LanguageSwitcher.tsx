// app/components/ui/LanguageSwitcher.tsx
"use client";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/app/contexts/LanguageContext";

export interface LanguageSwitcherProps {
    className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-slate-800/60 border border-slate-700/50",
                "text-slate-300 hover:text-white hover:bg-slate-800",
                "transition-all duration-200",
                "text-sm font-medium",
                className
            )}
            title={language === "en" ? "Switch to Arabic" : "Switch to English"}
        >
            <Globe className="w-4 h-4" />
            <span className="font-bold">{language === "en" ? "EN" : "AR"}</span>
            <span className="text-xs opacity-70">
                {language === "en" ? "عربي" : "English"}
            </span>
        </button>
    );
}
