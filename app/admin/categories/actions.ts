"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function checkPermission() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['ADMIN', 'CHIEF_EDITOR'].includes(role)) {
        throw new Error("Недостаточно прав");
    }
    return session;
}

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
    });
}

export async function createCategory(name: string) {
    try {
        await checkPermission();

        const count = await prisma.category.count();
        if (count >= 8) {
            return { success: false, message: "Максимальное количество категорий - 8" };
        }

        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

        await prisma.category.create({
            data: {
                name,
                slug,
            }
        });

        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true, message: "Категория создана" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка создания категории" };
    }
}

export async function updateCategory(id: string, name: string) {
    try {
        await checkPermission();

        // Get the old category name before updating
        const oldCategory = await prisma.category.findUnique({
            where: { id },
            select: { name: true }
        });

        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

        await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
            }
        });

        // If name changed, update all articles using this category
        if (oldCategory && oldCategory.name !== name) {
            await prisma.article.updateMany({
                where: { category: oldCategory.name },
                data: { category: name }
            });
        }

        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true, message: "Категория обновлена" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка обновления категории" };
    }
}

