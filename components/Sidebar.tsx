import React, { useState } from 'react';
import { STOCKS } from '../constants';
import { Ad } from '../types';
import { TrendingUp, TrendingDown, Sparkles, Loader2 } from 'lucide-react';
import { generate2026NewYearWish } from '../services/geminiService';
import CensusWidget from './CensusWidget';

interface SidebarProps {
  ads: Ad[];
}

const Sidebar: React.FC<SidebarProps> = ({ ads }) => {
  const [wisdom, setWisdom] = useState<string | null>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(false);
  const [canRequest, setCanRequest] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);

  // Check localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('bcn_gemini_wisdom_2026');
    if (savedData) {
      const { text, timestamp, count } = JSON.parse(savedData);
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (now - timestamp < oneDay) {
        setWisdom(text);
        const currentCount = count || 1; // Fallback for legacy single-wish data
        setDailyCount(currentCount);

        if (currentCount >= 1) {
          setCanRequest(false);
        }
      } else {
        localStorage.removeItem('bcn_gemini_wisdom_2026');
        setDailyCount(0);
      }
    }
  }, []);

  const handleGetWisdom = async () => {
    setLoadingWisdom(true);
    const result = await generate2026NewYearWish();
    const now = new Date().getTime();

    // Determine timestamp: use existing start of day or set new if it's the first
    let startTime = now;
    const savedData = localStorage.getItem('bcn_gemini_wisdom_2026');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // If still within 24h window, keep the original start time
      if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
        startTime = parsed.timestamp;
      }
    }

    const newCount = dailyCount + 1;

    // Save to localStorage
    const dataToSave = {
      text: result,
      timestamp: startTime,
      count: newCount
    };
    localStorage.setItem('bcn_gemini_wisdom_2026', JSON.stringify(dataToSave));

    setWisdom(result);
    setDailyCount(newCount);

    if (newCount >= 1) {
      setCanRequest(false);
    }
    setLoadingWisdom(false);
  };

  return (
    <aside className="space-y-8">
      {/* FiveM Census Widget */}
      <CensusWidget />

      {/* Stocks Widget */}
      {/* <div className="bg-white border border-zinc-300 p-4 shadow-sm">
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
      </div> */}

      {/* Gemini AI Widget */}
      <div className="bg-zinc-900 text-[#f4f1ea] p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={100} />
        </div>
        <h3 className="font-newspaper text-2xl mb-2 relative z-10 text-yellow-500">Пророчества 2026</h3>
        <p className="text-xs font-serif-body text-zinc-400 mb-4 relative z-10">
          Мадам Назар видит грядущее...
        </p>

        {wisdom && (
          <div className="mb-4 p-3 bg-zinc-800 border-l-4 border-yellow-500 text-sm italic font-serif-body animate-fade-in">
            "{wisdom}"
          </div>
        )}

        {canRequest ? (
          <button
            onClick={handleGetWisdom}
            disabled={loadingWisdom}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-zinc-900 font-bold py-2 px-4 uppercase tracking-wider text-xs transition-colors flex justify-center items-center gap-2"
          >
            {loadingWisdom ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {loadingWisdom ? 'Гадаем...' : `Узнать судьбу`}
          </button>
        ) : (
          !loadingWisdom && (
            <div className="text-center py-2 px-4 border border-zinc-700 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-sans italic opacity-60">
              Лимит пророчеств исчерпан. Приходите завтра.
            </div>
          )
        )}
      </div>

      {/* Ads */}
      <div className="space-y-6">
        {ads.map((ad) => {
          const Content = () => (
            <div className="border-4 border-[#4b3634] p-2 bg-white transition-transform hover:scale-[1.02] cursor-pointer">
              <div className="border border-[#4b3634]/30 p-2 text-center relative group">
                <img src={ad.imageUrl} alt={ad.company} className={`w-full aspect-video object-cover contrast-125 mb-2 ${ad.bw ? 'grayscale' : ''}`} />
                <h4 className="font-headline font-bold text-lg uppercase text-[#4b3634]">{ad.company}</h4>
                {ad.districts && (
                  <p className="font-sans text-xs font-bold uppercase text-[#4b3634] tracking-widest mb-1">
                    District: {ad.districts}
                  </p>
                )}
                <p className="font-serif-body text-xs italic mb-2 text-[#4b3634]/80">"{ad.tagline}"</p>

                {ad.buttonText ? (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="bg-[#4b3634] text-[#faf8f3] text-sm font-bold py-2 px-4">
                      {ad.phone}
                    </div>
                    <span className="inline-block bg-red-700 text-white font-headline uppercase tracking-widest text-sm py-2 px-4 border-black">
                      {ad.buttonText}
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#4b3634] text-[#faf8f3] text-sm font-bold py-1 px-2 inline-block transform -rotate-2 mb-2">
                    ЗВОНИТЕ: {ad.phone}
                  </div>
                )}
              </div>
            </div>
          );

          return ad.buttonUrl ? (
            <a key={ad.id} href={ad.buttonUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Content />
            </a>
          ) : (
            <div key={ad.id}>
              <Content />
            </div>
          );
        })}
      </div>

      {/* Wanted Poster Mockup */}
      <div className="bg-[#e8e4d9] p-4 border border-zinc-400 text-center shadow-inner">
        <h3 className="font-headline font-bold text-2xl uppercase text-[#4b3634] underline decoration-4 underline-offset-4 mb-2">РАЗЫСКИВАЕТСЯ</h3>
        <div className="w-32 h-32 bg-zinc-300 mx-auto mb-2 flex items-center justify-center border-2 border-zinc-800">
          <span className="text-zinc-500 text-xs">НЕТ ФОТО</span>
        </div>
        <p className="font-bold font-sans text-sm">Джон Доу</p>
        <p className="text-xs font-serif-body mb-2">Угон авто, Опрокидывание коров</p>
        <p className="text-amber-700 font-bold text-lg">НАГРАДА $5,000</p>
      </div>
    </aside>
  );
};

export default Sidebar;
