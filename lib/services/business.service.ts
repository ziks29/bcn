import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Centralized data service for business-related queries.
 * This service fetches Orders, Payments, Transactions, and Users,
 * resolving user names from IDs for backward compatibility.
 * 
 * Cached for 30 seconds using Next.js unstable_cache.
 * Revalidated via tags: 'business', 'orders', 'payments', 'transactions'
 */
export const getBusinessData = unstable_cache(
    async () => {
        const [orders, payments, transactions, users] = await Promise.all([
            // Fetch orders with related data
            prisma.order.findMany({
                include: {
                    payments: {
                        include: {
                            receivedByUser: {
                                select: { id: true, displayName: true, username: true }
                            }
                        }
                    },
                    employeePayments: true, // Fetch employee payments
                    employeeUser: {
                        select: { id: true, displayName: true, username: true }
                    },
                    createdByUser: {
                        select: { id: true, displayName: true, username: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),

            // Fetch payments with related data
            prisma.payment.findMany({
                include: {
                    order: {
                        select: { client: true, description: true }
                    },
                    receivedByUser: {
                        select: { id: true, displayName: true, username: true }
                    }
                },
                orderBy: { paymentDate: 'desc' }
            }),

            // Fetch transactions with related data
            prisma.transaction.findMany({
                include: {
                    createdByUser: {
                        select: { id: true, displayName: true, username: true }
                    }
                },
                orderBy: { date: 'desc' }
            }),

            // Fetch all users for employee dropdowns
            prisma.user.findMany({
                select: {
                    id: true,
                    displayName: true,
                    username: true
                }
            })
        ])

        // Serialize dates for client components
        const serializedOrders = orders.map(order => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            payments: order.payments.map(payment => ({
                ...payment,
                paymentDate: payment.paymentDate.toISOString(),
                createdAt: payment.createdAt.toISOString(),
                updatedAt: payment.updatedAt.toISOString(),
                // Resolve name from ID, fallback to legacy string
                receivedByName: payment.receivedByUser?.displayName
                    || payment.receivedByUser?.username
                    || payment.receivedBy
            })),
            employeePayments: order.employeePayments.map(ep => ({
                ...ep,
                paymentDate: ep.paymentDate.toISOString(),
                createdAt: ep.createdAt.toISOString(),
                updatedAt: ep.updatedAt.toISOString(),
            })),
            // Resolve names from IDs, fallback to legacy strings
            employeeName: order.employeeUser?.displayName
                || order.employeeUser?.username
                || order.employee,
            createdByName: order.createdByUser?.displayName
                || order.createdByUser?.username
                || order.createdBy
        }))

        const serializedPayments = payments.map(payment => ({
            ...payment,
            paymentDate: payment.paymentDate.toISOString(),
            createdAt: payment.createdAt.toISOString(),
            updatedAt: payment.updatedAt.toISOString(),
            receivedByName: payment.receivedByUser?.displayName
                || payment.receivedByUser?.username
                || payment.receivedBy
        }))

        const serializedTransactions = transactions.map(transaction => ({
            ...transaction,
            date: transaction.date.toISOString(),
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString(),
            createdByName: transaction.createdByUser?.displayName
                || transaction.createdByUser?.username
                || transaction.createdBy,
            orderId: transaction.orderId || null,
            employeePaymentId: transaction.employeePaymentId || null
        }))

        const employees = users.map(user => ({
            id: user.id,
            name: user.displayName || user.username
        }))

        return {
            orders: serializedOrders,
            payments: serializedPayments,
            transactions: serializedTransactions,
            employees
        }
    },
    ['business-data'],  // Cache key
    {
        tags: ['business', 'orders', 'payments', 'transactions'],  // Revalidation tags
        revalidate: 30  // Cache for 30 seconds
    }
)
