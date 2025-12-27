"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

export async function uploadGalleryImage(formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }

    const role = (session.user as any).role;
    if (!["ADMIN", "CHIEF_EDITOR", "EDITOR", "AUTHOR"].includes(role)) {
        return { success: false, error: "Unauthorized role" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        const url = `/uploads/${filename}`;

        await prisma.galleryItem.create({
            data: {
                url,
                name: file.name,
                type: "UPLOAD",
            },
        });

        revalidatePath("/admin/gallery");
        return { success: true, url };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Failed to upload file" };
    }
}

export async function addExternalImage(url: string) {
    const session = await auth();
    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    if (!url) {
        return { success: false, error: "URL is required" };
    }

    try {
        await prisma.galleryItem.create({
            data: {
                url,
                name: "External Image",
                type: "EXTERNAL",
            },
        });

        revalidatePath("/admin/gallery");
        return { success: true };
    } catch (error) {
        console.error("Add external image error:", error);
        return { success: false, error: "Failed to add image" };
    }
}

export async function deleteGalleryItem(id: string) {
    const session = await auth();
    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Optimistically delete from DB. 
        // For local files, we could also delete the file, but let's keep it simple for now as per plan
        // (or if we want to be thorough, we fetch first)

        /* 
        const item = await prisma.galleryItem.findUnique({ where: { id } });
        if (item?.type === "UPLOAD") {
            // attempt to delete file
        }
        */

        await prisma.galleryItem.delete({
            where: { id },
        });

        revalidatePath("/admin/gallery");
        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "Failed to delete item" };
    }
}

export async function getGalleryItems() {
    // Only allow authenticated users to view gallery items
    const session = await auth();
    if (!session) {
        return [];
    }

    return await prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" },
    });
}
