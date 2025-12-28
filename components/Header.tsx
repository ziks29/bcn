"use client";

import React, { useState } from 'react';
import { Menu, Search, Sun, CloudRain, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Category } from '../types';

interface HeaderProps {
  onCategorySelect: (categoryName: string | 'HOME') => void;
  categories: string[];
}

const Header: React.FC<HeaderProps> = ({ onCategorySelect, categories }) => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Use Russian locale for date
  const currentDate = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMobileNavClick = (categoryName: string | 'HOME') => {
    onCategorySelect(categoryName);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-[#faf8f3]">
        {/* Top Bar */}
        <div className="text-xs font-sans md:font-headline grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] items-center border-b border-zinc-200 md:border-none">
          <div className="bg-[#4b3634] text-[#faf8f3] p-2 pl-4 text-center md:text-left">
            <span className="font-headline md:font-sans font-bold uppercase tracking-wider">{currentDate}</span>
          </div>
          <p className="hidden md:block text-center uppercase tracking-wider text-lg font-headline">
            СДЕЛАЕМ НОВОСТИ ВЕЛИКИМИ СНОВА
          </p>
          <div className="p-2 bg-[#4b3634] text-[#faf8f3] pr-4 h-full hidden md:flex justify-end items-center">
            {session ? (
              <Link href="/admin" className="hover:text-amber-700 hover:underline transition-colors uppercase font-bold tracking-wider">
                Редакторская
              </Link>
            ) : (
              <Link href="/login" className="hover:text-amber-700 hover:underline transition-colors uppercase font-bold tracking-wider">
                Вход для журналистов
              </Link>
            )}
          </div>
        </div>

        {/* Main Logo Area */}
        <div className="py-4 md:py-6 flex flex-col items-center justify-center relative px-4 text-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 lg:block hidden">
            <div className="text-center border-2 border-zinc-800 p-2 transform -rotate-2">
              <p className="text-xs font-bold uppercase tracking-widest">Осн. 1924</p>
              <p className="text-[10px] italic">"Правда не обязательна"</p>
            </div>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-8xl font-brand text-white cursor-pointer hover:scale-[1.01] transition-transform duration-300 text-center uppercase tracking-widest italic"
            onClick={() => onCategorySelect('HOME')}
            style={{
              textShadow: `
                -1px 1px 0px #000,
                -2px 2px 0px #000,
                -3px 3px 0px #000,
                -4px 4px 0px #000,
                -5px 5px 0px #000,
                -6px 6px 0px #000,
                -7px 7px 0px #000,
                -8px 8px 0px #000
              `,
              WebkitTextStroke: '2px #000',
              paintOrder: 'stroke fill',
              letterSpacing: '0.03em',
            }}
          >
            Blaine County Gazette
          </h1>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 md:block hidden">
            <button className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
              <Search className="text-zinc-800" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 bg-[#4b3634] text-white py-2 shadow-sm border-y border-black">
        <div className="container mx-auto px-4">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex justify-between items-center">
            <button onClick={toggleMenu} className="p-1 focus:outline-none" aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="font-headline font-bold uppercase tracking-widest text-sm">Навигация</span>
            <Search size={20} className="text-zinc-300" />
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex justify-center space-x-8 font-serif-body font-bold text-sm tracking-widest uppercase">
            {categories.map((catName) => (
              <li
                key={catName}
                className="cursor-pointer hover:text-amber-700 hover:underline decoration-2 underline-offset-4"
                onClick={() => onCategorySelect(catName)}
              >
                {catName}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Nav Drawer */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#faf8f3] text-zinc-900 absolute top-full left-0 w-full border-b-4 border-[#4b3634] animate-fade-in shadow-2xl">
            <ul className="flex flex-col p-4 space-y-2 font-serif-body font-bold text-lg tracking-widest uppercase">
              {categories.map((catName) => (
                <li
                  key={catName}
                  className="cursor-pointer hover:bg-zinc-200 p-3 border-b border-zinc-200"
                  onClick={() => handleMobileNavClick(catName)}
                >
                  {catName}
                </li>
              ))}
              <li className="pt-4 flex justify-between items-center text-[10px] text-zinc-400 font-sans tracking-normal uppercase">
                <span>&copy; Blaine Gazette 2025</span>
                {session ? (
                  <Link href="/admin" className="text-amber-700 font-bold" onClick={() => setIsMenuOpen(false)}>Редакторская</Link>
                ) : (
                  <Link href="/login" className="text-amber-700 font-bold" onClick={() => setIsMenuOpen(false)}>Вход для журналистов</Link>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
