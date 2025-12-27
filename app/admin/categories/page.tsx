"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import CategoryList from "./CategoryList"

export default async function CategoriesPage() {
    const session = await auth()
    const role = (session?.user as any)?.role

    if (!session || !['ADMIN', 'CHIEF_EDITOR'].includes(role)) {
        redirect("/admin")
    }

    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
    })

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest block mb-2">← Назад в панель</Link>
                    <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter">
                        Управление Категориями
                    </h1>
                    <p className="text-zinc-600">Максимум 8 категорий. Они отображаются в главном меню.</p>
                </div>

                <div className="bg-white border-2 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <CategoryList initialCategories={JSON.parse(JSON.stringify(categories))} />
                </div>
            </div>
        </div>
    )
}
