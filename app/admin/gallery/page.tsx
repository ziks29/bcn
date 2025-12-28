
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GalleryManager from "./GalleryManager";
import { getGalleryItemsWithUsage } from "./actions";
import Link from "next/link";

export default async function GalleryPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const items = await getGalleryItemsWithUsage();

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/admin" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest">← Назад</Link>
                        <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter mt-2">Галерея</h1>
                    </div>
                </div>

                <GalleryManager initialItems={items} />
            </div>
        </div>
    );
}
