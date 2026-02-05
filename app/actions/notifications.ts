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
                },
                order: {
                    select: { totalPrice: true }
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
                history: enrichedHistory,
                price: n.order?.totalPrice // Get price from linked Order
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
    price?: number
    employeeRate?: number
}) {
    try {
        const session = await auth()
        const authorId = session?.user?.id

        let orderId = null

        // Create Order if price is provided
        if (data.price !== undefined && data.price !== null) {
            const employeeUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { displayName: data.author },
                        { username: data.author }
                    ]
                },
                select: { id: true }
            })

            const order = await prisma.order.create({
                data: {
                    client: data.customer,
                    clientName: data.customer,
                    description: `Рассылка: ${data.adText.substring(0, 50)}...`,
                    service: "Рассылки",
                    startDate: data.startDate,
                    endDate: data.endDate,
                    employee: data.author,
                    employeeId: employeeUser?.id,
                    totalPrice: data.price,
                    createdBy: data.author,
                    createdById: authorId,
                    isPaid: false
                }
            })
            orderId = order.id
        }

        // Destructure to avoid TS error with extra props
        const { price, employeeRate, ...notificationData } = data

        await prisma.notification.create({
            data: {
                ...notificationData,
                employeeRate: employeeRate !== undefined ? employeeRate : 52,
                authorId: authorId,
                history: [],
                orderId: orderId
            }
        })
        revalidatePath('/admin/notifications')
        revalidatePath('/admin/orders')
        revalidatePath('/admin/business')
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
    price?: number
    employeeRate?: number
}>) {
    try {
        // Ensure author is not updated, destructure price and employeeRate
        const { author, price, employeeRate, ...updateData } = data as any

        const notification = await prisma.notification.findUnique({ where: { id } })

        // If price explicitly provided and there is a linked order, update the order price
        if (price !== undefined && notification?.orderId) {
            await prisma.order.update({
                where: { id: notification.orderId },
                data: { totalPrice: price }
            })
        }

        await prisma.notification.update({
            where: { id },
            data: {
                ...updateData,
                ...(employeeRate !== undefined ? { employeeRate } : {})
            }
        })
        revalidatePath('/admin/notifications')
        revalidatePath('/admin/orders')
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
            select: { author: true, authorId: true, orderId: true }
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

        // If linked order exists, delete it too? 
        // Logic: Notification is the source. If we delete notification, we should delete the order 
        // to avoid "Ghost" orders.
        if (notification.orderId) {
            // Check if order has other payments/transactions which might block deletion is handled by deleteOrder logic
            // But here we just delete order directly or via cascade?
            // Safer to just delete the order.
            try {
                await prisma.order.delete({ where: { id: notification.orderId } })
            } catch (e) {
                console.error("Failed to delete linked order", e)
            }
        }

        await prisma.notification.delete({
            where: { id }
        })
        revalidatePath('/admin/notifications')
        revalidatePath('/admin/orders')
        revalidatePath('/admin/business')
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
    // This function is for individual item toggle. 
    // It's harder to sync this one specific item to a transaction.
    // For now we might disable it or just warn user. 
    // Or we keep it visual only. 
    // Let's implement full logic: if linked order exists, create/delete partial payment?
    // It's complex. Let's keep existing visual behavior for legacy/individual toggle.
    // Ideally user uses "Pay All".

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
        const session = await auth()
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const notifications = await prisma.notification.findMany()

        // We need the user map again... 
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

        let totalPaidAmount = 0
        const paymentsToCreate: any[] = []
        const orderUpdates: any[] = []

        // Iterate over all notifications to find unpaid items for this employee
        for (const note of notifications) {
            let countForThisNote = 0

            const updatedHistory = note.history.map((h: any) => {
                const resolvedName = h.userId ? userMap.get(h.userId) : h.userName

                // Match by either resolved name OR original userName to handle name changes
                // and cases where userId lookup returns undefined
                const nameMatches = resolvedName === employeeName || h.userName === employeeName

                if (nameMatches && !h.isPaid) {
                    countForThisNote++
                    return { ...h, isPaid: true }
                }
                return h
            })

            if (countForThisNote > 0) {
                // Use per-notification rate, fallback to global default 42.5
                const rate = note.employeeRate ?? 52
                const amount = countForThisNote * rate

                totalPaidAmount += amount

                // If linked Order exists, prepare EmployeePayment
                if (note.orderId && amount > 0) {
                    paymentsToCreate.push({
                        notificationId: note.id, // Add ID so we can update the right note later
                        orderId: note.orderId,
                        amount: amount,
                        processedById: session.user.id,
                        noteAuthor: employeeName
                    })
                }
            }
        }

        if (totalPaidAmount === 0 && paymentsToCreate.length === 0) {
            return { success: true, message: "Nothing to pay" }
        }

        // Execute DB updates
        // 1. Update "No Order" notifications directly (Handled after this block now)
        // await prisma.$transaction(orderUpdates) // REMOVED

        // 2. Create Employee Payments & Transactions for linked orders
        // We do this separately because creating multiple payments in a transaction loop is complex 
        // with the helpers

        // Execute DB updates
        // We need to create Employee Payments FIRST to get IDs, then update history

        if (paymentsToCreate.length > 0) {
            const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } })
            const adminName = adminUser?.displayName || adminUser?.username || "Admin"

            for (const p of paymentsToCreate) {
                await prisma.$transaction(async (tx) => {
                    // 1. Create EmployeePayment
                    const empPayment = await tx.employeePayment.create({
                        data: {
                            orderId: p.orderId,
                            amount: p.amount,
                            paymentDate: new Date(),
                            paymentMethod: 'CASH', // Default
                            processedBy: adminName,
                            processedById: p.processedById,
                            recipient: p.noteAuthor,
                            notes: 'Выплата за рассылку (автоматически)'
                        }
                    })

                    // 2. Update Order Paid Amount
                    await tx.order.update({
                        where: { id: p.orderId },
                        data: {
                            employeePaidAmount: { increment: p.amount }
                        }
                    })

                    // 3. Create Expense Transaction
                    await tx.transaction.create({
                        data: {
                            type: 'EXPENSE',
                            amount: p.amount,
                            category: 'Зарплата',
                            date: new Date(),
                            description: `Выплата за рассылку: ${p.noteAuthor}`,
                            createdBy: adminName,
                            createdById: p.processedById,
                            employeePaymentId: empPayment.id
                        }
                    })

                    // 4. Update Notification History with the Payment ID
                    // We need to find the specific notification again or pass ID
                    // Note: p was constructed from notifications loop. We need to know WHICH notification this payment belongs to.
                    // The logic above grouped by... wait, the logic above iterated notifications.
                    // If one order has multiple notifications... we might have multiple payments for same order?
                    // The loop above: for (const note of notifications) -> paymentsToCreate.push(...)
                    // So we have a 1-to-1 mapping between a "payment chunk" and a notification in this implementation.
                    // We should pass notificationId in p.

                    if (p.notificationId) {
                        const note = notifications.find(n => n.id === p.notificationId)
                        if (note) {
                            const updatedHistory = note.history.map((h: any) => {
                                const resolvedName = h.userId ? userMap.get(h.userId) : h.userName
                                const nameMatches = resolvedName === employeeName || h.userName === employeeName
                                if (nameMatches && !h.isPaid) {
                                    return { ...h, isPaid: true, employeePaymentId: empPayment.id }
                                }
                                return h
                            })

                            await tx.notification.update({
                                where: { id: p.notificationId },
                                data: { history: updatedHistory }
                            })
                        }
                    }
                })
            }
        } else {
            // If no order payments (e.g. only history updates with no price/order), we still need to update history?
            // The logic above: if note.orderId && amount > 0 -> paymentsToCreate.push
            // What if note has no orderId? Then we just mark as paid but no transaction?
            // That seems to be the current logic.
            // We should process "non-order" updates here.

            // Let's modify the loop to handle both cases efficiently.
            // But for now, adhering to the previous structure:
            // 1. We pushed 'orderUpdates' for history updates. But we need to update them WITH IDs if possible.
            // If no ID (no order), we just mark paid.
            // If ID (order), we use the payment ID.

            // Refactoring strategy:
            // Separate "Order Linked" updates and "Free/NoOrder" updates.
        }

        // Handle "No Order" updates (where we just mark as paid without a financial transaction record? Or maybe we should create one?)
        // Existing logic for 'orderUpdates' was blindly marking isPaid=true. 
        // We should run 'orderUpdates' ONLY for those that were NOT handled in the payment loop.

        // Actually, let's redefine the flow:
        // iterate notifications:
        // if (note.orderId) -> create payment -> use paymentId to update history
        // else -> just update history isPaid=true

        // So we need to process "free" updates separately.

        const updatesWithoutOrder = notifications.filter(n => !n.orderId).map(note => {
            let changed = false
            const updatedHistory = note.history.map((h: any) => {
                const resolvedName = h.userId ? userMap.get(h.userId) : h.userName
                const nameMatches = resolvedName === employeeName || h.userName === employeeName
                if (nameMatches && !h.isPaid) {
                    changed = true
                    return { ...h, isPaid: true }
                }
                return h
            })

            if (changed) {
                return prisma.notification.update({
                    where: { id: note.id },
                    data: { history: updatedHistory }
                })
            }
            return null
        }).filter(Boolean)

        await prisma.$transaction(updatesWithoutOrder as any)

        revalidatePath('/admin/notifications')
        revalidatePath('/admin/orders')
        revalidatePath('/admin/finances')
        revalidatePath('/admin/business')
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
