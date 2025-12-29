"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function incrementArticleViews(articleId: string) {
    try {
        console.log(`[Analytics] Incrementing views for article ID: ${articleId}`);
        const updated = await prisma.article.update({
            where: { id: articleId },
            data: { views: { increment: 1 } }
        });
        console.log(`[Analytics] Successfully incremented views. New count: ${updated.views}`);

        // Revalidate the home page and article pages to show updated view counts
        revalidatePath('/');
        revalidatePath('/articles');

        return { success: true, views: updated.views };
    } catch (error) {
        console.error("[Analytics] Failed to increment article views:", error);
        return { success: false, error: "Failed to increment views" };
    }
}
