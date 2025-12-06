// lib/constants/colors.ts

/**
 * Color constants for the application
 * Matching the design system in globals.css
 */

export const colors = {
    primary: {
        DEFAULT: "#6366f1",
        light: "#818cf8",
        dark: "#4f46e5",
    },
    secondary: {
        DEFAULT: "#8b5cf6",
        light: "#a78bfa",
        dark: "#7c3aed",
    },
    accent: {
        DEFAULT: "#ec4899",
        light: "#f472b6",
        dark: "#db2777",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
} as const;

export const gradients = {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ocean: "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
    sky: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    purple: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cosmic: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
} as const;

export type ColorKey = keyof typeof colors;
export type GradientKey = keyof typeof gradients;
