"use client"

import Link from "next/link"
import { Home, Search, ArrowLeft, AlertTriangle, Zap, TrendingUp } from "lucide-react"

export default function NotFound() {
    const randomVisitors = Math.floor(Math.random() * 1000) + 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-[#e8e3d6] to-[#f4f1ea] flex items-center justify-center p-4 font-serif-body relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-red-200 border-4 border-red-600 rotate-12 opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 border-4 border-blue-600 -rotate-6 opacity-20 animate-pulse delay-150"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-200 border-4 border-yellow-600 rotate-45 opacity-20 animate-bounce"></div>
            </div>

            <div className="max-w-3xl w-full relative z-10">
                {/* ASCII Art Header */}
                <div className="bg-black text-green-400 border-4 border-black p-4 mb-4 font-mono text-xs overflow-x-auto shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
                    <pre className="whitespace-pre">
                        {`┌─────────────────────────────────────────────┐
│  ERROR 404: PAGE_NOT_FOUND                  │
│  System Status: [■■■■■■■░░░] CONFUSED 75%   │
└─────────────────────────────────────────────┘`}
                    </pre>
                </div>

                {/* Main Error Box with Glitch Effect */}
                <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 mb-6 hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                    {/* Warning Banner */}
                    <div className="mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 border-4 border-black p-4 animate-pulse">
                        <div className="flex items-center justify-center gap-3 text-white">
                            <AlertTriangle size={24} className="animate-bounce" />
                            <span className="font-bold uppercase tracking-widest text-sm">
                                КРИТИЧЕСКАЯ ОШИБКА НАВИГАЦИИ
                            </span>
                            <Zap size={24} className="animate-spin" />
                        </div>
                    </div>

                    {/* 404 Number with Glitch */}
                    <div className="text-center mb-8 select-none">
                        <div className="relative inline-block">
                            <h1 className="font-headline text-9xl md:text-[14rem] font-black uppercase tracking-tighter leading-none text-black relative z-10">
                                4
                                <span className="inline-block animate-bounce text-red-600">0</span>
                                4
                            </h1>
                            {/* Glitch layers */}
                            <h1 className="font-headline text-9xl md:text-[14rem] font-black uppercase tracking-tighter leading-none text-cyan-500 absolute top-0 left-1 opacity-70 -z-10 animate-pulse">
                                404
                            </h1>
                            <h1 className="font-headline text-9xl md:text-[14rem] font-black uppercase tracking-tighter leading-none text-red-500 absolute top-1 left-0 opacity-70 -z-10 animate-pulse delay-75">
                                404
                            </h1>
                        </div>
                        <p className="text-xs font-mono text-zinc-500 mt-2 animate-pulse">
                            [ERROR_CODE: 0x4F4]
                        </p>
                    </div>

                    {/* Colorful Status Boxes */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-purple-600 border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="text-2xl font-bold text-white">{randomVisitors}</div>
                            <div className="text-[10px] text-purple-100 uppercase font-bold">Потерянных</div>
                        </div>
                        <div className="bg-orange-600 border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="text-2xl font-bold text-white">∞</div>
                            <div className="text-[10px] text-orange-100 uppercase font-bold">Возможностей</div>
                        </div>
                        <div className="bg-teal-600 border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="text-2xl font-bold text-white">0</div>
                            <div className="text-[10px] text-teal-100 uppercase font-bold">Результатов</div>
                        </div>
                    </div>

                    {/* Error Messages */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-red-100 border-4 border-red-600 p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-red-600 animate-pulse"></div>
                            <p className="font-bold uppercase tracking-widest text-sm text-red-900 flex items-center gap-2">
                                <span className="animate-spin">⚠️</span> Ошибка: Страница не найдена
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-lg md:text-xl mb-4 font-bold flex items-center gap-2">
                                <span className="text-3xl">🤷‍♂️</span>
                                Упс! Кажется, вы заблудились в цифровом пространстве.
                            </p>
                            <p className="text-zinc-700 leading-relaxed mb-3">
                                Эта страница либо не существует, либо убежала в отпуск без предупреждения.
                                Мы обыскали весь интернет, проверили под диваном и даже спросили кота — ничего не нашли.
                            </p>
                            <div className="bg-white border-2 border-dashed border-zinc-400 p-3 flex items-center gap-3">
                                <TrendingUp className="text-emerald-600" size={20} />
                                <p className="text-sm text-zinc-600 italic">
                                    Но не волнуйтесь! Это хороший шанс начать всё заново 🚀
                                </p>
                            </div>
                        </div>

                        {/* Fun Facts with animation */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-4 border-yellow-600 p-4 shadow-[4px_4px_0px_0px_rgba(202,138,4,1)] hover:shadow-[8px_8px_0px_0px_rgba(202,138,4,1)] transition-all">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-yellow-900 flex items-center gap-2">
                                <span className="animate-pulse text-lg">💡</span> Забавный факт:
                            </p>
                            <p className="text-sm text-yellow-900">
                                Вы один из <strong className="text-orange-700">{randomVisitors}</strong> человек,
                                которые нашли эту страницу сегодня. Поздравляем! 🎉
                            </p>
                        </div>

                        {/* New: Motivational Box */}
                        <div className="bg-gradient-to-r from-pink-100 to-rose-100 border-4 border-pink-600 p-4 shadow-[4px_4px_0px_0px_rgba(219,39,119,1)]">
                            <p className="text-sm text-pink-900 font-bold text-center">
                                "Каждая ошибка — это возможность для нового пути" ✨
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons with hover effects */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 bg-black text-white p-4 font-bold uppercase text-sm tracking-widest hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <Home size={18} />
                            Домой
                        </Link>

                        <Link
                            href="/admin"
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white p-4 font-bold uppercase text-sm tracking-widest hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]"
                        >
                            <Search size={18} />
                            Админ
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 bg-emerald-600 text-white p-4 font-bold uppercase text-sm tracking-widest hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(5,150,105,1)] hover:shadow-[8px_8px_0px_0px_rgba(5,150,105,1)]"
                        >
                            <ArrowLeft size={18} />
                            Назад
                        </button>
                    </div>
                </div>

                {/* Footer Quote with gradient */}
                <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-4 border-black p-6 text-white text-center shadow-[12px_12px_0px_0px_rgba(239,68,68,1)] hover:shadow-[16px_16px_0px_0px_rgba(239,68,68,1)] transition-all">
                    <div className="border-t-4 border-b-4 border-white border-dashed py-3">
                        <p className="text-sm italic mb-2 text-zinc-100">
                            "Не все, кто блуждает, потеряны... но вы <span className="text-red-400 font-bold">точно</span> потерялись."
                        </p>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                            — Мудрость 404-й страницы
                        </p>
                    </div>
                </div>

                {/* New: Bottom ticker */}
                <div className="mt-4 bg-black border-2 border-yellow-400 p-2 overflow-hidden">
                    <div className="animate-pulse">
                        <p className="text-yellow-400 text-xs text-center font-mono uppercase tracking-wider">
                            ⚡ СИСТЕМА РАБОТАЕТ НОРМАЛЬНО ⚡ ОШИБКА ТОЛЬКО У ВАС ⚡ УДАЧИ ⚡
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
