"use client";

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />
            <main className="flex-1 relative">
                {children}
            </main>
            <Footer />
        </div>
    );
}
