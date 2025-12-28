"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


// Helper function to upload images to ImgBB
async function uploadToImgBB(buffer: Buffer, filename: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
}> {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
        console.error("ImgBB API key not configured");
        return { success: false, error: "ImgBB API key not configured. Please add IMGBB_API_KEY to your environment variables." };
    }

    try {
        console.log("Uploading to ImgBB, file size:", buffer.length, "bytes");

        const base64Image = buffer.toString('base64');

        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('image', base64Image);
        formData.append('name', filename);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log("ImgBB response:", data.success ? "Success" : "Failed", data.error?.message || "");

        if (data.success && data.data) {
            console.log("Image uploaded successfully:", data.data.display_url);
            return {
                success: true,
                url: data.data.display_url,
            };
        } else {
            const errorMsg = data.error?.message || 'Upload failed';
            console.error("ImgBB upload failed:", errorMsg);
            return { success: false, error: errorMsg };
        }
    } catch (error) {
        console.error('ImgBB upload error:', error);
        return {
            success: false,
            error: `Failed to upload to ImgBB: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

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

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to ImgBB
        const result = await uploadToImgBB(buffer, file.name);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Save to database
        await prisma.galleryItem.create({
            data: {
                url: result.url!,
                name: file.name,
                type: "UPLOAD",
            },
        });

        revalidatePath("/admin/gallery");
        return { success: true, url: result.url };
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
        // Check if URL is from Discord or other CDN that might expire
        const isDiscordUrl = url.includes("discord.com") || url.includes("discordapp.net") || url.includes("cdn.discordapp.com");

        if (isDiscordUrl) {
            // Download Discord images and re-upload to ImgBB for permanence
            console.log("Discord URL detected, downloading and re-uploading to ImgBB...");

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

                // Upload to ImgBB
                const filename = `discord-image.${extension}`;
                const result = await uploadToImgBB(buffer, filename);

                if (!result.success) {
                    return { success: false, error: result.error };
                }

                console.log("Successfully uploaded Discord image to ImgBB:", result.url);

                // Create gallery item with ImgBB URL
                await prisma.galleryItem.create({
                    data: {
                        url: result.url!,
                        name: "Discord Image (via ImgBB)",
                        type: "EXTERNAL",
                    },
                });

                revalidatePath("/admin/gallery");
                return { success: true, url: result.url };
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
