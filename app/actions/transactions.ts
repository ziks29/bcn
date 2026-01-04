"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function createTransaction(data: {
    type: string
    amount: number
    description: string
    category?: string
    date: Date
    createdBy: string
}) {
    try {
        const session = await auth()
        if (!session) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.transaction.create({
            data: {
                ...data,
                date: new Date(data.date)
            }
        })

        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error creating transaction:", error)
        return { success: false, error: "Failed to create transaction" }
    }
}

export async function updateTransaction(id: string, data: {
    type?: string
    amount?: number
    description?: string
    category?: string
    date?: Date
}) {
    try {
        const session = await auth()
        if (!session) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.transaction.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined
            }
        })

        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error updating transaction:", error)
        return { success: false, error: "Failed to update transaction" }
    }
}

export async function deleteTransaction(id: string) {
    try {
        const session = await auth()
        if (!session) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.transaction.delete({
            where: { id }
        })

        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error deleting transaction:", error)
        return { success: false, error: "Failed to delete transaction" }
    }
}
