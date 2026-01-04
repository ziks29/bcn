import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BusinessClient from "./BusinessClient"

export default async function BusinessPage() {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    // Fetch users for employee dropdown
    const users = await prisma.user.findMany({
        select: {
            id: true,
            displayName: true,
            username: true
        }
    })

    const employees = users.map(user => ({
        id: user.id,
        name: user.displayName || user.username
    }))

    // Fetch orders data
    const rawOrders = await prisma.order.findMany({
        include: {
            payments: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

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

    // Fetch payments for finances
    const rawPayments = await prisma.payment.findMany({
        include: {
            order: {
                select: {
                    client: true,
                    description: true
                }
            }
        },
        orderBy: {
            paymentDate: 'desc'
        }
    })

    const payments = rawPayments.map(payment => ({
        ...payment,
        paymentDate: payment.paymentDate.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString()
    }))

    // Fetch transactions for finances
    const rawTransactions = await prisma.transaction.findMany({
        orderBy: {
            date: 'desc'
        }
    })

    const transactions = rawTransactions.map(transaction => ({
        ...transaction,
        date: transaction.date.toISOString(),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString()
    }))

    return (
        <BusinessClient
            userName={session.user.name || "Сотрудник"}
            userRole={role}
            employees={employees}
            orders={orders}
            payments={payments}
            transactions={transactions}
        />
    )
}
