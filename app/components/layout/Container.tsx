// app/components/layout/Container.tsx
import { cn } from "@/lib/utils/cn";
import { HTMLAttributes, forwardRef } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, size = "lg", children, ...props }, ref) => {
        const sizes = {
            sm: "max-w-3xl",
            md: "max-w-4xl",
            lg: "max-w-5xl",
            xl: "max-w-7xl",
            full: "max-w-full",
        };

        return (
            <div
                ref={ref}
                className={cn("w-full mx-auto px-4 sm:px-6 lg:px-8", sizes[size], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Container.displayName = "Container";
