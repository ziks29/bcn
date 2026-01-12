"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get all notes for current user
export async function getNotes(filters?: {
    showArchived?: boolean;
    categoryId?: string;
    search?: string;
}) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const where: any = {
        userId,
    };

    // Filter by archive status
    if (!filters?.showArchived) {
        where.isArchived = false;
    }

    // Filter by category
    if (filters?.categoryId) {
        where.categoryId = filters.categoryId;
    }

    // Search in title and content
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search, mode: "insensitive" } },
            { content: { contains: filters.search, mode: "insensitive" } },
        ];
    }

    const notes = await prisma.note.findMany({
        where,
        include: {
            category: true,
        },
        orderBy: [
            { isPinned: "desc" },
            { updatedAt: "desc" },
        ],
    });

    return notes;
}

// Create a new note
export async function createNote(data: {
    title: string;
    content: string;
    color?: string;
    posX?: number;
    posY?: number;
    width?: number;
    height?: number;
    categoryId?: string;
    reminderDate?: Date;
}) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const note = await prisma.note.create({
        data: {
            title: data.title,
            content: data.content,
            color: data.color || "#fef3c7",
            posX: data.posX ?? 100,
            posY: data.posY ?? 100,
            width: data.width ?? 250,
            height: data.height ?? 200,
            categoryId: data.categoryId || null,
            reminderDate: data.reminderDate || null,
            userId,
        },
    });

    revalidatePath("/admin");
    return note;
}

// Update a note
export async function updateNote(
    id: string,
    data: {
        title?: string;
        content?: string;
        color?: string;
        posX?: number;
        posY?: number;
        width?: number;
        height?: number;
        isPinned?: boolean;
        isArchived?: boolean;
        categoryId?: string | null;
        reminderDate?: Date | null;
    }
) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    // Verify ownership
    const existingNote = await prisma.note.findFirst({
        where: { id, userId },
    });

    if (!existingNote) {
        throw new Error("Note not found");
    }

    const note = await prisma.note.update({
        where: { id },
        data,
    });

    revalidatePath("/admin");
    return note;
}

// Delete a note
export async function deleteNote(id: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    // Verify ownership
    const existingNote = await prisma.note.findFirst({
        where: { id, userId },
    });

    if (!existingNote) {
        throw new Error("Note not found");
    }

    await prisma.note.delete({
        where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
}

// Toggle pin status
export async function togglePinNote(id: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const note = await prisma.note.findFirst({
        where: { id, userId },
    });

    if (!note) {
        throw new Error("Note not found");
    }

    const updated = await prisma.note.update({
        where: { id },
        data: { isPinned: !note.isPinned },
    });

    revalidatePath("/admin");
    return updated;
}

// Toggle archive status
export async function toggleArchiveNote(id: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const note = await prisma.note.findFirst({
        where: { id, userId },
    });

    if (!note) {
        throw new Error("Note not found");
    }

    const updated = await prisma.note.update({
        where: { id },
        data: { isArchived: !note.isArchived },
    });

    revalidatePath("/admin");
    return updated;
}

// Update note position
export async function updateNotePosition(id: string, posX: number, posY: number) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const note = await prisma.note.findFirst({
        where: { id, userId },
    });

    if (!note) {
        throw new Error("Note not found");
    }

    const updated = await prisma.note.update({
        where: { id },
        data: { posX, posY },
    });

    return updated;
}

// Update note size
export async function updateNoteSize(id: string, width: number, height: number) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const note = await prisma.note.findFirst({
        where: { id, userId },
    });

    if (!note) {
        throw new Error("Note not found");
    }

    const updated = await prisma.note.update({
        where: { id },
        data: { width, height },
    });

    return updated;
}

// ========== Category Actions ==========

// Get all categories for current user
export async function getNoteCategories() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const categories = await prisma.noteCategory.findMany({
        where: { userId },
        include: {
            _count: {
                select: { notes: true },
            },
        },
        orderBy: { name: "asc" },
    });

    return categories;
}

// Create a category
export async function createNoteCategory(name: string, color?: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const category = await prisma.noteCategory.create({
        data: {
            name,
            color: color || "#6b7280",
            userId,
        },
    });

    revalidatePath("/admin");
    return category;
}

// Update a category
export async function updateNoteCategory(id: string, data: { name?: string; color?: string }) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const existing = await prisma.noteCategory.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        throw new Error("Category not found");
    }

    const category = await prisma.noteCategory.update({
        where: { id },
        data,
    });

    revalidatePath("/admin");
    return category;
}

// Delete a category (notes become uncategorized)
export async function deleteNoteCategory(id: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const existing = await prisma.noteCategory.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        throw new Error("Category not found");
    }

    // Remove category from all notes first
    await prisma.note.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
    });

    await prisma.noteCategory.delete({
        where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
}
