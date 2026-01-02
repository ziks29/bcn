import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import StatsWidget from "@/components/StatsWidget"
import { getDashboardStats } from "./actions"

export default async function AdminPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Get pending/draft counts
    const pendingArticles = await prisma.article.count({ where: { status: "PENDING" } })
    const draftArticles = await prisma.article.count({ where: { status: "DRAFT" } })
    const pendingAds = await prisma.ad.count({ where: { status: "PENDING" } })
    const draftAds = await prisma.ad.count({ where: { status: "DRAFT" } })

    // Fetch dashboard stats for ADMIN and CHIEF_EDITOR
    const role = (session.user as any)?.role;
    const stats = ['ADMIN', 'CHIEF_EDITOR'].includes(role) ? await getDashboardStats() : null;

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest block mb-2">← На главную</Link>
                        <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter">
                            Панель Редактора
                        </h1>
                    </div>
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}
                        className="w-full sm:w-auto"
                    >
                        <button className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-zinc-800 transition-colors text-sm sm:text-base w-full sm:w-auto">
                            Выйти
                        </button>
                    </form>
                </div>

                <div className="bg-white border-2 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Пользователь</p>
                            <p className="font-bold text-lg sm:text-xl">{session.user?.name}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Роль</p>
                            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                                {(session.user as any)?.role || "Unknown"}
                            </span>
                        </div>
                    </div>
                    <div className="border-t border-zinc-200 pt-4 mt-2">
                        <Link href="/admin/profile" className="text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:underline flex items-center gap-2">
                            <span>⚙️ Настройки Профиля</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Widget - Only for ADMIN and CHIEF_EDITOR */}
                {stats && (
                    <StatsWidget stats={stats} />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Link href="/admin/articles" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                        <div>
                            <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-red-700">Управление Статьями</h3>
                            <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Создание, редактирование и удаление новостных материалов.</p>
                            <div className="flex gap-2 flex-wrap">
                                {pendingArticles > 0 && (
                                    <span className="bg-orange-500 text-white px-2 py-1 text-xs font-bold uppercase">
                                        {pendingArticles} на рассмотрении
                                    </span>
                                )}
                                {draftArticles > 0 && (
                                    <span className="bg-zinc-400 text-white px-2 py-1 text-xs font-bold uppercase">
                                        {draftArticles} черновиков
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-red-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                    </Link>

                    {/* Ads: Admin, Chief, Editor */}
                    {['ADMIN', 'CHIEF_EDITOR', 'EDITOR'].includes((session.user as any)?.role) && (
                        <Link href="/admin/ads" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                            <div>
                                <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-blue-700">Управление Рекламой</h3>
                                <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Управление рекламными объявлениями в боковой панели.</p>
                                <div className="flex gap-2 flex-wrap">
                                    {pendingAds > 0 && (
                                        <span className="bg-orange-500 text-white px-2 py-1 text-xs font-bold uppercase">
                                            {pendingAds} на рассмотрении
                                        </span>
                                    )}
                                    {draftAds > 0 && (
                                        <span className="bg-zinc-400 text-white px-2 py-1 text-xs font-bold uppercase">
                                            {draftAds} черновиков
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-blue-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                        </Link>
                    )}

                    {/* Users: Admin & Chief Only */}
                    {['ADMIN', 'CHIEF_EDITOR'].includes((session.user as any)?.role) && (
                        <>
                            <Link href="/admin/users" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                                <div>
                                    <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-purple-700">Сотрудники</h3>
                                    <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Управление пользователями, ролями и доступом.</p>
                                </div>
                                <span className="text-purple-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                            </Link>

                            <Link href="/admin/categories" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                                <div>
                                    <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-amber-700">Категории</h3>
                                    <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Настройка навигации. Максимум 8 категорий.</p>
                                </div>
                                <span className="text-amber-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                            </Link>

                            <Link href="/admin/contacts" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                                <div>
                                    <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-teal-700">Контакты</h3>
                                    <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Управление контактами редакции.</p>
                                </div>
                                <span className="text-teal-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                            </Link>
                        </>
                    )}

                    <Link href="/admin/notifications" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                        <div>
                            <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-pink-700">Рассылки</h3>
                            <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Внутренние уведомления для сотрудников.</p>
                        </div>
                        <span className="text-pink-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                    </Link>

                    <Link href="/admin/gallery" className="bg-white border-2 border-black p-5 md:p-6 active:translate-x-1 active:translate-y-1 md:hover:translate-x-1 md:hover:translate-y-1 transition-transform cursor-pointer group block min-h-[140px] flex flex-col justify-between">
                        <div>
                            <h3 className="font-newspaper text-xl sm:text-2xl font-bold mb-2 group-hover:underline decoration-green-700">Галерея</h3>
                            <p className="text-zinc-600 text-sm sm:text-base mb-3 md:mb-4">Загрузка изображений для статей.</p>
                        </div>
                        <span className="text-green-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
