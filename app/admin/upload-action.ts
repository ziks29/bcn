"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File | null;

    if (!file) {
        return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const relativeUploadDir = "/uploads";
    // Check if running in dev or prod roughly. 
    // process.cwd() in Next.js usually points to the root of the project.
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Error creating upload dir", e);
    }

    // Unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const filename = `${uniqueSuffix}-${originalName}`;
    const filepath = join(uploadDir, filename);

    try {
        await writeFile(filepath, buffer);
        console.log(`Saved file to ${filepath}`);
        return { success: true, url: `${relativeUploadDir}/${filename}` };
    } catch (e) {
        console.error("Error saving file", e);
        return { success: false, error: "Failed to save file" };
    }
}
