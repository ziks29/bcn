import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OrdersClient from "./OrdersClient"

export default async function OrdersPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    // Fetch all users to populate employee dropdown
    const users = await prisma.user.findMany({
        select: {
            id: true,
            displayName: true,
            username: true
        }
    })

    // Map users to employees for dropdown
    const employees = users.map(user => ({
        id: user.id,
        name: user.displayName || user.username
    }))

    // Fetch all orders with payments
    const rawOrders = await prisma.order.findMany({
        include: {
            payments: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Serialize dates for client component
    const orders = rawOrders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        payments: order.payments.map(payment => ({
            ...payment,
            paymentDate: payment.paymentDate.toISOString(),
            createdAt: payment.createdAt.toISOString(),
            updatedAt: payment.updatedAt.toISOString()
        }))
    }))

    return (
        <OrdersClient
            userName={session.user.name || "Сотрудник"}
            userRole={role}
            initialData={orders}
            employees={employees}
        />
    )
}
