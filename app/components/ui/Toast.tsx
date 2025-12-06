// app/components/ui/Toast.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface ToastProps {
    type: "success" | "error" | "info" | "warning";
    message: string;
    onClose: () => void;
    duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
    };

    const styles = {
        success:
            "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        error:
            "bg-red-500/10 border-red-500/30 text-red-400",
        info:
            "bg-blue-500/10 border-blue-500/30 text-blue-400",
        warning:
            "bg-amber-500/10 border-amber-500/30 text-amber-400",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg min-w-[300px]",
                styles[type]
            )}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// Toast Container for managing multiple toasts
export interface ToastContainerProps {
    toasts: Array<ToastProps & { id: string }>;
}

export function ToastContainer({ toasts }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[1060] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
