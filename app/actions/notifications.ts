'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getNotifications() {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                authorUser: {
                    select: { displayName: true, username: true }
                }
            }
        })

        // Collect all user IDs from history to fetch latest names
        const userIds = new Set<string>()
        notifications.forEach(n => {
            n.history.forEach((h: any) => {
                if (h.userId) userIds.add(h.userId)
            })
        })

        const users = await prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, displayName: true, username: true }
        })

        const userMap = new Map(users.map(u => [u.id, u.displayName || u.username]))

        const enrichedNotifications = notifications.map(n => {
            const authorName = n.authorUser?.displayName || n.authorUser?.username || n.author

            const enrichedHistory = n.history.map((h: any) => {
                // If we have a userId, use the resolved name. Fallback to stored userName.
                const resolvedName = h.userId ? userMap.get(h.userId) : null
                return {
                    ...h,
                    userName: resolvedName || h.userName // Overwrite userName with latest
                }
            })

            return {
                ...n,
                author: authorName, // Use resolved author name
                history: enrichedHistory
            }
        })

        return { success: true, data: enrichedNotifications }
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
        const session = await auth()
        const authorId = session?.user?.id

        await prisma.notification.create({
            data: {
                ...data,
                authorId: authorId, // Save ID
                history: []
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

export async function deleteNotification(id: string) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Unauthorized" }
        }

        const notification = await prisma.notification.findUnique({
            where: { id },
            select: { author: true, authorId: true }
        })

        if (!notification) {
            return { success: false, error: "Notification not found" }
        }

        const userRole = (session.user as any).role
        const userId = session.user.id
        const userName = session.user.name

        const isAdminOrChief = ['ADMIN', 'CHIEF_EDITOR'].includes(userRole)
        // Check ID first, fallback to name for old records
        const isAuthor = (notification.authorId && notification.authorId === userId) || notification.author === userName

        if (!isAdminOrChief && !isAuthor) {
            return { success: false, error: "Forbidden: Only admins or author can delete" }
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
                        userId: session.user.id, // Save ID
                        userName: resolvedUserName, // Save name as snapshot (legacy support)
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

        const targetTimestamp = new Date(timestampStr).getTime()

        const updatedHistory = notification.history.map((h: any) => {
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

export async function payAllEmployee(employeeName: string) {
    try {
        // NOTE: This function still relies on employeeName for bulk payout. 
        // Ideally checking by ID is better, but the UI triggers this by name group.
        // We can keep it as is, or we'd need to change the UI to group by ID. 
        // Given we resolved names in getNotifications, employeeName passed here should be the "current" name.
        // But what if we have collision? 
        // For now, let's keep it simple as the immediate request is about history tracking.
        // But we should try to match against resolved names.

        // Actually, to fully fix the issue, payAllEmployee should iterate and check current resolved names.

        // Strategy: 
        // 1. Get all notifications.
        // 2. Resolve names for all history items (like in getNotifications).
        // 3. Filter for items where resolvedName === employeeName.
        // 4. Update them.

        const notifications = await prisma.notification.findMany()

        // We need the user map again... this is inefficient but safe.
        const userIds = new Set<string>()
        notifications.forEach(n => {
            n.history.forEach((h: any) => {
                if (h.userId) userIds.add(h.userId)
            })
        })
        const users = await prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, displayName: true, username: true }
        })
        const userMap = new Map(users.map(u => [u.id, u.displayName || u.username]))

        for (const note of notifications) {
            let needsUpdate = false
            const updatedHistory = note.history.map((h: any) => {
                const resolvedName = h.userId ? userMap.get(h.userId) : h.userName

                if (resolvedName === employeeName && !h.isPaid) {
                    needsUpdate = true
                    return { ...h, isPaid: true }
                }
                return h
            })

            if (needsUpdate) {
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
