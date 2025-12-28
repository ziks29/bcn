import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateArticle } from "../../../actions";
import { prisma } from "@/lib/prisma";
import ArticleEditorInput from "@/components/ArticleEditorInput";
import ImageUpload from "@/components/ImageUpload";
import { ArticleForm } from "../../ArticleForm";

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session) redirect("/login");

    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
    });

    const article = await prisma.article.findUnique({
        where: { id },
    });

    if (!article) {
        return notFound();
    }

    const updateAction = updateArticle.bind(null, id);

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin/articles" className="text-zinc-500 hover:text-black">← Отмена</Link>
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Редактировать Статью</h1>
                </div>

                <ArticleForm action={updateAction} submitLabel="Сохранить Изменения">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Заголовок</label>
                            <input
                                name="title"
                                required
                                defaultValue={article.title}
                                className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-50"
                                placeholder="Сенсационный заголовок..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Категория</label>
                                <select
                                    name="category"
                                    defaultValue={article.category}
                                    className="w-full border-2 border-black p-2 bg-white"
                                    required
                                >
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Автор (отображаемый)</label>
                                <input
                                    name="authorDisplay"
                                    defaultValue={article.authorDisplay}
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Статус публикации</label>
                            <select name="status" className="w-full border-2 border-black p-2 bg-white" defaultValue={(article as any).status || "DRAFT"}>
                                <option value="DRAFT">Черновик</option>
                                <option value="PENDING">На рассмотрении</option>
                                <option value="PUBLISHED">Опубликовано</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Опубликовать с (необязательно)</label>
                                <input
                                    type="datetime-local"
                                    name="publishFrom"
                                    defaultValue={(article as any).publishFrom ? new Date((article as any).publishFrom).toISOString().slice(0, 16) : ""}
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Опубликовать до (необязательно)</label>
                                <input
                                    type="datetime-local"
                                    name="publishTo"
                                    defaultValue={(article as any).publishTo ? new Date((article as any).publishTo).toISOString().slice(0, 16) : ""}
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Изображение</label>
                            <ImageUpload name="image" defaultValue={article.image} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Краткое описание (Лид)</label>
                            <textarea
                                name="excerpt"
                                required
                                rows={3}
                                defaultValue={article.excerpt}
                                className="w-full border-2 border-black p-2"
                                placeholder="Краткое содержание для главной страницы..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Текст статьи</label>
                            <ArticleEditorInput initialContent={article.content} articleId={article.id} />
                        </div>
                    </div>
                </ArticleForm>
            </div>
        </div>
    );
}
