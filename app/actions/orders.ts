"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createOrder(data: {
    client: string
    description: string
    packageType: string
    quantity: number
    startDate: string
    endDate: string
    employee: string
    totalPrice: number
    notes?: string
    createdBy: string
}) {
    try {
        await prisma.order.create({
            data: {
                ...data,
                status: "PENDING"
            }
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error creating order:", error)
        return { success: false, error: "Failed to create order" }
    }
}

export async function updateOrder(id: string, data: {
    client?: string
    description?: string
    packageType?: string
    quantity?: number
    startDate?: string
    endDate?: string
    employee?: string
    totalPrice?: number
    notes?: string
    status?: string
}) {
    try {
        await prisma.order.update({
            where: { id },
            data
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error updating order:", error)
        return { success: false, error: "Failed to update order" }
    }
}

export async function deleteOrder(id: string) {
    try {
        await prisma.order.delete({
            where: { id }
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error deleting order:", error)
        return { success: false, error: "Failed to delete order" }
    }
}

export async function updateOrderStatus(id: string, status: string) {
    try {
        await prisma.order.update({
            where: { id },
            data: { status }
        })

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        console.error("Error updating order status:", error)
        return { success: false, error: "Failed to update status" }
    }
}
