"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/lib/auth"

export async function addPayment(data: {
    orderId: string
    amount: number
    paymentDate: Date
    paymentMethod: string
    receivedBy: string
    receiptNumber?: string
    notes?: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.payment.create({
            data: {
                ...data,
                receivedById: session.user.id  // Track by user ID for audit trail
            }
        })

        revalidateTag("business", "max")
        revalidateTag("payments", "max")
        revalidateTag("orders", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/business")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error adding payment:", error)
        return { success: false, error: "Failed to add payment" }
    }
}

export async function updatePayment(id: string, data: {
    amount?: number
    paymentDate?: Date
    paymentMethod?: string
    receivedBy?: string
    receiptNumber?: string
    notes?: string
}) {
    try {
        await prisma.payment.update({
            where: { id },
            data
        })

        revalidateTag("business", "max")
        revalidateTag("payments", "max")
        revalidateTag("orders", "max")
        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error updating payment:", error)
        return { success: false, error: "Failed to update payment" }
    }
}

export async function deletePayment(id: string) {
    try {
        await prisma.payment.delete({
            where: { id }
        })

        revalidateTag("business", "max")
        revalidateTag("payments", "max")
        revalidateTag("orders", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/business")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting payment:", error)

        // If payment doesn't exist, treat as successful deletion (idempotent)
        // This handles race conditions where UI attempts to delete already-deleted payments
        if (error.code === 'P2025') {
            revalidateTag("business", "max")
            revalidateTag("payments", "max")
            revalidateTag("orders", "max")
            revalidatePath("/admin/orders")
            revalidatePath("/admin/business")
            revalidatePath("/admin/finances")
            return { success: true, warning: "Payment already deleted" }
        }

        // If invalid ObjectID (e.g., temporary payment ID), return specific error
        if (error.code === 'P2023') {
            return { success: false, error: "Invalid payment ID" }
        }

        return { success: false, error: "Failed to delete payment" }
    }
}
