import { prisma } from "@/lib/prisma";
import { Article } from "@/types";

// Helper to map Prisma article to our frontend Article type
const mapPrismaArticle = (item: any): Article => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    author: item.authorDisplay || item.author.username,
    authorBio: item.author.bio,
    date: item.createdAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
    category: item.category as any, // Cast to enum
    imageUrl: item.image || undefined,
    breaking: false, // Default for now, can add field to DB schema later
    status: item.status,
    authorId: item.authorId,
    views: item.views || 0,
});

export async function getArticles() {
    try {
        const articles = await prisma.article.findMany({
            where: { status: "PUBLISHED" },
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });

        return articles.map((item, index) => ({
            ...mapPrismaArticle(item),
            breaking: index === 0 // Mark the first article as breaking
        }));
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        return [];
    }
}

export async function getArticleBySlug(slug: string) {
    try {
        const article = await prisma.article.findUnique({
            where: { slug: slug },
            include: { author: true },
        });

        if (!article) return null;

        return mapPrismaArticle(article);
    } catch (error) {
        console.error("Failed to fetch article by slug:", error);
        return null;
    }
}

export async function getBreakingNews() {
    // Logic to find breaking news, for now just the latest one or flagged
    // Modify Schema to include 'breaking' boolean if needed.
    // For now, let's just take the first one or leave it null if not implemented in schema yet.
    // I added 'breaking' neither in schema nor seed.
    return null;
}
