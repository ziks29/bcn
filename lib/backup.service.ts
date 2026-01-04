import { prisma } from "@/lib/prisma"

export async function getBackupData() {
    const [
        users,
        articles,
        ads,
        galleryItems,
        categories,
        contacts,
        notifications,
        excalidrawBoards,
        excalidrawSnapshots
    ] = await Promise.all([
        prisma.user.findMany(),
        prisma.article.findMany(),
        prisma.ad.findMany(),
        prisma.galleryItem.findMany(),
        prisma.category.findMany(),
        prisma.contact.findMany(),
        prisma.notification.findMany(),
        prisma.excalidrawBoard.findMany(),
        prisma.excalidrawSnapshot.findMany()
    ])

    return {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
            users,
            articles,
            ads,
            galleryItems,
            categories,
            contacts,
            notifications,
            excalidrawBoards,
            excalidrawSnapshots
        }
    }
}
