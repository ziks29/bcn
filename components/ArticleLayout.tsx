"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Ad } from '../types';

interface ArticleLayoutProps {
    children: React.ReactNode;
    ads: Ad[];
    categories: string[];
}

export default function ArticleLayout({ children, ads, categories }: ArticleLayoutProps) {
    const router = useRouter();

    const handleCategorySelect = (category: string) => {
        // Since we are on a detail page, selecting a category should take us home
        // Ideally with a query param, but for now just home is fine
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col font-serif-body bg-[#faf8f3] selection:bg-amber-200 selection:text-[#4b3634]">
            <Header onCategorySelect={handleCategorySelect} categories={categories} />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area - 8 cols */}
                    <div className="lg:col-span-8 lg:border-r border-zinc-300 lg:pr-8">
                        {children}
                    </div>

                    {/* Sidebar - 4 cols */}
                    <div className="lg:col-span-4 pl-0 lg:pl-4">
                        <Sidebar ads={ads} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
