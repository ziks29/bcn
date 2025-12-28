"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, chmod } from "fs/promises";
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
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Ensure file has correct permissions (readable by all)
        try {
            await chmod(filePath, 0o644);
        } catch (chmodError) {
            console.warn("Could not set file permissions:", chmodError);
        }

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
    console.log("addExternalImage: Received URL:", url);

    const session = await auth();
    console.log("addExternalImage: Session found:", !!session);

    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    if (!url) {
        return { success: false, error: "URL is required" };
    }

    try {
        // Check if URL is from Discord
        const isDiscordUrl = url.includes("discord.com") || url.includes("discordapp.net") || url.includes("cdn.discordapp.com");

        if (isDiscordUrl) {
            // Download Discord images to prevent expiration
            console.log("Discord URL detected, fetching image...");

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; BCN-NewsBot/1.0)',
                    },
                });
                console.log("Fetch response status:", response.status, response.statusText);

                if (!response.ok) {
                    console.error("Failed to fetch Discord image:", response.status, response.statusText);
                    return { success: false, error: `Failed to download image from Discord (${response.status})` };
                }

                // Get the content type to determine file extension
                const contentType = response.headers.get("content-type");
                console.log("Content-Type:", contentType);

                if (!contentType || !contentType.startsWith("image/")) {
                    console.error("Invalid content type:", contentType);
                    return { success: false, error: `URL does not point to an image (received ${contentType})` };
                }

                // Determine file extension
                let extension = "jpg";
                if (contentType.includes("png")) extension = "png";
                else if (contentType.includes("webp")) extension = "webp";
                else if (contentType.includes("gif")) extension = "gif";
                else if (contentType.includes("jpeg")) extension = "jpg";

                console.log("Determined file extension:", extension);

                // Get the image data as buffer
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                console.log("Image buffer size:", buffer.length, "bytes");

                if (buffer.length === 0) {
                    console.error("Downloaded image has 0 bytes");
                    return { success: false, error: "Downloaded image is empty" };
                }

                // Create unique filename
                const filename = `${uuidv4()}.${extension}`;
                const uploadDir = path.join(process.cwd(), "public", "uploads");
                const filePath = path.join(uploadDir, filename);
                console.log("Saving to:", filePath);

                // Save the file
                await mkdir(uploadDir, { recursive: true });
                await writeFile(filePath, buffer);

                // Ensure file has correct permissions (readable by all)
                try {
                    await chmod(filePath, 0o644);
                    console.log("Set file permissions to 0o644");
                } catch (chmodError) {
                    console.warn("Could not set file permissions:", chmodError);
                }

                const localUrl = `/uploads/${filename}`;
                console.log("Successfully saved Discord image as:", localUrl);

                // Create gallery item with local URL
                await prisma.galleryItem.create({
                    data: {
                        url: localUrl,
                        name: "Discord Image (downloaded)",
                        type: "EXTERNAL",
                    },
                });

                revalidatePath("/admin/gallery");
                return { success: true, url: localUrl };
            } catch (fetchError) {
                console.error("Discord fetch error:", fetchError);
                return { success: false, error: `Network error downloading Discord image: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` };
            }
        } else {
            // For non-Discord URLs, just store the URL directly
            await prisma.galleryItem.create({
                data: {
                    url,
                    name: "External Image",
                    type: "EXTERNAL",
                },
            });

            revalidatePath("/admin/gallery");
            return { success: true, url };
        }
    } catch (error) {
        console.error("Add external image error:", error);
        return { success: false, error: "Failed to process image" };
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

export async function getGalleryItemsWithUsage() {
    const session = await auth();
    if (!session) {
        return [];
    }

    const items = await prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Get all articles and ads
    const articles = await prisma.article.findMany({
        select: { id: true, title: true, image: true },
    });

    const ads = await prisma.ad.findMany({
        select: { id: true, company: true, imageUrl: true },
    });

    // Map items to include usage information
    const itemsWithUsage = items.map(item => {
        const usedInArticles = articles.filter(article => article.image === item.url);
        const usedInAds = ads.filter(ad => ad.imageUrl === item.url);

        return {
            ...item,
            usageCount: usedInArticles.length + usedInAds.length,
            usedInArticles: usedInArticles.map(a => ({ id: a.id, title: a.title })),
            usedInAds: usedInAds.map(a => ({ id: a.id, company: a.company })),
        };
    });

    return itemsWithUsage;
}
