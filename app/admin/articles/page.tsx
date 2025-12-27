import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { DeleteArticleButton } from "./DeleteArticleButton";

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const params = await searchParams;
    const statusFilter = params.status?.toUpperCase() || "ALL";

    const articles = await prisma.article.findMany({
        where: statusFilter === "ALL" ? {} : { status: statusFilter },
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: {
                    displayName: true,
                    username: true
                }
            }
        }
    });

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/admin" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest">← Назад</Link>
                        <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter mt-2">Новости</h1>
                    </div>
                    <Link href="/admin/articles/new" className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-zinc-800 transition-colors text-sm sm:text-base w-full sm:w-auto text-center">
                        + Создать
                    </Link>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b-2 border-zinc-200 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Link
                        href="/admin/articles?status=all"
                        className={`px-4 py-3 font-bold uppercase text-sm whitespace-nowrap snap-start ${statusFilter === "ALL" ? "border-b-4 border-black" : "text-zinc-500 hover:text-black"}`}
                    >
                        Все
                    </Link>
                    <Link
                        href="/admin/articles?status=published"
                        className={`px-4 py-3 font-bold uppercase text-sm whitespace-nowrap snap-start ${statusFilter === "PUBLISHED" ? "border-b-4 border-black" : "text-zinc-500 hover:text-black"}`}
                    >
                        Опубликованные
                    </Link>
                    <Link
                        href="/admin/articles?status=pending"
                        className={`px-4 py-3 font-bold uppercase text-sm whitespace-nowrap snap-start ${statusFilter === "PENDING" ? "border-b-4 border-black" : "text-zinc-500 hover:text-black"}`}
                    >
                        На рассмотрении
                    </Link>
                    <Link
                        href="/admin/articles?status=draft"
                        className={`px-4 py-3 font-bold uppercase text-sm whitespace-nowrap snap-start ${statusFilter === "DRAFT" ? "border-b-4 border-black" : "text-zinc-500 hover:text-black"}`}
                    >
                        Черновики
                    </Link>
                </div>

                <div className="bg-white border-2 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {/* Desktop Table View */}
                    <table className="hidden md:table w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <th className="pb-4">Заголовок</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4">Категория</th>
                                <th className="pb-4">Дата</th>
                                <th className="pb-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => {
                                const userRole = (session.user as any)?.role;
                                const userId = (session.user as any)?.id;
                                const canEdit = userRole !== "AUTHOR" || article.authorId === userId;

                                return (
                                    <tr key={article.id} className="border-b border-zinc-200 hover:bg-zinc-50 font-serif-body">
                                        <td className="py-4 pr-4 font-bold">
                                            <Link href={`/articles/${article.slug}`} className="hover:underline hover:text-blue-900 transition-colors" title="Предпросмотр">
                                                {article.title}
                                            </Link>
                                            <div className="text-xs text-zinc-500 font-normal mt-1">
                                                Автор: {(article as any).author?.displayName || (article as any).author?.username || "Unknown"}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className={`text-xs uppercase tracking-widest px-2 py-1 font-bold ${(article as any).status === "PUBLISHED" ? "bg-green-500 text-white" :
                                                (article as any).status === "PENDING" ? "bg-orange-500 text-white" :
                                                    "bg-zinc-400 text-white"
                                                }`}>
                                                {(article as any).status === "PUBLISHED" ? "Опубликовано" :
                                                    (article as any).status === "PENDING" ? "На рассмотрении" :
                                                        "Черновик"}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-xs uppercase tracking-widest border border-zinc-300 px-1 rounded">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-zinc-500">
                                            {article.createdAt.toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-right">
                                            {canEdit ? (
                                                <div className="flex justify-end gap-2 items-center">
                                                    <Link
                                                        href={`/admin/articles/${article.id}/edit`}
                                                        className="p-2 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <DeleteArticleButton id={article.id} />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-400 italic">Только просмотр</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-zinc-400 italic">
                                        Нет опубликованных новостей.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {articles.map((article) => {
                            const userRole = (session.user as any)?.role;
                            const userId = (session.user as any)?.id;
                            const canEdit = userRole !== "AUTHOR" || article.authorId === userId;

                            return (
                                <div key={article.id} className="border-2 border-zinc-200 p-4 space-y-3">
                                    <h3 className="font-bold text-base mb-2">
                                        <Link href={`/articles/${article.slug}`} className="hover:underline hover:text-blue-900 transition-colors" title="Предпросмотр">
                                            {article.title}
                                        </Link>
                                    </h3>
                                    <div className="text-xs text-zinc-500 mb-2">
                                        Автор: {(article as any).author?.displayName || (article as any).author?.username || "Unknown"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
                                        <span className={`text-xs uppercase tracking-widest px-2 py-1 font-bold ${(article as any).status === "PUBLISHED" ? "bg-green-500 text-white" :
                                            (article as any).status === "PENDING" ? "bg-orange-500 text-white" :
                                                "bg-zinc-400 text-white"
                                            }`}>
                                            {(article as any).status === "PUBLISHED" ? "Опубликовано" :
                                                (article as any).status === "PENDING" ? "На рассмотрении" :
                                                    "Черновик"}
                                        </span>
                                        <span className="text-xs uppercase tracking-widest border border-zinc-300 px-2 py-1 rounded">
                                            {article.category}
                                        </span>
                                        <span>{article.createdAt.toLocaleDateString()}</span>
                                    </div>

                                    {
                                        canEdit ? (
                                            <div className="flex gap-2 pt-2 border-t border-zinc-200">
                                                <Link
                                                    href={`/admin/articles/${article.id}/edit`}
                                                    className="flex-1 bg-blue-700 text-white py-2 px-4 text-center font-bold uppercase text-sm hover:bg-blue-800 transition-colors"
                                                >
                                                    Редактировать
                                                </Link>
                                                <DeleteArticleButton id={article.id} />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-zinc-400 italic pt-2 border-t border-zinc-200">Только просмотр</p>
                                        )
                                    }
                                </div>
                            )
                        })}
                        {articles.length === 0 && (
                            <div className="py-12 text-center text-zinc-400 italic">
                                Нет опубликованных новостей.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
