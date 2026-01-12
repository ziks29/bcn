import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import NotificationsClient from "./NotificationsClient"

import { prisma } from "@/lib/prisma"

export default async function NotificationsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    const rawNotifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            order: {
                select: { totalPrice: true }
            }
        }
    })

    const notifications = rawNotifications.map(n => ({
        ...n,
        lastSentTime: n.lastSentTime ? n.lastSentTime.toISOString() : null,
        history: n.history.map(h => ({
            userName: h.userName,
            timestamp: h.timestamp.toISOString(),
            isPaid: h.isPaid
        })),
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
        id: n.id,
        price: n.order?.totalPrice // Get price from linked Order
    }))

    return <NotificationsClient userName={session.user.name || "Сотрудник"} userRole={role} initialData={notifications} />
}
