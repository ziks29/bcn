"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/lib/auth"

export async function addEmployeePayment(data: {
    orderId: string
    amount: number
    paymentDate: Date
    paymentMethod: string
    notes?: string
    employeeName?: string
    targetEmployeeId?: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        const processedBy = user?.displayName || user?.username || "Unknown"

        // Atomic transaction:
        // 1. Create EmployeePayment record
        // 2. Update Order (increment employeePaidAmount, optionally update employee)
        // 3. Create Transaction (Expense) linked to employee payment
        await prisma.$transaction(async (tx) => {
            // 1. Create EmployeePayment
            const { employeeName, targetEmployeeId, ...paymentData } = data
            const employeePayment = await tx.employeePayment.create({
                data: {
                    ...paymentData,
                    recipient: employeeName, // Save who actually received the money
                    processedBy,
                    processedById: session.user.id
                }
            })

            // 2. Update Order
            await tx.order.update({
                where: { id: data.orderId },
                data: {
                    employeePaidAmount: { increment: data.amount }
                }
            })

            // 3. Create Transaction (Expense) linked to employee payment
            // Need to fetch order to get default employee name if not provided
            const order = await tx.order.findUnique({
                where: { id: data.orderId },
                select: { id: true, employee: true }
            })

            const recipientName = employeeName || order?.employee || ''

            await tx.transaction.create({
                data: {
                    type: 'EXPENSE',
                    amount: data.amount,
                    category: 'Выплата',
                    date: data.paymentDate,
                    description: `Выплата сотруднику ${recipientName} (Заказ #${order?.id?.slice(-4)})`,
                    createdBy: session.user?.name || "System",
                    createdById: session.user.id,
                    employeePaymentId: employeePayment.id,
                    orderId: data.orderId
                }
            })
        })

        revalidateTag("business", "max")
        revalidateTag("orders", "max")
        revalidateTag("transactions", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/business")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error adding employee payment:", error)
        return { success: false, error: "Failed to add payment" }
    }
}

export async function deleteEmployeePayment(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // We need to fetch the payment first to know the amount and orderId
        const payment = await prisma.employeePayment.findUnique({
            where: { id }
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete EmployeePayment
            await tx.employeePayment.delete({
                where: { id }
            })

            // 2. Update Order (decrement employeePaidAmount)
            await tx.order.update({
                where: { id: payment.orderId },
                data: {
                    employeePaidAmount: { decrement: payment.amount }
                }
            })

            // 3. Create compensating transaction (reversal)
            // Similar to invoice payment reversals, we create an INCOME transaction
            // to reverse the EXPENSE, linked to the order for audit trail
            const order = await tx.order.findUnique({
                where: { id: payment.orderId },
                select: { id: true, employee: true }
            })

            await tx.transaction.create({
                data: {
                    type: 'INCOME', // Compensate expense
                    amount: payment.amount,
                    category: 'Отмена выплаты',
                    date: new Date(),
                    description: `Отмена выплаты сотруднику ${payment.recipient || order?.employee || ''} (Заказ #${order?.id?.slice(-4)})`,
                    createdBy: session.user?.name || "System",
                    createdById: session.user.id,
                    orderId: payment.orderId
                }
            })

            // 4. Revert Notification History status
            // Find notifications that have history items with this employeePaymentId
            const notifications = await tx.notification.findMany({
                where: {
                    history: {
                        some: {
                            employeePaymentId: id
                        }
                    }
                }
            })

            for (const note of notifications) {
                const updatedHistory = note.history.map((h: any) => {
                    if (h.employeePaymentId === id) {
                        return { ...h, isPaid: false, employeePaymentId: null }
                    }
                    return h
                })

                await tx.notification.update({
                    where: { id: note.id },
                    data: { history: updatedHistory }
                })
            }
        })

        revalidateTag("business", "max")
        revalidateTag("orders", "max")
        revalidateTag("transactions", "max")
        revalidatePath("/admin/orders")
        revalidatePath("/admin/business")
        revalidatePath("/admin/finances")
        return { success: true }
    } catch (error) {
        console.error("Error deleting employee payment:", error)
        return { success: false, error: "Failed to delete payment" }
    }
}
