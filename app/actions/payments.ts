"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
        await prisma.payment.create({
            data
        })

        revalidatePath("/admin/orders")
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

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error deleting payment:", error)
        return { success: false, error: "Failed to delete payment" }
    }
}
