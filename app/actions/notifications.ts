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
        // Ensure author is not updated
        const { author, ...updateData } = data as any

        await prisma.notification.update({
            where: { id },
            data: updateData
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

        if (!isAdminOrChief) {
            return { success: false, error: "Forbidden: Only admins can delete" }
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

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        const sentToday = notification.history.filter((h: any) => {
            const hDate = new Date(h.timestamp)
            return hDate >= startOfDay
        }).length

        if (sentToday >= notification.quantity) {
            return { success: false, error: "Daily limit reached" }
        }



        // Check if we reached the total campaign limit to auto-archive
        // Calculate limit
        const startDate = new Date(notification.startDate)
        const endDate = new Date(notification.endDate)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        const totalLimit = notification.quantity * diffDays

        // New count is current sentCount + 1
        const newSentCount = notification.sentCount + 1
        const shouldArchive = newSentCount >= totalLimit

        const session = await auth()
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { displayName: true, username: true }
        })

        const resolvedUserName = user?.displayName || user?.username || userName

        await prisma.notification.update({
            where: { id },
            data: {
                sentCount: { increment: 1 },
                lastSentTime: now,
                isArchived: shouldArchive ? true : undefined,
                history: {
                    push: {
                        userName: resolvedUserName,
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

export async function toggleArchiveNotification(id: string) {
    try {
        const notification = await prisma.notification.findUnique({ where: { id } })
        if (!notification) return { success: false, error: "Not found" }

        await prisma.notification.update({
            where: { id },
            data: { isArchived: !notification.isArchived }
        })
        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to toggle archive" }
    }
}
