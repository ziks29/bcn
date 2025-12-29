import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAd } from "../../actions";
import { AdForm } from "../AdForm";
import ImageUpload from "@/components/ImageUpload";

export default async function NewAdPage() {
    const session = await auth();
    if (!session) redirect("/login");

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin/ads" className="text-zinc-500 hover:text-black">← Отмена</Link>
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Новая Реклама</h1>
                </div>

                <AdForm action={createAd} submitLabel="Создать">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Компания</label>
                            <input name="company" required className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-50" placeholder="Название компании..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Слоган</label>
                            <textarea name="tagline" required rows={2} className="w-full border-2 border-black p-2" placeholder="Броский слоган..."></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Изображение</label>
                            <ImageUpload name="imageUrl" previewClassName="aspect-video" />
                            <div className="mt-2 flex items-center gap-2">
                                <input type="checkbox" name="bw" id="bw" defaultChecked className="w-4 h-4 accent-black" />
                                <label htmlFor="bw" className="text-sm font-bold uppercase cursor-pointer select-none">Черно-белое</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Телефон</label>
                            <input name="phone" required className="w-full border-2 border-black p-2" placeholder="555-0100" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Текст Кнопки (необязательно)</label>
                            <input name="buttonText" className="w-full border-2 border-black p-2" placeholder="Например: Купить сейчас" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Ссылка (необязательно)</label>
                            <input name="buttonUrl" className="w-full border-2 border-black p-2" placeholder="https://..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Районы (необязательно)</label>
                            <input name="districts" className="w-full border-2 border-black p-2" placeholder="Палето-Бэй" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Статус публикации</label>
                            <select name="status" className="w-full border-2 border-black p-2 bg-white" defaultValue="DRAFT">
                                <option value="DRAFT">Черновик</option>
                                <option value="PENDING">На рассмотрении</option>
                                <option value="PUBLISHED">Опубликовано</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Показывать с (необязательно)</label>
                                <input
                                    type="datetime-local"
                                    name="publishFrom"
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Показывать до (необязательно)</label>
                                <input
                                    type="datetime-local"
                                    name="publishTo"
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                        </div>
                    </div>
                </AdForm>
            </div>
        </div>
    );
}
