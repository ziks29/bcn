import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { DeleteAdButton } from "./DeleteAdButton";

export default async function AdsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    // Only ADMIN, CHIEF_EDITOR, and EDITOR can manage ads
    const role = (session.user as any)?.role;
    if (role === "AUTHOR") {
        redirect("/admin");
    }

    const ads = await prisma.ad.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/admin" className="text-zinc-500 hover:text-black">← Назад</Link>
                        <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Реклама</h1>
                    </div>
                    <Link href="/admin/ads/new" className="bg-black text-white px-4 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors">
                        + Создать
                    </Link>
                </div>

                <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <th className="pb-4">Компания</th>
                                <th className="pb-4">Слоган</th>
                                <th className="pb-4">Телефон</th>
                                <th className="pb-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map((ad) => (
                                <tr key={ad.id} className="border-b border-zinc-200 hover:bg-zinc-50 font-serif-body">
                                    <td className="py-4 pr-4 font-bold max-w-[200px] truncate">{ad.company}</td>
                                    <td className="py-4 pr-4 max-w-[300px] truncate">
                                        {ad.tagline}
                                    </td>
                                    <td className="py-4 pr-4 text-sm text-zinc-500">
                                        {ad.phone}
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <Link
                                                href={`/admin/ads/${ad.id}/edit`}
                                                className="p-2 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                title="Редактировать"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <DeleteAdButton id={ad.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ads.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-zinc-400 italic">
                                        Нет активной рекламы.
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
