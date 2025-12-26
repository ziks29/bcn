import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { DeleteArticleButton } from "./DeleteArticleButton";

export default async function ArticlesPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const articles = await prisma.article.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/admin" className="text-zinc-500 hover:text-black">← Назад</Link>
                        <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Новости</h1>
                    </div>
                    <Link href="/admin/articles/new" className="bg-black text-white px-4 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors">
                        + Создать
                    </Link>
                </div>

                <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <th className="pb-4">Заголовок</th>
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
                                        <td className="py-4 pr-4 font-bold">{article.title}</td>
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
                </div>
            </div>
        </div>
    );
}
