import "./globals.css";
import type { Metadata } from "next";
<<<<<<< HEAD
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "./contexts/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Security Q&A Assistant - Smart Security Questionnaire Manager",
  description: "A modern workspace to manage, search, and grow your security questionnaire knowledge base with AI-powered assistance.",
  keywords: ["security", "questionnaire", "compliance", "security assessment", "Q&A"],
  authors: [{ name: "Master Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#6366f1",
=======
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Security Q&A Intelligence Hub | AI-Powered Knowledge Base",
  description: "AI-powered security knowledge base for modern teams. Search, manage, and collaborate on security questionnaires with semantic search and intelligent recommendations.",
  keywords: ["security", "q&a", "knowledge base", "cybersecurity", "AI", "semantic search"],
>>>>>>> devops3
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
<<<<<<< HEAD
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
=======
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
>>>>>>> devops3
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
