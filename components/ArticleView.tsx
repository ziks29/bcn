import React from 'react';
import { Article } from '../types';
import { ArrowLeft, Share2, Printer, Clock } from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  return (
    <article className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center text-[#4b3634] font-bold uppercase text-xs tracking-widest mb-6 hover:underline"
      >
        <ArrowLeft size={14} className="mr-1" /> Назад к заголовкам
      </button>

      <header className="mb-8 border-b-2 border-zinc-200 pb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="bg-[#4b3634] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">{article.category}</span>
          {article.breaking && <span className="text-amber-700 font-bold text-xs uppercase animate-pulse">Срочные новости</span>}
        </div>

        <h1 className="text-4xl md:text-6xl font-newspaper leading-tight text-zinc-900 mb-6">
          {article.title}
        </h1>

        <div className="flex flex-col md:flex-row justify-between md:items-end text-zinc-500 font-sans text-sm border-t border-zinc-200 pt-4">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-zinc-300 rounded-full flex items-center justify-center font-serif font-bold text-zinc-500">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-zinc-900 uppercase text-xs">Автор: {article.author}</p>
              <div className="flex items-center text-xs mt-0.5">
                <Clock size={12} className="mr-1" />
                <span>{article.date}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-1 hover:text-zinc-900"><Share2 size={16} /> <span>Поделиться</span></button>
            <button className="flex items-center space-x-1 hover:text-zinc-900"><Printer size={16} /> <span>Печать</span></button>
          </div>
        </div>
      </header>

      {article.imageUrl && (
        <figure className="mb-8">
          <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700" />
          {article.imageCaption && (
            <figcaption className="text-xs font-sans text-zinc-500 mt-2 text-right italic border-b border-zinc-200 pb-2">
              {article.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-1 hidden lg:block">
          <div className="text-6xl text-zinc-200 font-newspaper leading-none text-center">
            {article.title.charAt(0)}
          </div>
        </div>
        <div className="lg:col-span-10">
          <div className="prose prose-zinc prose-lg font-serif-body text-zinc-800 max-w-none">
            <div className="font-bold text-xl md:text-2xl mb-6 leading-relaxed italic text-zinc-600">
              "{article.excerpt}"
            </div>
            {/* Rendering HTML content safely */}
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          <div className="mt-12 p-6 bg-zinc-100 border-l-4 border-zinc-400">
            <p className="font-sans text-xs uppercase font-bold text-zinc-500 mb-2">Об авторе</p>
            <p className="font-serif-body italic text-sm text-zinc-700">
              {article.authorBio || "Информация об авторе не предоставлена."}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleView;
