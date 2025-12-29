"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Basic slugify function
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export async function deleteArticle(id: string) {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, message: "Не авторизован" };
        }

        const role = (session.user as any)?.role;
        const userId = session.user?.id;

        // Check ownership for AUTHORS
        if (role === "AUTHOR") {
            const article = await prisma.article.findUnique({ where: { id } });
            if (!article || article.authorId !== userId) {
                return { success: false, message: "Вы можете удалять только свои статьи" };
            }
        }

        await prisma.article.delete({ where: { id } });

        revalidatePath("/admin/articles");
        revalidatePath("/");
        return { success: true, message: "Статья удалена" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка удаления статьи" };
    }
}

export async function createArticle(formData: FormData) {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, message: "Не авторизован" };
        }

        const title = formData.get("title") as string;
        const excerpt = formData.get("excerpt") as string;
        const content = formData.get("content") as string;
        const category = formData.get("category") as string;
        const image = formData.get("image") as string;
        const authorDisplay = formData.get("authorDisplay") as string || "Редакция";
        const status = formData.get("status") as string || "DRAFT";
        const publishFrom = formData.get("publishFrom") as string;
        const publishTo = formData.get("publishTo") as string;

        if (!title || !excerpt || !content || !category) {
            return { success: false, message: "Заполните все обязательные поля" };
        }

        const slug = slugify(title) + "-" + Date.now();

        await prisma.article.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                category,
                image: image || null,
                authorDisplay,
                status,
                publishFrom: publishFrom ? new Date(publishFrom) : null,
                publishTo: publishTo ? new Date(publishTo) : null,
                authorId: session.user?.id as string,
            },
        });

        revalidatePath("/admin/articles");
        revalidatePath("/");
        return { success: true, message: "Статья создана", redirect: "/admin/articles" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка создания статьи" };
    }
}

// ADS ACTIONS

