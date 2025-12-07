import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'neon' | 'cyber' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function Button({
    variant = 'neon',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        neon: 'neon-button',
        cyber: 'cyber-card border-2 border-cyan-400 hover:neon-glow-cyan text-cyan-300 font-bold',
        ghost: 'bg-transparent border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : icon}
            {children}
        </button>
    );
}
