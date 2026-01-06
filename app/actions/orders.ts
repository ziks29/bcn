"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/lib/auth"



export async function createOrder(data: {
    client: string
    clientName: string
    description: string
    service: string
    startDate?: string
    endDate?: string
    employee: string
    totalPrice: number
    notes?: string
    createdBy: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Get employee user ID if employee name matches a user
        const employeeUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { displayName: data.employee },
                    { username: data.employee }
                ]
            },
            select: { id: true }
        })

        await prisma.order.create({
            data: {
                ...data,
                employeeId: employeeUser?.id,  // Save ID
                createdById: session.user.id    // Save creator ID
            }
        })

        revalidateTag("business", "max")
        revalidateTag("orders", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/business")
        return { success: true }
    } catch (error) {
        console.error("Error creating order:", error)
        return { success: false, error: "Failed to create order" }
    }
}

export async function updateOrder(id: string, data: {
    client?: string
    clientName?: string
    description?: string
    service?: string
    startDate?: string
    endDate?: string
    employee?: string
    totalPrice?: number
    employeePaidAmount?: number
    notes?: string
    isPaid?: boolean
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Fetch order to verify ownership
        const order = await prisma.order.findUnique({
            where: { id },
            select: {
                createdById: true,
                isPaid: true,
                totalPrice: true,
                client: true,
                clientName: true,
                description: true
            }
        })

        if (!order) {
            return { success: false, error: "Order not found" }
        }

        // Authorization: Only creator or admin can edit
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, displayName: true, username: true }
        })

        const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(user?.role || '')
        const isCreator = order.createdById === session.user.id

        if (!isAdmin && !isCreator) {
            return { success: false, error: "Forbidden: Only order creator or admin can edit" }
        }

        // Handle isPaid toggle
        if (data.isPaid !== undefined) {
            const createdBy = user?.displayName || user?.username || "Unknown"

            // Create transaction in the same atomic operation
            await prisma.$transaction(async (tx) => {
                // Update order
                await tx.order.update({
                    where: { id },
                    data
                })

                // If toggling to PAID (false -> true)
                if (data.isPaid === true && !order.isPaid) {
                    // Create INCOME transaction for invoice payment
                    await tx.transaction.create({
                        data: {
                            type: 'INCOME',
                            amount: order.totalPrice,
                            category: 'Счет оплачен',
                            date: new Date(),
                            description: `Счет оплачен: ${order.clientName || order.client} - ${order.description}`,
                            createdBy: createdBy,
                            createdById: session.user.id,
                            orderId: id  // Link to order
                        }
                    })
                }
                // If toggling to UNPAID (true -> false)
                else if (data.isPaid === false && order.isPaid) {
                    // Create EXPENSE (reversal) transaction
                    await tx.transaction.create({
                        data: {
                            type: 'EXPENSE',
                            amount: order.totalPrice,
                            category: 'Отмена счета',
                            date: new Date(),
                            description: `Отмена оплаты: ${order.clientName || order.client} - ${order.description}`,
                            createdBy: createdBy,
                            createdById: session.user.id,
                            orderId: id  // Link to order
                        }
                    })
                }
            })
        } else {
            // Normal update without isPaid change
            await prisma.order.update({
                where: { id },
                data
            })
        }

        revalidateTag("business", "max")
        revalidateTag("orders", "max")
        revalidateTag("transactions", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error updating order:", error)
        return { success: false, error: "Failed to update order" }
    }
}

export async function deleteOrder(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Authorization: Only admin can delete
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, displayName: true, username: true }
        })

        const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(user?.role || '')
        if (!isAdmin) {
            return { success: false, error: "Forbidden: Only admins can delete orders" }
        }

        // Fetch order with all related data before deletion
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                employeePayments: true
            }
        })

        if (!order) {
            return { success: false, error: "Order not found" }
        }

        const createdBy = user?.displayName || user?.username || "Unknown"

        // Use atomic transaction to delete order and create reversal transactions
        await prisma.$transaction(async (tx) => {
            // 1. Create reversal transaction for invoice payment if order was marked as paid
            if (order.isPaid) {
                await tx.transaction.create({
                    data: {
                        type: 'EXPENSE',
                        amount: order.totalPrice,
                        category: 'Удаление заказа',
                        date: new Date(),
                        description: `Удаление оплаченного заказа: ${order.clientName || order.client} - ${order.description}`,
                        createdBy,
                        createdById: session.user.id
                    }
                })
            }

            // 2. Create reversal transactions for all employee payments
            for (const empPayment of order.employeePayments) {
                await tx.transaction.create({
                    data: {
                        type: 'INCOME',
                        amount: empPayment.amount,
                        category: 'Удаление заказа',
                        date: new Date(),
                        description: `Удаление выплаты сотруднику ${order.employee}: ${order.clientName || order.client} - ${order.description}`,
                        createdBy,
                        createdById: session.user.id
                    }
                })
            }

            // 3. Revert/Delete Linked Notifications
            // New Requirement: If order is deleted, delete the notification too.
            // This also handles the "Ghost" notification issue.
            await tx.notification.deleteMany({
                where: { orderId: id }
            })

            // 4. Delete the order (cascade will delete payments and employee payments)
            await tx.order.delete({
                where: { id }
            })
        })

        revalidateTag("business", "max")
        revalidateTag("orders", "max")
        revalidateTag("transactions", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error deleting order:", error)
        return { success: false, error: "Failed to delete order" }
    }
}


