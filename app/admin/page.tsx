import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest block mb-2">← На главную</Link>
                        <h1 className="font-headline text-4xl uppercase tracking-tighter">
                            Панель Редактора
                        </h1>
                    </div>
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}
                    >
                        <button className="bg-black text-white px-4 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors">
                            Выйти
                        </button>
                    </form>
                </div>

                <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Пользователь</p>
                            <p className="font-bold text-xl">{session.user?.name}</p>
                        </div>
                        <div className="text-right">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/admin/articles" className="bg-white border-2 border-black p-6 hover:translate-x-1 hover:translate-y-1 transition-transform cursor-pointer group block">
                        <h3 className="font-newspaper text-2xl font-bold mb-2 group-hover:underline decoration-red-700">Управление Статьями</h3>
                        <p className="text-zinc-600 mb-4">Создание, редактирование и удаление новостных материалов.</p>
                        <span className="text-red-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                    </Link>

                    {/* Ads: Admin, Chief, Editor */}
                    {['ADMIN', 'CHIEF_EDITOR', 'EDITOR'].includes((session.user as any)?.role) && (
                        <Link href="/admin/ads" className="bg-white border-2 border-black p-6 hover:translate-x-1 hover:translate-y-1 transition-transform cursor-pointer group block">
                            <h3 className="font-newspaper text-2xl font-bold mb-2 group-hover:underline decoration-blue-700">Управление Рекламой</h3>
                            <p className="text-zinc-600 mb-4">Управление рекламными объявлениями в боковой панели.</p>
                            <span className="text-blue-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                        </Link>
                    )}

                    {/* Users: Admin & Chief Only */}
                    {['ADMIN', 'CHIEF_EDITOR'].includes((session.user as any)?.role) && (
                        <Link href="/admin/users" className="bg-white border-2 border-black p-6 hover:translate-x-1 hover:translate-y-1 transition-transform cursor-pointer group block">
                            <h3 className="font-newspaper text-2xl font-bold mb-2 group-hover:underline decoration-purple-700">Сотрудники</h3>
                            <p className="text-zinc-600 mb-4">Управление пользователями, ролями и доступом.</p>
                            <span className="text-purple-800 text-xs font-bold uppercase tracking-widest">Перейти &rarr;</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
