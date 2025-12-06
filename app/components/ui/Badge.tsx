// app/components/ui/Badge.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";
import type { QaStatus } from "@/lib/types";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info" | "purple";
    size?: "sm" | "md" | "lg";
    status?: QaStatus;
    animated?: boolean;
}

export function Badge({
    className,
    variant = "default",
    size = "md",
    status,
    animated = false,
    children,
    ...props
}: BadgeProps) {
    const baseStyles =
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-200";

    // If status is provided, override variant
    const effectiveVariant = status
        ? status === "applied"
            ? "success"
            : status === "not_applied"
                ? "error"
                : status === "not_applicable"
                    ? "info"
                    : "warning"
        : variant;

    const variants = {
        default:
            "bg-slate-800/60 text-slate-300 border-slate-700/50",
        success:
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        warning:
            "bg-amber-500/10 text-amber-400 border-amber-500/30",
        error:
            "bg-red-500/10 text-red-400 border-red-500/30",
        info:
            "bg-blue-500/10 text-blue-400 border-blue-500/30",
        purple:
            "bg-purple-500/10 text-purple-400 border-purple-500/30",
    };

    const sizes = {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
    };

    const animatedStyles = animated
        ? "animate-pulse hover:scale-105 cursor-pointer"
        : "";

    // Status indicator dot
    const showDot = status !== undefined;
    const dotColor =
        effectiveVariant === "success"
            ? "bg-emerald-400"
            : effectiveVariant === "error"
                ? "bg-red-400"
                : effectiveVariant === "warning"
                    ? "bg-amber-400"
                    : effectiveVariant === "info"
                        ? "bg-blue-400"
                        : effectiveVariant === "purple"
                            ? "bg-purple-400"
                            : "bg-slate-400";

    return (
        <span
            className={cn(
                baseStyles,
                variants[effectiveVariant],
                sizes[size],
                animatedStyles,
                className
            )}
            {...props}
        >
            {showDot && (
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        dotColor,
                        animated && "animate-pulse"
                    )}
                />
            )}
            {children || (status && formatStatus(status))}
        </span>
    );
}

function formatStatus(status: QaStatus): string {
    const statusMap: Record<QaStatus, string> = {
        applied: "مطبق",
        not_applied: "غير مطبق",
        not_applicable: "غير منطبق",
        unknown: "غير معروف",
    };
    return statusMap[status] || status;
}
