"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getExcalidrawBoard() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        const board = await prisma.excalidrawBoard.findFirst({
            orderBy: { createdAt: "desc" },
        });

        // Ensure files is always an object
        if (board && !board.files) {
            board.files = {};
        }

        return board;
    } catch (error) {
        console.error("Failed to fetch Excalidraw board:", error);
        return null;
    }
}

export async function updateExcalidrawBoard(elements: any, appState: any, files?: any) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        // We update the same record or create if not exists
        const board = await prisma.excalidrawBoard.findFirst();

        if (board) {
            return await prisma.excalidrawBoard.update({
                where: { id: board.id },
                data: {
                    elements,
                    appState,
                    files: files || {},
                },
            });
        } else {
            return await prisma.excalidrawBoard.create({
                data: {
                    elements,
                    appState,
                    files: files || {},
                },
            });
        }
    } catch (error) {
        console.error("Failed to update Excalidraw board:", error);
        throw error;
    }
}

// Snapshot Management
export async function createSnapshot(name: string, elements: any, appState: any, files?: any) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        const board = await prisma.excalidrawBoard.findFirst();
        if (!board) throw new Error("No board found");

        const snapshot = await prisma.excalidrawSnapshot.create({
            data: {
                boardId: board.id,
                name,
                elements,
                appState,
                files: files || {},
                createdBy: (session.user as any).username || "Unknown",
            },
        });

        return { success: true, snapshot };
    } catch (error) {
        console.error("Failed to create snapshot:", error);
        throw error;
    }
}

export async function getSnapshots() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        const snapshots = await prisma.excalidrawSnapshot.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                createdBy: true,
                createdAt: true,
            },
        });
        return snapshots;
    } catch (error) {
        console.error("Failed to fetch snapshots:", error);
        return [];
    }
}

export async function loadSnapshot(id: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        const snapshot = await prisma.excalidrawSnapshot.findUnique({
            where: { id },
        });

        if (!snapshot) throw new Error("Snapshot not found");

        return {
            elements: snapshot.elements,
            appState: snapshot.appState,
            files: snapshot.files || {},
        };
    } catch (error) {
        console.error("Failed to load snapshot:", error);
        throw error;
    }
}

export async function deleteSnapshot(id: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        await prisma.excalidrawSnapshot.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete snapshot:", error);
        throw error;
    }
}
