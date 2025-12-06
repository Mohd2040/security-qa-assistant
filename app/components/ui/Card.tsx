// app/components/ui/Card.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "gradient" | "bordered";
    hoverable?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = "default",
            hoverable = false,
            padding = "md",
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = "rounded-xl";

        const variants = {
            default:
                "bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm",
            glass:
                "bg-slate-900/40 border border-slate-700/30 backdrop-blur-md shadow-xl",
            gradient:
                "bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm",
            bordered:
                "bg-slate-900/90 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10",
        };

        const paddings = {
            none: "p-0",
            sm: "p-3",
            md: "p-4",
            lg: "p-6",
        };

        const hoverStyles = hoverable
            ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 cursor-pointer"
            : "";

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    paddings[padding],
                    hoverStyles,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

// Card subcomponents
export const CardHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 pb-3", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
    HTMLHeadingElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-400", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center pt-3", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";