export async function createAd(formData: FormData) {
    try {
        const session = await auth();
        const role = (session.user as any)?.role;
        if (!session || !['ADMIN', 'CHIEF_EDITOR', 'EDITOR'].includes(role)) {
            return { success: false, message: "Недостаточно прав" };
        }

        const company = formData.get("company") as string;
        const tagline = formData.get("tagline") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const phone = formData.get("phone") as string;
        const buttonText = formData.get("buttonText") as string;
        let buttonUrl = formData.get("buttonUrl") as string;
        if (buttonUrl && !buttonUrl.startsWith('http://') && !buttonUrl.startsWith('https://')) {
            buttonUrl = `https://${buttonUrl}`;
        }
        const districts = formData.get("districts") as string;
        const bw = formData.get("bw") === "on";
        const status = formData.get("status") as string || "DRAFT";
        const publishFrom = formData.get("publishFrom") as string;
        const publishTo = formData.get("publishTo") as string;

        if (!company || !tagline || !imageUrl || !phone) {
            return { success: false, message: "Заполните все поля" };
        }

        await prisma.ad.create({
            data: {
                company,
                tagline,
                imageUrl,
                phone,
                buttonText: buttonText || null,
                buttonUrl: buttonUrl || null,
                districts: districts || null,
                bw,
                status,
                publishFrom: publishFrom ? new Date(publishFrom) : null,
                publishTo: publishTo ? new Date(publishTo) : null,
            },
        });

        revalidatePath("/admin/ads");
        revalidatePath("/");
        return { success: true, message: "Реклама создана", redirect: "/admin/ads" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка создания рекламы" };
    }
}

export async function updateAd(id: string, formData: FormData) {
    try {
        const session = await auth();
        const role = (session.user as any)?.role;
        if (!session || !['ADMIN', 'CHIEF_EDITOR', 'EDITOR'].includes(role)) {
            return { success: false, message: "Недостаточно прав" };
        }

        const company = formData.get("company") as string;
        const tagline = formData.get("tagline") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const phone = formData.get("phone") as string;
        const buttonText = formData.get("buttonText") as string;
        let buttonUrl = formData.get("buttonUrl") as string;
        if (buttonUrl && !buttonUrl.startsWith('http://') && !buttonUrl.startsWith('https://')) {
            buttonUrl = `https://${buttonUrl}`;
        }
        const districts = formData.get("districts") as string;
        const bw = formData.get("bw") === "on";
        const status = formData.get("status") as string || "DRAFT";
        const publishFrom = formData.get("publishFrom") as string;
        const publishTo = formData.get("publishTo") as string;

        if (!company || !tagline || !imageUrl || !phone) {
            return { success: false, message: "Заполните все поля" };
        }

        await prisma.ad.update({
            where: { id },
            data: {
                company,
                tagline,
                imageUrl,
                phone,
                buttonText: buttonText || null,
                buttonUrl: buttonUrl || null,
                districts: districts || null,
                bw,
                status,
                publishFrom: publishFrom ? new Date(publishFrom) : null,
                publishTo: publishTo ? new Date(publishTo) : null,
            },
        });

        revalidatePath("/admin/ads");
        revalidatePath("/");
        return { success: true, message: "Реклама обновлена", redirect: "/admin/ads" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка обновления рекламы" };
    }
}

export async function deleteAd(id: string) {
    try {
        const session = await auth();
        const role = (session.user as any)?.role;
        if (!session || !['ADMIN', 'CHIEF_EDITOR', 'EDITOR'].includes(role)) {
            return { success: false, message: "Недостаточно прав" };
        }

        await prisma.ad.delete({ where: { id } });

        revalidatePath("/admin/ads");
        revalidatePath("/");
        return { success: true, message: "Реклама удалена" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка удаления рекламы" };
    }
}

export async function updateArticle(id: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, message: "Не авторизован" };
        }

        const role = (session.user as any)?.role;
        const userId = session.user?.id;

        // Check ownership for AUTHORS
        if (role === "AUTHOR") {
            const article = await prisma.article.findUnique({ where: { id } });
            if (!article || article.authorId !== userId) {
                return { success: false, message: "Вы можете редактировать только свои статьи" };
            }
        }

        const title = formData.get("title") as string;
        const excerpt = formData.get("excerpt") as string;
        const content = formData.get("content") as string;
        const category = formData.get("category") as string;
        const image = formData.get("image") as string;
        const authorDisplay = formData.get("authorDisplay") as string || "Редакция";
        const status = formData.get("status") as string || "DRAFT";
        const publishFrom = formData.get("publishFrom") as string;
        const publishTo = formData.get("publishTo") as string;

        if (!title || !excerpt || !content || !category) {
            return { success: false, message: "Заполните все обязательные поля" };
        }

        await prisma.article.update({
            where: { id },
            data: {
                title,
                excerpt,
                content,
                category,
                image: image || null,
                authorDisplay,
                status,
                publishFrom: publishFrom ? new Date(publishFrom) : null,
                publishTo: publishTo ? new Date(publishTo) : null,
            },
        });

        revalidatePath("/admin/articles");
        revalidatePath("/");
        return { success: true, message: "Статья обновлена", redirect: "/admin/articles" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка обновления статьи" };
    }
}

// ANALYTICS ACTIONS

export async function getDashboardStats() {
    try {
        const session = await auth();
        const role = (session.user as any)?.role;

        // Only allow ADMIN and CHIEF_EDITOR to view stats
        if (!session || !['ADMIN', 'CHIEF_EDITOR'].includes(role)) {
            return null;
        }

        // Get total articles count
        const totalArticles = await prisma.article.count();

        // Get published articles count (status = PUBLISHED)
        const publishedArticles = await prisma.article.count({
            where: { status: "PUBLISHED" }
        });

        // Get total views across all articles
        const articlesWithViews = await prisma.article.findMany({
            select: { views: true }
        });
        const totalViews = articlesWithViews.reduce((sum, article) => sum + (article.views || 0), 0);

        // Get most viewed article
        const mostViewedArticle = await prisma.article.findFirst({
            orderBy: { views: 'desc' },
            select: {
                id: true,
                title: true,
                views: true,
                slug: true
            }
        });

        return {
            totalArticles,
            publishedArticles,
            totalViews,
            mostViewedArticle,
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return null;
    }
}

