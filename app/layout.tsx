
import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Security Q&A Intelligence Hub | AI-Powered Knowledge Base",
  description: "AI-powered security knowledge base for modern teams. Search, manage, and collaborate on security questionnaires with semantic search and intelligent recommendations.",
  keywords: ["security", "q&a", "knowledge base", "cybersecurity", "AI", "semantic search"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
