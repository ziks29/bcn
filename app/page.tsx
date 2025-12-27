import { getArticles } from "@/services/articles";
import NewsDashboard from "@/components/NewsDashboard";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering to fetch fresh data
export const dynamic = 'force-dynamic';

export default async function Home() {
    const articles = await getArticles();
    const ads = await prisma.ad.findMany({
        orderBy: { createdAt: "desc" },
    });
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
    });

    return <NewsDashboard
        initialArticles={articles}
        initialAds={ads}
        categories={categories.map(c => c.name)}
    />;
}
