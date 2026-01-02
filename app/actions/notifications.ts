'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: notifications }
    } catch (error) {
        console.error("Failed to fetch notifications:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

export async function createNotification(data: {
    customer: string
    adText: string
    quantity: number
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    author: string
}) {
    try {
        await prisma.notification.create({
            data: {
                ...data,
                history: [] // Initialize empty
            }
        })
        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error("Create notification error:", error)
        return { success: false, error: "Failed to create" }
    }
}

export async function updateNotification(id: string, data: Partial<{
    customer: string
    adText: string
    quantity: number
    startDate: string
    endDate: string
    startTime: string
    endTime: string
}>) {
    try {
        await prisma.notification.update({
            where: { id },
            data
        })
        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error("Update notification error:", error)
        return { success: false, error: "Failed to update" }
    }
}

import { auth } from "@/lib/auth"

export async function deleteNotification(id: string) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Unauthorized" }
        }

        const notification = await prisma.notification.findUnique({
            where: { id },
            select: { author: true }
        })

        if (!notification) {
            return { success: false, error: "Notification not found" }
        }

        const userRole = (session.user as any).role
        const userName = session.user.name

        const isAdminOrChief = ['ADMIN', 'CHIEF_EDITOR'].includes(userRole)
        const isAuthor = notification.author === userName

        if (!isAdminOrChief && !isAuthor) {
            return { success: false, error: "Forbidden: You can only delete your own notifications" }
        }

        await prisma.notification.delete({
            where: { id }
        })
        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete" }
    }
}

export async function processSendNotification(id: string, userName: string) {
    try {
        const notification = await prisma.notification.findUnique({ where: { id } })
        if (!notification) return { success: false, error: "Not found" }

        if (notification.sentCount >= notification.quantity) {
            return { success: false, error: "Limit reached" }
        }

        const now = new Date()

        await prisma.notification.update({
            where: { id },
            data: {
                sentCount: { increment: 1 },
                lastSentTime: now,
                history: {
                    push: {
                        userName,
                        timestamp: now,
                        isPaid: false
                    }
                }
            }
        })

        // Return the updated data implicitly by revalidating, or specific data if needed by client
        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error("Process send error:", error)
        return { success: false, error: "Failed to process send" }
    }
}

export async function toggleNotificationPayout(id: string, timestampStr: string) {
    try {
        const notification = await prisma.notification.findUnique({ where: { id } })
        if (!notification) return { success: false, error: "Not found" }

        // We need to find the specific history item and toggle it.
        // Prisma MongoDB raw update or finding and replacing the whole array.
        // Since we can't easily update a specific element in an array by a field value in simple Prisma without index,
        // we'll map over it.

        const targetTimestamp = new Date(timestampStr).getTime()

        const updatedHistory = notification.history.map(h => {
            if (new Date(h.timestamp).getTime() === targetTimestamp) {
                return { ...h, isPaid: !h.isPaid }
            }
            return h
        })

        await prisma.notification.update({
            where: { id },
            data: {
                history: updatedHistory
            }
        })

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error("Toggle payout error:", error)
        return { success: false, error: "Failed to toggle payout" }
    }
}

export async function payAllEmployee(userName: string) {
    try {
        const notifications = await prisma.notification.findMany()

        for (const note of notifications) {
            // Check if any history item for this user is unpaid
            const hasUnpaid = note.history.some(h => h.userName === userName && !h.isPaid)
            if (hasUnpaid) {
                const updatedHistory = note.history.map(h => {
                    if (h.userName === userName && !h.isPaid) {
                        return { ...h, isPaid: true }
                    }
                    return h
                })

                await prisma.notification.update({
                    where: { id: note.id },
                    data: {
                        history: updatedHistory
                    }
                })
            }
        }

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error("Pay all error:", error)
        return { success: false, error: "Failed to pay all" }
    }
}
