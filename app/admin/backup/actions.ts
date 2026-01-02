"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getBackupData } from "@/lib/backup.service"

export async function generateBackup() {
    const session = await auth()

    // Only ADMIN can generate backups
    if ((session?.user as any)?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const backupData = await getBackupData()
        return JSON.stringify(backupData, null, 2)
    } catch (error) {
        console.error("Backup generation failed:", error)
        throw new Error("Failed to generate backup")
    }
}
