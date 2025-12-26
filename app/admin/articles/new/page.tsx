import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createArticle } from "../../actions";
import ArticleEditorInput from "@/components/ArticleEditorInput";
import ImageUpload from "@/components/ImageUpload";
import { ArticleForm } from "../ArticleForm";

// Enum values for selection
const CATEGORIES = [
    "Местные новости",
    "Криминал",
    "Политика",
    "Мнение",
    "Бизнес и Мет",
    "Стиль жизни"
];

export default async function NewArticlePage() {
    const session = await auth();
    if (!session) redirect("/login");

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { id: session.user?.id } });

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin/articles" className="text-zinc-500 hover:text-black">← Отмена</Link>
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Новая Статья</h1>
                </div>

                <ArticleForm action={createArticle} submitLabel="Опубликовать">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Заголовок</label>
                            <input name="title" required className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-50" placeholder="Сенсационный заголовок..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Категория</label>
                                <select name="category" className="w-full border-2 border-black p-2 bg-white" required>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Автор (отображаемый)</label>
                                <input name="authorDisplay" defaultValue={user?.displayName || "Редакция"} className="w-full border-2 border-black p-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Изображение</label>
                            <ImageUpload name="image" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Краткое описание (Лид)</label>
                            <textarea name="excerpt" required rows={3} className="w-full border-2 border-black p-2" placeholder="Краткое содержание для главной страницы..."></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Текст статьи</label>
                            <ArticleEditorInput initialContent="" />
                        </div>
                    </div>
                </ArticleForm>
            </div>
        </div>
    );
}
