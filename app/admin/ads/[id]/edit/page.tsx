import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateAd } from "../../../actions";
import { prisma } from "@/lib/prisma";
import { AdForm } from "../../AdForm";
import ImageUpload from "@/components/ImageUpload";
import PhoneInput from "@/app/components/PhoneInput";

export default async function EditAdPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session) redirect("/login");

    const ad = await prisma.ad.findUnique({
        where: { id },
    });

    if (!ad) {
        return notFound();
    }

    const updateAction = updateAd.bind(null, id);

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin/ads" className="text-zinc-500 hover:text-black">← Отмена</Link>
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Редактировать Рекламу</h1>
                </div>

                <AdForm action={updateAction} submitLabel="Сохранить">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Компания</label>
                            <input
                                name="company"
                                required
                                defaultValue={ad.company}
                                className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-50"
                                placeholder="Название компании..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Слоган</label>
                            <textarea
                                name="tagline"
                                required
                                rows={2}
                                defaultValue={ad.tagline}
                                className="w-full border-2 border-black p-2"
                                placeholder="Броский слоган..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Изображение</label>
                            <ImageUpload name="imageUrl" defaultValue={ad.imageUrl} previewClassName="aspect-video" />
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="bw"
                                    id="bw"
                                    defaultChecked={ad.bw}
                                    className="w-4 h-4 accent-black"
                                />
                                <label htmlFor="bw" className="text-sm font-bold uppercase cursor-pointer select-none">Черно-белое</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Телефон</label>
                            <PhoneInput
                                name="phone"
                                required
                                defaultValue={ad.phone}
                                className="w-full border-2 border-black p-2"
                                placeholder="555-0100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Текст Кнопки (необязательно)</label>
                            <input
                                name="buttonText"
                                defaultValue={ad.buttonText || ""}
                                className="w-full border-2 border-black p-2"
                                placeholder="Например: Купить сейчас"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Ссылка (необязательно)</label>
                            <input
                                name="buttonUrl"
                                defaultValue={ad.buttonUrl || ""}
                                className="w-full border-2 border-black p-2"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Районы (необязательно)</label>
                            <input
                                name="districts"
                                defaultValue={ad.districts || ""}
                                className="w-full border-2 border-black p-2"
                                placeholder="Палето-Бэй"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Статус публикации</label>
                            <select name="status" className="w-full border-2 border-black p-2 bg-white" defaultValue={(ad as any).status || "DRAFT"}>
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
                                    defaultValue={(ad as any).publishFrom ? new Date((ad as any).publishFrom).toISOString().slice(0, 16) : ""}
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Показывать до (необязательно)</label>
                                <input
                                    type="datetime-local"
                                    name="publishTo"
                                    defaultValue={(ad as any).publishTo ? new Date((ad as any).publishTo).toISOString().slice(0, 16) : ""}
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
