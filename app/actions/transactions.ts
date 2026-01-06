"use server"

import { revalidatePath, revalidateTag } from "next/cache"
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
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Authorization: Only admin or chief can create manual transactions
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(user?.role || '')
        if (!isAdmin) {
            return { success: false, error: "Forbidden: Only admins can create transactions" }
        }

        await prisma.transaction.create({
            data: {
                ...data,
                date: new Date(data.date),
                createdById: session.user.id  // Save creator ID
            }
        })

        revalidateTag("business", "max")
        revalidateTag("transactions", "max")
        revalidatePath("/admin/finances")
        revalidatePath("/admin/business")
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

        revalidateTag("business", "max")
        revalidateTag("transactions", "max")
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
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Authorization: Only admin or chief can delete transactions
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(user?.role || '')
        if (!isAdmin) {
            return { success: false, error: "Forbidden: Only admins can delete transactions" }
        }

        await prisma.transaction.delete({
            where: { id }
        })

        revalidateTag("business", "max")
        revalidateTag("transactions", "max")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error deleting transaction:", error)
        return { success: false, error: "Failed to delete transaction" }
    }
}
