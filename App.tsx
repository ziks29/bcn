import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ArticleView from './components/ArticleView';
import { ARTICLES } from './constants';
import { Article, Category } from './types';
import { ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'HOME' | 'ARTICLE' | 'CATEGORY'>('HOME');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(ARTICLES);

  // Initial load effect
  useEffect(() => {
    // Scroll to top on view change
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('ARTICLE');
  };

  const handleCategorySelect = (category: Category | 'HOME') => {
    if (category === 'HOME') {
      setCurrentView('HOME');
      setFilteredArticles(ARTICLES);
      setSelectedCategory(null);
    } else {
      setCurrentView('CATEGORY');
      setSelectedCategory(category);
      setFilteredArticles(ARTICLES.filter(a => a.category === category));
    }
  };

  const breakingNews = ARTICLES.find(a => a.breaking);
  const otherNews = filteredArticles.filter(a => a.id !== breakingNews?.id);

  return (
    <div className="min-h-screen flex flex-col font-serif-body bg-[#f4f1ea] selection:bg-red-200 selection:text-red-900">
      <Header onCategorySelect={handleCategorySelect} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 lg:border-r border-zinc-300 lg:pr-8">
            
            {currentView === 'ARTICLE' && selectedArticle ? (
              <ArticleView article={selectedArticle} onBack={() => handleCategorySelect(selectedCategory || 'HOME')} />
            ) : (
              <div className="animate-fade-in">
                
                {/* Section Header */}
                <div className="flex items-baseline justify-between border-b-2 border-black mb-6 pb-2">
                    <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">
                        {selectedCategory ? selectedCategory : 'Заголовки'}
                    </h2>
                    {!selectedCategory && <span className="text-red-700 text-xs font-bold uppercase tracking-widest animate-pulse">Свежие обновления</span>}
                </div>

                {/* Breaking News Hero (Only on Home) */}
                {currentView === 'HOME' && breakingNews && (
                  <div className="mb-12 cursor-pointer group" onClick={() => handleArticleClick(breakingNews)}>
                    <div className="relative overflow-hidden mb-4 border-b-4 border-zinc-900">
                        <img 
                            src={breakingNews.imageUrl} 
                            alt={breakingNews.title} 
                            className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                        />
                        <div className="absolute bottom-0 left-0 bg-red-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                            Главная тема
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-newspaper font-bold text-zinc-900 leading-none mb-3 group-hover:text-red-900 transition-colors">
                        {breakingNews.title}
                    </h2>
                    <p className="text-lg text-zinc-600 font-serif-body italic mb-2 border-l-4 border-zinc-300 pl-4">
                        {breakingNews.excerpt}
                    </p>
                    <div className="flex items-center text-xs font-sans text-zinc-400 uppercase tracking-wider">
                        <span className="font-bold text-zinc-900 mr-2">Автор: {breakingNews.author}</span>
                        <span>{breakingNews.date}</span>
                    </div>
                  </div>
                )}

                {/* Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                  {otherNews.map((article) => (
                    <div key={article.id} className="group cursor-pointer flex flex-col" onClick={() => handleArticleClick(article)}>
                       {article.imageUrl && (
                         <div className="mb-3 overflow-hidden border border-zinc-200">
                             <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                         </div>
                       )}
                       <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-300 px-1">{article.category}</span>
                       </div>
                       <h3 className="text-2xl font-newspaper font-bold leading-tight mb-2 group-hover:underline decoration-red-700 decoration-2 underline-offset-2">
                         {article.title}
                       </h3>
                       <p className="text-sm text-zinc-600 line-clamp-3 mb-3 flex-grow">
                         {article.excerpt}
                       </p>
                       <div className="mt-auto flex items-center text-red-800 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                          Читать полностью <ChevronRight size={14} />
                       </div>
                    </div>
                  ))}
                  
                  {otherNews.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-zinc-400 italic">
                          Отсутствие новостей — хорошие новости, верно? (В этой категории нет статей)
                      </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 pl-0 lg:pl-4">
            <Sidebar />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;