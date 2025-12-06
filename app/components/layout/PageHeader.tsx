// app/components/layout/PageHeader.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

export interface PageHeaderProps {
    title: string;
    titleEn?: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    titleEn,
    description,
    icon,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}
        >
            <div className="flex items-start gap-4">
                {icon && (
                    <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                        {icon}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {title}
                    </h1>
                    {titleEn && (
                        <p className="text-sm text-slate-400 font-medium mb-2">
                            {titleEn}
                        </p>
                    )}
                    {description && (
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex-shrink-0">
                    {actions}
                </div>
            )}
        </motion.div>
    );
}
