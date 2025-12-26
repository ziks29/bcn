import React from 'react';
import { Menu, Search, Sun, CloudRain } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Category } from '../types';

interface HeaderProps {
  onCategorySelect: (category: Category | 'HOME') => void;
}

const Header: React.FC<HeaderProps> = ({ onCategorySelect }) => {
  const { data: session } = useSession();
  // Use Russian locale for date
  const currentDate = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <header className="bg-[#f4f1ea]">
        {/* Top Bar */}
        <div className="bg-zinc-800 text-[#f4f1ea] text-xs py-1 px-4 flex justify-between items-center font-sans">
          <div className="flex space-x-4">
            <span>ВЫПУСК CXXIV... № 42,910</span>
            <span className="hidden md:inline">Единственный надежный источник новостей округа Блейн</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="capitalize">{currentDate}</span>
            <span className="mx-2">|</span>
            <div className="flex items-center">
              <Sun size={14} className="mr-1 text-yellow-500" />
              <span>40°C (Сухо)</span>
            </div>
            <span className="mx-2">|</span>
            {session ? (
              <Link href="/admin" className="hover:text-red-400 hover:underline transition-colors uppercase font-bold text-[10px] tracking-wider text-green-400">
                Редакторская
              </Link>
            ) : (
              <Link href="/login" className="hover:text-red-400 hover:underline transition-colors uppercase font-bold text-[10px] tracking-wider">
                Вход для журналистов
              </Link>
            )}
          </div>
        </div>

        {/* Main Logo Area */}
        <div className="py-6 flex flex-col items-center justify-center relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 md:block hidden">
            <div className="text-center border-2 border-zinc-800 p-2 transform -rotate-2">
              <p className="text-xs font-bold uppercase tracking-widest">Осн. 1924</p>
              <p className="text-[10px] italic">"Правда не обязательна"</p>
            </div>
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-8xl font-brand text-zinc-900 cursor-pointer hover:scale-[1.01] transition-transform duration-300 text-center"
            onClick={() => onCategorySelect('HOME')}
          >
            Blaine County News
          </h1>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 md:block hidden">
            <button className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
              <Search className="text-zinc-800" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 bg-[#f4f1ea] border-t-2 border-b-4 border-double border-zinc-800 py-2 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Mobile Menu Icon */}
          <div className="md:hidden flex justify-center">
            <Menu className="cursor-pointer" />
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex justify-center space-x-8 font-serif-body font-bold text-sm tracking-widest uppercase">
            <li
              className="cursor-pointer hover:text-red-700 hover:underline decoration-2 underline-offset-4"
              onClick={() => onCategorySelect('HOME')}
            >
              Главная
            </li>
            {Object.values(Category).map((cat) => (
              <li
                key={cat}
                className="cursor-pointer hover:text-red-700 hover:underline decoration-2 underline-offset-4"
                onClick={() => onCategorySelect(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;