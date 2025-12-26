import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAd } from "../../actions";
import { AdForm } from "../AdForm";

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

                <AdForm action={createAd} submitLabel="\u0421\u043e\u0437\u0434\u0430\u0442\u044c">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f</label>
                            <input name="company" required className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-50" placeholder="\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0433\u0438..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">\u0421\u043b\u043e\u0433\u0430\u043d</label>
                            <textarea name="tagline" required rows={2} className="w-full border-2 border-black p-2" placeholder="\u0411\u0440\u043e\u0441\u043a\u0438\u0439 \u0441\u043b\u043e\u0433\u0430\u043d..."></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">\u0422\u0435\u043b\u0435\u0444\u043e\u043d</label>
                                <input name="phone" required className="w-full border-2 border-black p-2" placeholder="555-0100" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 (URL)</label>
                                <input name="imageUrl" required className="w-full border-2 border-black p-2 font-mono text-sm" placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </AdForm>
            </div>
        </div>
    );
}
