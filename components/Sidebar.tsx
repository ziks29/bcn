import React, { useState } from 'react';
import { ADS, STOCKS } from '../constants';
import { TrendingUp, TrendingDown, Sparkles, Loader2 } from 'lucide-react';
import { generateRedneckWisdom } from '../services/geminiService';

const Sidebar: React.FC = () => {
  const [wisdom, setWisdom] = useState<string | null>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(false);

  const handleGetWisdom = async () => {
    setLoadingWisdom(true);
    const result = await generateRedneckWisdom();
    setWisdom(result);
    setLoadingWisdom(false);
  };

  return (
    <aside className="space-y-8">
      {/* Stocks Widget */}
      <div className="bg-white border border-zinc-300 p-4 shadow-sm">
        <div className="border-b-2 border-zinc-900 mb-3 pb-1 flex justify-between items-end">
            <h3 className="font-headline font-bold text-xl uppercase">Тикер BAWSAQ</h3>
            <span className="text-[10px] text-zinc-500">ПРЯМОЙ ЭФИР</span>
        </div>
        <ul className="space-y-3">
          {STOCKS.map((stock) => (
            <li key={stock.symbol} className="flex justify-between items-center text-sm font-sans border-b border-zinc-100 pb-2 last:border-0">
              <div>
                <span className="font-bold block">{stock.symbol}</span>
                <span className="text-xs text-zinc-500">{stock.name}</span>
              </div>
              <div className={`flex items-center font-mono ${stock.change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {stock.change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {stock.price.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Gemini AI Widget */}
      <div className="bg-zinc-900 text-[#f4f1ea] p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} />
        </div>
        <h3 className="font-newspaper text-2xl mb-2 relative z-10 text-yellow-500">Оракул Мадам Назар</h3>
        <p className="text-xs font-serif-body text-zinc-400 mb-4 relative z-10">
          Цифровая мистика на базе Gemini. Спроси духов о главном.
        </p>
        
        {wisdom && (
          <div className="mb-4 p-3 bg-zinc-800 border-l-4 border-yellow-500 text-sm italic font-serif-body animate-fade-in">
            "{wisdom}"
          </div>
        )}

        <button 
          onClick={handleGetWisdom}
          disabled={loadingWisdom}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-zinc-900 font-bold py-2 px-4 uppercase tracking-wider text-xs transition-colors flex justify-center items-center gap-2"
        >
          {loadingWisdom ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />}
          {loadingWisdom ? 'Советуемся с духами...' : 'Получить мудрость'}
        </button>
      </div>

      {/* Ads */}
      <div className="space-y-6">
        {ADS.map((ad) => (
          <div key={ad.id} className="border-4 border-zinc-900 p-2 bg-white">
            <div className="border border-zinc-300 p-2 text-center">
                <img src={ad.imageUrl} alt={ad.company} className="w-full h-32 object-cover grayscale contrast-125 mb-2" />
                <h4 className="font-headline font-bold text-lg uppercase">{ad.company}</h4>
                <p className="font-serif-body text-xs italic mb-2">"{ad.tagline}"</p>
                <div className="bg-black text-white text-sm font-bold py-1 px-2 inline-block transform -rotate-2">
                    ЗВОНИТЕ: {ad.phone}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wanted Poster Mockup */}
      <div className="bg-[#e8e4d9] p-4 border border-zinc-400 text-center shadow-inner">
         <h3 className="font-headline font-bold text-2xl uppercase text-red-800 underline decoration-4 underline-offset-4 mb-2">РАЗЫСКИВАЕТСЯ</h3>
         <div className="w-32 h-32 bg-zinc-300 mx-auto mb-2 flex items-center justify-center border-2 border-zinc-800">
            <span className="text-zinc-500 text-xs">НЕТ ФОТО</span>
         </div>
         <p className="font-bold font-sans text-sm">Джон Доу</p>
         <p className="text-xs font-serif-body mb-2">Угон авто, Опрокидывание коров</p>
         <p className="text-red-700 font-bold text-lg">НАГРАДА $5,000</p>
      </div>
    </aside>
  );
};

export default Sidebar;