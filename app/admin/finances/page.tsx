import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FinancesClient from "./FinancesClient"

export default async function FinancesPage() {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    // Fetch all payments (income from orders)
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

    // Fetch all transactions (manual income/expenses)
    const rawTransactions = await prisma.transaction.findMany({
        orderBy: {
            date: 'desc'
        }
    })

    // Serialize dates for client component
    const payments = rawPayments.map(payment => ({
        ...payment,
        paymentDate: payment.paymentDate.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString()
    }))

    const transactions = rawTransactions.map(transaction => ({
        ...transaction,
        date: transaction.date.toISOString(),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString()
    }))

    return (
        <FinancesClient
            userName={session.user.name || "Сотрудник"}
            userRole={role}
            payments={payments}
            transactions={transactions}
        />
    )
}
