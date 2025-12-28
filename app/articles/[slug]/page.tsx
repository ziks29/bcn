import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/services/articles';
import ArticleView from '@/components/ArticleView';
import ArticleLayout from '@/components/ArticleLayout';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;

    // Decode slug in case it has URL encoded characters ( Cyrillic )
    const decodedSlug = decodeURIComponent(slug);

    const article = await getArticleBySlug(decodedSlug);
    const ads = await prisma.ad.findMany({
        orderBy: { createdAt: "desc" },
    });
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
    });

    if (!article) {
        notFound();
    }

    // Access Control
    if (article.status !== "PUBLISHED") {
        const { auth } = await import("@/lib/auth");
        const session = await auth();

        if (!session || !session.user) {
            notFound();
        }

        // Allow any logged in user to view previews
        // const userRole = (session.user as any).role;
        // if (!["ADMIN", "CHIEF_EDITOR", "EDITOR", "AUTHOR"].includes(userRole)) {
        //    notFound();
        // }
    }

    return (
        <>
            <ArticleLayout ads={ads} categories={categories.map(c => c.name)}>
                {article.status !== "PUBLISHED" && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                        <p className="font-bold">Режим предварительного просмотра</p>
                        <p>Эта статья имеет статус: {article.status || "DRAFT"}</p>
                    </div>
                )}
                <ArticleView article={article} />
            </ArticleLayout>
            <Footer />
        </>
    );
}

// Ensure dynamic rendering if new articles are added
export const dynamic = 'force-dynamic';
