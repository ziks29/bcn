"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getGalleryItemsForExcalidraw() {
    const session = await auth();
    if (!session) {
        return [];
    }

    const items = await prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            url: true,
            name: true,
        },
    });

    return items;
}
