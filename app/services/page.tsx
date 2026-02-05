import Footer from "@/components/Footer";
import Link from "next/link";
import { Video, Megaphone, FileText, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/utils";

// Force dynamic rendering - this page queries the database
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const contacts = await prisma.contact.findMany({
        orderBy: { order: 'asc' }
    });
    return (
        <div className="min-h-screen flex flex-col font-serif-body bg-[#faf8f3]">
            {/* Simple Header */}
            <header className="bg-[#faf8f3] border-b-8 border-[#4b3634]">
                <div className="py-4 md:py-6 flex flex-col items-center justify-center relative px-4 text-center">
                    <Link href="/">
                        <h1
                            className="text-5xl md:text-6xl lg:text-8xl font-brand text-white cursor-pointer hover:scale-[1.01] transition-transform duration-300 text-center uppercase tracking-widest italic"
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
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Header */}
                <div className="border-b-4 border-black mb-12 pb-4">
                    <h1 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-tight mb-2">
                        Медиа и продакшн услуги
                    </h1>
                    <p className="text-lg text-zinc-600 italic">Blaine County News — ваш партнёр в мире медиа</p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

                    {/* Content & Design */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-4 border-b-2 border-zinc-200 pb-3">
                            <FileText className="text-[#4b3634]" size={32} />
                            <h2 className="font-headline text-2xl font-bold uppercase">Контент и дизайн</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Статьи и журналы</span>
                                <span className="font-bold text-[#4b3634]">от 4 000$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Фотосессия</span>
                                <span className="font-bold text-[#4b3634]">от 6 500$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Обработка фото</span>
                                <span className="font-bold text-[#4b3634]">от 750$/кадр</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Графический дизайн</span>
                                <span className="font-bold text-[#4b3634]">от 2 500$</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="font-medium">Креативный копирайтинг</span>
                                <span className="font-bold text-[#4b3634]">от 1 000$</span>
                            </li>
                        </ul>
                    </div>

                    {/* Video Production */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-4 border-b-2 border-zinc-200 pb-3">
                            <Video className="text-[#4b3634]" size={32} />
                            <h2 className="font-headline text-2xl font-bold uppercase">Видео-продакшн</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Съемка/Монтаж</span>
                                <span className="font-bold text-[#4b3634]">от 4 000$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Заказное интервью</span>
                                <span className="font-bold text-[#4b3634]">от 2 500$</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="font-medium">Заказной репортаж</span>
                                <span className="font-bold text-[#4b3634]">от 2 500$</span>
                            </li>
                        </ul>
                    </div>

                    {/* Advertising */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-4 border-b-2 border-zinc-200 pb-3">
                            <Megaphone className="text-[#4b3634]" size={32} />
                            <h2 className="font-headline text-2xl font-bold uppercase">Реклама и продвижение</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Разворот в журнале</span>
                                <span className="font-bold text-[#4b3634]">от 1 000$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Реклама на портале</span>
                                <span className="font-bold text-[#4b3634]">2 000$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Упоминание в видео/репортаже</span>
                                <span className="font-bold text-[#4b3634]">от 2 000$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Рассылки от агентства</span>
                                <span className="font-bold text-[#4b3634]">65$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Печать меню</span>
                                <span className="font-bold text-[#4b3634]">35$</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Печать визитки</span>
                                <span className="font-bold text-[#4b3634]">50$</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="font-medium">Сайты</span>
                                <span className="font-bold text-[#4b3634]">от 9 000$</span>
                            </li>
                        </ul>
                    </div>

                    {/* Additional Services */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-4 border-b-2 border-zinc-200 pb-3">
                            <Globe className="text-[#4b3634]" size={32} />
                            <h2 className="font-headline text-2xl font-bold uppercase">Дополнительно</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="font-medium">Медиа-расследования</span>
                                <span className="font-bold text-[#4b3634]">от 2 500$</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="font-medium">Полная рекламная кампания</span>
                                <span className="font-bold text-[#4b3634]">от 7 000$</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Contact Section */}
                <div className="bg-[#4b3634] text-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="font-headline text-3xl font-bold uppercase mb-4 text-center">
                        Свяжитесь с нами
                    </h2>
                    <p className="text-center text-lg mb-6 italic">
                        За остальными услугами редакции обращайтесь по телефонам или посетите нас лично
                    </p>
                    <div className="text-center mb-6">
                        <p className="text-2xl font-bold mb-4">Blaine County News</p>
                        <p className="text-lg mb-6">Harmony, Senora Road | 4006</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {contacts.map(contact => (
                                <div key={contact.id} className="bg-white/10 p-3 rounded border border-white/20">

                                    <p className="font-bold">{contact.name}</p>
                                    <p className="text-amber-300">{formatPhone(contact.phone)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
