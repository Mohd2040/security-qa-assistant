// app/components/ui/Loading.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface LoadingProps {
    variant?: "spinner" | "dots" | "bars" | "pulse";
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export function Loading({
    variant = "spinner",
    size = "md",
    text,
    fullScreen = false,
    className,
}: LoadingProps) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const LoadingContent = () => {
        switch (variant) {
            case "spinner":
                return (
                    <Loader2
                        className={cn("animate-spin text-indigo-500", sizes[size])}
                    />
                );

            case "dots":
                return (
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "rounded-full bg-indigo-500 animate-bounce",
                                    size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
                                )}
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                }}
                            />
                        ))}
                    </div>
                );

            case "bars":
                return (
                    <div className="flex gap-1.5 items-end">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "bg-gradient-to-t from-indigo-600 to-purple-600 rounded-sm animate-pulse",
                                    size === "sm" ? "w-1" : size === "md" ? "w-1.5" : "w-2"
                                )}
                                style={{
                                    height: `${[12, 20, 16, 24][i]}px`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                );

            case "pulse":
                return (
                    <div className="relative">
                        <div
                            className={cn(
                                "rounded-full bg-indigo-500/20 animate-ping",
                                sizes[size]
                            )}
                        />
                        <div
                            className={cn(
                                "absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600",
                                sizes[size]
                            )}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <LoadingContent />
                    {text && (
                        <p className="text-sm text-slate-300 font-medium animate-pulse">
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <LoadingContent />
            {text && (
                <p className="text-sm text-slate-300 font-medium">{text}</p>
            )}
        </div>
    );
}

// Skeleton Loader for content placeholders
export interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    count?: number;
}

export function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    count = 1,
}: SkeletonProps) {
    const baseStyles = "animate-pulse bg-gradient-to-r from-slate-800/50 to-slate-700/50";

    const variants = {
        text: "rounded h-4",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    const skeletonStyle = {
        width: width || "100%",
        height: height || (variant === "text" ? "1rem" : "auto"),
    };

    if (count > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(baseStyles, variants[variant], className)}
                        style={skeletonStyle}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseStyles, variants[variant], className)}
            style={skeletonStyle}
        />
    );
}
