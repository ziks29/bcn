import React from 'react';
import { Eye, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface StatsWidgetProps {
    stats: {
        totalArticles: number;
        publishedArticles: number;
        totalViews: number;
        mostViewedArticle?: {
            id: string;
            title: string;
            views: number;
            slug: string;
        } | null;
    };
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ stats }) => {
    return (
        <div className="bg-white border-2 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
                <h2 className="font-newspaper text-xl sm:text-2xl font-bold uppercase tracking-tight">
                    Статистика
                </h2>
                <TrendingUp size={24} className="text-zinc-500" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Total Articles */}
                <div className="bg-zinc-50 border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-zinc-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Всего Статей</p>
                    </div>
                    <p className="text-3xl font-bold font-newspaper text-zinc-900">{stats.totalArticles}</p>
                </div>

                {/* Published Articles */}
                <div className="bg-green-50 border border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-green-700">Опубликовано</p>
                    </div>
                    <p className="text-3xl font-bold font-newspaper text-green-900">{stats.publishedArticles}</p>
                </div>

                {/* Total Views */}
                <div className="bg-blue-50 border border-blue-200 p-4 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Eye size={16} className="text-blue-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Всего Просмотров</p>
                    </div>
                    <p className="text-3xl font-bold font-newspaper text-blue-900">{stats.totalViews}</p>
                </div>
            </div>

            {/* Most Viewed Article */}
            {stats.mostViewedArticle && stats.mostViewedArticle.views > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        🔥 Самая Популярная Статья
                    </p>
                    <Link
                        href={`/articles/${stats.mostViewedArticle.slug}`}
                        className="block group"
                    >
                        <p className="font-newspaper text-base sm:text-lg font-bold text-zinc-900 group-hover:underline line-clamp-2 mb-1">
                            {stats.mostViewedArticle.title}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Eye size={12} />
                            {stats.mostViewedArticle.views} просмотров
                        </p>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default StatsWidget;
