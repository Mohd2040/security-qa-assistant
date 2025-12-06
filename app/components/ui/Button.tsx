// app/components/ui/Button.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            icon,
            iconPosition = "left",
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none";

        const variants = {
            primary:
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0",
            secondary:
                "bg-slate-800/60 text-slate-100 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
            ghost:
                "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-slate-100",
            outline:
                "bg-transparent border-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400",
            danger:
                "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500 hover:shadow-lg hover:shadow-red-500/30",
        };

        const sizes = {
            sm: "text-xs px-3 py-1.5 gap-1.5",
            md: "text-sm px-4 py-2 gap-2",
            lg: "text-base px-6 py-3 gap-2.5",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    isLoading && "cursor-wait",
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{children}</span>
                    </>
                ) : (
                    <>
                        {icon && iconPosition === "left" && icon}
                        {children}
                        {icon && iconPosition === "right" && icon}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
