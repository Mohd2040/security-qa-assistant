import React from 'react';

interface CardProps {
    variant?: 'cyber' | 'neon' | 'dark';
    glow?: boolean;
    hover?: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export function Card({
    variant = 'cyber',
    glow = false,
    hover = true,
    children,
    className = '',
    style,
    onClick,
}: CardProps) {
    const variants = {
        cyber: 'cyber-card',
        neon: 'neon-border-cyan bg-black/40',
        dark: 'bg-black/60 border-2 border-purple-500/30',
    };

    const glowClass = glow ? 'neon-glow-cyan' : '';
    const hoverClass = hover ? 'cursor-pointer' : '';
    const clickable = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`${variants[variant]} ${glowClass} ${hoverClass} ${clickable} ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
