import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateAd } from "../../../actions";
import { prisma } from "@/lib/prisma";
import { AdForm } from "../../AdForm";

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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Телефон</label>
                                <input
                                    name="phone"
                                    required
                                    defaultValue={ad.phone}
                                    className="w-full border-2 border-black p-2"
                                    placeholder="555-0100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Изображение (URL)</label>
                                <input
                                    name="imageUrl"
                                    required
                                    defaultValue={ad.imageUrl}
                                    className="w-full border-2 border-black p-2 font-mono text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </AdForm>
            </div>
        </div>
    );
}
