"use client";

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Link from 'next/link';
import { Article, Category, Ad } from '../types';
import { ChevronRight } from 'lucide-react';

interface NewsDashboardProps {
    initialArticles: Article[];
    initialAds: Ad[];
    categories: string[];
}

const ARTICLES_PER_PAGE = 12;

const NewsDashboard: React.FC<NewsDashboardProps> = ({ initialArticles, initialAds, categories }) => {
    const [currentView, setCurrentView] = useState<'HOME' | 'CATEGORY'>('HOME');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>(initialArticles);
    const [displayCount, setDisplayCount] = useState(ARTICLES_PER_PAGE);

    // Initial load effect
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentView]);

    // Reset display count when changing views or categories
    useEffect(() => {
        setDisplayCount(ARTICLES_PER_PAGE);
    }, [currentView, selectedCategory]);

    const handleCategorySelect = (categoryName: string | 'HOME') => {
        if (categoryName === 'HOME') {
            setCurrentView('HOME');
            setFilteredArticles(initialArticles);
            setSelectedCategory(null);
        } else {
            setCurrentView('CATEGORY');
            setSelectedCategory(categoryName);
            setFilteredArticles(initialArticles.filter(a => a.category === categoryName));
        }
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + ARTICLES_PER_PAGE);
    };

    const breakingNews = initialArticles.find(a => a.breaking);

    const otherNews = filteredArticles.filter(a =>
        currentView === 'HOME' ? a.id !== breakingNews?.id : true
    );

    const displayedNews = otherNews.slice(0, displayCount);
    const hasMore = displayCount < otherNews.length;

    return (
        <div className="min-h-screen flex flex-col font-serif-body bg-[#faf8f3] selection:bg-amber-200 selection:text-[#4b3634]">
            <Header onCategorySelect={handleCategorySelect} categories={categories} />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 lg:border-r border-zinc-300 lg:pr-8">

                        <div className="animate-fade-in">

                            {/* Section Header */}
                            <div className="flex items-baseline justify-between border-b-2 border-black mb-6 pb-2 px-2 md:px-0">
                                <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-tight">
                                    {selectedCategory ? selectedCategory : 'Заголовки'}
                                </h2>
                                {!selectedCategory && <span className="text-[#4b3634] text-[10px] md:text-xs font-bold uppercase tracking-widest animate-pulse">Свежие обновления</span>}
                            </div>

                            {/* Breaking News Hero (Only on Home) */}
                            {currentView === 'HOME' && breakingNews && (
                                <Link href={`/articles/${breakingNews.slug}`} className="mb-12 cursor-pointer group block">
                                    <div className="relative overflow-hidden mb-4 border-b-4 border-zinc-900">
                                        <img
                                            src={breakingNews.imageUrl}
                                            alt={breakingNews.title}
                                            className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                        />
                                        <div className="absolute bottom-0 left-0 bg-[#4b3634] text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                                            Главная тема
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-newspaper font-bold text-zinc-900 leading-none mb-3 group-hover:text-[#4b3634] transition-colors">
                                        {breakingNews.title}
                                    </h2>
                                    <p className="text-lg text-zinc-600 font-serif-body italic mb-2 border-l-4 border-zinc-300 pl-4">
                                        {breakingNews.excerpt}
                                    </p>
                                    <div className="flex items-center text-xs font-sans text-zinc-400 uppercase tracking-wider">
                                        <span className="font-bold text-zinc-900 mr-2">Автор: {breakingNews.author}</span>
                                        <span>{breakingNews.date}</span>
                                    </div>
                                </Link>
                            )}

                            {/* Article Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                {displayedNews.map((article) => (
                                    <Link href={`/articles/${article.slug}`} key={article.id} className="group cursor-pointer flex flex-col">
                                        {article.imageUrl && (
                                            <div className="mb-3 overflow-hidden border border-zinc-200">
                                                <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-300 px-1">{article.category}</span>
                                        </div>
                                        <h3 className="text-2xl font-newspaper font-bold leading-tight mb-2 group-hover:underline decoration-[#4b3634] decoration-2 underline-offset-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-zinc-600 line-clamp-3 mb-3 flex-grow">
                                            {article.excerpt}
                                        </p>
                                        <div className="mt-auto flex items-center text-[#4b3634] text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                            Читать полностью <ChevronRight size={14} />
                                        </div>
                                    </Link>
                                ))}

                                {otherNews.length === 0 && (
                                    <div className="col-span-2 py-12 text-center text-zinc-400 italic">
                                        Отсутствие новостей — хорошие новости, верно? (В этой категории нет статей)
                                    </div>
                                )}
                            </div>

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="group relative bg-[#4b3634] text-white px-8 py-4 font-headline text-lg uppercase tracking-widest hover:bg-zinc-900 transition-all duration-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                    >
                                        <span className="flex items-center gap-2">
                                            Загрузить ещё
                                            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                        </span>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 pl-0 lg:pl-4">
                        <Sidebar ads={initialAds} />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default NewsDashboard;
