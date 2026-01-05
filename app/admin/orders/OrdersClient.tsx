"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
    createOrder,
    updateOrder,
    deleteOrder
} from "@/app/actions/orders"
import {
    addPayment,
    deletePayment
} from "@/app/actions/payments"
import {
    addEmployeePayment,
    deleteEmployeePayment
} from "@/app/actions/employee-payments"
import { Order, SortKey, SortDirection } from "./types"
import OrderStats from "./components/stats/OrderStats"
import OrderFilters from "./components/filters/OrderFilters"
import PaymentModal from "./components/modals/PaymentModal"
import EmployeePaymentModal from "./components/modals/EmployeePaymentModal"
import OrderFormModal from "./components/modals/OrderFormModal"
import OrdersTable from "./components/table/OrdersTable"

export default function OrdersClient({
    userName,
    userRole,
    initialData = [],
    employees = []
}: {
    userName: string
    userRole: string
    initialData?: Order[]
    employees?: Array<{ id: string, name: string }>
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [orders, setOrders] = useState<Order[]>(initialData)
    const [isEditing, setIsEditing] = useState(false)
    const [currentOrder, setCurrentOrder] = useState<Partial<Order>>({})
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null)
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, orderId: string | null }>({ isOpen: false, orderId: null })
    const [employeePaymentModal, setEmployeePaymentModal] = useState<{ isOpen: boolean, orderId: string | null }>({ isOpen: false, orderId: null })
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        receiptNumber: '',
        notes: ''
    })
    const [employeePaymentForm, setEmployeePaymentForm] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        notes: '',
        employee: ''
    })
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)

    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState('')
    const [employeeFilter, setEmployeeFilter] = useState('ALL')
    const [sortKey, setSortKey] = useState<SortKey>('startDate')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(userRole)

    // Handle orderId from URL query params (for navigation from Finances)
    useEffect(() => {
        const orderId = searchParams.get('orderId')
        if (orderId && orders.some(o => o.id === orderId)) {
            // Auto-expand the order
            setExpandedRows(new Set([orderId]))
            // Highlight temporarily
            setHighlightedOrderId(orderId)
            // Scroll to order after a short delay
            setTimeout(() => {
                const element = document.getElementById(`order-${orderId}`)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 100)
            // Remove highlight after 3 seconds
            setTimeout(() => setHighlightedOrderId(null), 3000)
        }
    }, [searchParams, orders])

    // Get unique employees from orders for filter
    const allEmployees = useMemo(() => {
        const orderEmployees = new Set(orders.map(o => o.employee))
        const dbEmployees = new Set(employees.map(e => e.name))
        const combined = new Set([...dbEmployees, ...orderEmployees])
        return Array.from(combined).sort()
    }, [orders, employees])

    // Filter and Sort Orders
    const filteredAndSortedOrders = useMemo(() => {
        let filtered = orders.filter(order => {
            const matchesSearch =
                order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.employee.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesEmployee = employeeFilter === 'ALL' || order.employee === employeeFilter

            return matchesSearch && matchesEmployee
        })

        // Sort
        filtered.sort((a, b) => {
            let aVal: any = a[sortKey]
            let bVal: any = b[sortKey]

            if (sortKey === 'startDate') {
                aVal = new Date(a.startDate).getTime()
                bVal = new Date(b.startDate).getTime()
            } else if (sortKey === 'totalPrice') {
                aVal = a.totalPrice
                bVal = b.totalPrice
            } else {
                aVal = String(aVal).toLowerCase()
                bVal = String(bVal).toLowerCase()
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

        return filtered
    }, [orders, searchTerm, employeeFilter, sortKey, sortDirection])

    // Calculate Statistics
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
        const totalPaid = orders.reduce((sum, o) => {
            const paid = o.payments.reduce((pSum, p) => pSum + p.amount, 0)
            return sum + paid
        }, 0)
        const totalPending = totalRevenue - totalPaid
        const activeOrders = orders.length

        return { totalRevenue, totalPaid, totalPending, activeOrders }
    }, [orders])

    // Sync local state with initialData from server refresh
    React.useEffect(() => {
        setOrders(initialData)
    }, [initialData])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    const toggleRowExpansion = (orderId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId)
        } else {
            newExpanded.add(orderId)
        }
        setExpandedRows(newExpanded)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        if (!currentOrder.client || !currentOrder.clientName || !currentOrder.description || !currentOrder.service ||
            !currentOrder.employee || currentOrder.totalPrice === undefined) {
            toast.error("Заполните все обязательные поля")
            return
        }

        const payload = {
            client: currentOrder.client.trim(),
            clientName: currentOrder.clientName.trim(),
            description: currentOrder.description.trim(),
            service: currentOrder.service.trim(),
            startDate: currentOrder.startDate || undefined,
            endDate: currentOrder.endDate || undefined,
            employee: currentOrder.employee.trim(),
            totalPrice: Number(currentOrder.totalPrice),
            notes: currentOrder.notes?.trim() || '',
            createdBy: userName
        }

        if (currentOrder.id) {
            // Update existing order
            const res = await updateOrder(currentOrder.id, payload)
            if (res.success) {
                toast.success("Заказ обновлён")
                router.refresh()
                setIsEditing(false)
                setCurrentOrder({})
                setOrders(prevOrders =>
                    prevOrders.map(o =>
                        o.id === currentOrder.id
                            ? { ...o, ...payload, updatedAt: new Date().toISOString() }
                            : o
                    )
                )
            } else {
                toast.error("Ошибка при обновлении")
            }
        } else {
            // Create new order
            const res = await createOrder(payload)
            if (res.success) {
                toast.success("Заказ создан")
                router.refresh()
                setIsEditing(false)
                setCurrentOrder({})
            } else {
                toast.error("Ошибка при создании")
            }
        }
    }

    const handleDelete = async (orderId: string) => {
        if (confirm("Удалить этот заказ? Это также удалит все связанные платежи.")) {
            const res = await deleteOrder(orderId)
            if (res.success) {
                toast.success("Заказ удалён")
                router.refresh()
                setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId))
            } else {
                toast.error("Ошибка при удалении")
            }
        }
    }

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!paymentModal.orderId) return

        // Optimistic update
        const tempPaymentId = `temp-${Date.now()}`
        const newPayment = {
            id: tempPaymentId,
            amount: Number(paymentForm.amount),
            paymentDate: paymentForm.paymentDate,
            paymentMethod: paymentForm.paymentMethod,
            receivedBy: userName,
            receiptNumber: paymentForm.receiptNumber || null,
            notes: paymentForm.notes || null
        }

        setOrders(prevOrders =>
            prevOrders.map(o =>
                o.id === paymentModal.orderId
                    ? { ...o, payments: [...o.payments, newPayment] }
                    : o
            )
        )

        setPaymentModal({ isOpen: false, orderId: null })
        setPaymentForm({
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: '',
            receiptNumber: '',
            notes: ''
        })

        const res = await addPayment({
            orderId: paymentModal.orderId,
            amount: Number(paymentForm.amount),
            paymentDate: new Date(paymentForm.paymentDate),
            paymentMethod: paymentForm.paymentMethod,
            receivedBy: userName,
            receiptNumber: paymentForm.receiptNumber || undefined,
            notes: paymentForm.notes || undefined
        })

        if (res.success) {
            toast.success("Платёж добавлен")
            router.refresh()
        } else {
            toast.error("Ошибка добавления платежа")
            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === paymentModal.orderId
                        ? { ...o, payments: o.payments.filter(p => p.id !== tempPaymentId) }
                        : o
                )
            )
        }
    }

    const handleDeletePayment = async (paymentId: string) => {
        if (paymentId.startsWith('temp-')) {
            toast.error("Подождите, платёж ещё сохраняется...")
            return
        }

        if (deletingPaymentId === paymentId) return

        if (confirm("Удалить этот платёж?")) {
            setDeletingPaymentId(paymentId)

            setOrders(prevOrders =>
                prevOrders.map(o => ({
                    ...o,
                    payments: o.payments.filter(p => p.id !== paymentId)
                }))
            )

            const res = await deletePayment(paymentId)
            setDeletingPaymentId(null)

            if (res.success) {
                toast.success("Платёж удалён")
                router.refresh()
            } else {
                toast.error("Не удалось удалить платёж")
                router.refresh()
            }
        }
    }

    const handleEmployeePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!employeePaymentModal.orderId || !employeePaymentForm.amount) return

        const tempId = `temp-${Date.now()}`
        const newPayment = {
            id: tempId,
            amount: parseFloat(employeePaymentForm.amount),
            paymentDate: employeePaymentForm.paymentDate,
            paymentMethod: employeePaymentForm.paymentMethod,
            processedBy: userName,
            notes: employeePaymentForm.notes || null
        }

        const employeesMap = new Map(employees.map(e => [e.name, e.id]))
        const targetEmployeeId = employeesMap.get(employeePaymentForm.employee)

        setOrders(prevOrders =>
            prevOrders.map(o =>
                o.id === employeePaymentModal.orderId
                    ? {
                        ...o,
                        employeePaidAmount: (o.employeePaidAmount || 0) + newPayment.amount,
                        employeePayments: [...(o.employeePayments || []), newPayment]
                    }
                    : o
            )
        )

        setEmployeePaymentModal({ isOpen: false, orderId: null })
        setEmployeePaymentForm({
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: '',
            notes: '',
            employee: ''
        })

        const paymentDate = new Date(employeePaymentForm.paymentDate)
        const now = new Date()
        paymentDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

        const res = await addEmployeePayment({
            orderId: employeePaymentModal.orderId,
            amount: parseFloat(employeePaymentForm.amount),
            paymentDate: paymentDate,
            paymentMethod: employeePaymentForm.paymentMethod,
            notes: employeePaymentForm.notes || undefined,
            employeeName: employeePaymentForm.employee,
            targetEmployeeId: targetEmployeeId
        })

        if (res.success) {
            toast.success("Выплата сотруднику добавлена")
            router.refresh()
        } else {
            toast.error("Ошибка добавления выплаты")
            router.refresh()
        }
    }

    const handleAutoPayout = async (order: Order, amount: number) => {
        if (amount <= 0) {
            toast.error("Нет доступной суммы для выплаты (лимит исчерпан)")
            return
        }

        const tempId = `temp-${Date.now()}`
        const newPayment = {
            id: tempId,
            amount: amount,
            paymentDate: employeePaymentForm.paymentDate,
            paymentMethod: employeePaymentForm.paymentMethod,
            processedBy: userName,
            notes: employeePaymentForm.notes || "Автовиплата (85%)"
        }

        setOrders(prevOrders =>
            prevOrders.map(o =>
                o.id === order.id
                    ? {
                        ...o,
                        employeePaidAmount: (o.employeePaidAmount || 0) + amount,
                        employeePayments: [...(o.employeePayments || []), newPayment]
                    }
                    : o
            )
        )

        setEmployeePaymentModal({ isOpen: false, orderId: null })
        setEmployeePaymentForm({
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: '',
            notes: '',
            employee: ''
        })

        const paymentDate = new Date(employeePaymentForm.paymentDate)
        const now = new Date()
        paymentDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

        const res = await addEmployeePayment({
            orderId: order.id,
            amount: amount,
            paymentDate: paymentDate,
            paymentMethod: employeePaymentForm.paymentMethod,
            notes: employeePaymentForm.notes || undefined
        })

        if (res.success) {
            toast.success("Полная выплата успешно проведена")
            router.refresh()
        } else {
            toast.error("Ошибка при выплате")
            router.refresh()
        }
    }

    const handleDeleteEmployeePayment = async (paymentId: string) => {
        if (paymentId.startsWith('temp-')) return
        if (confirm("Удалить эту выплату?")) {
            let paymentAmount = 0
            setOrders(prevOrders =>
                prevOrders.map(o => {
                    const payment = o.employeePayments?.find(p => p.id === paymentId)
                    if (payment) paymentAmount = payment.amount
                    return {
                        ...o,
                        employeePaidAmount: payment ? (o.employeePaidAmount || 0) - paymentAmount : o.employeePaidAmount,
                        employeePayments: o.employeePayments?.filter(p => p.id !== paymentId) || []
                    }
                })
            )

            const res = await deleteEmployeePayment(paymentId)
            if (res.success) {
                toast.success("Выплата удалена")
                router.refresh()
            } else {
                toast.error("Ошибка удаления выплаты")
                router.refresh()
            }
        }
    }

    const handleToggleIsPaid = async (orderId: string, newIsPaid: boolean) => {
        // Optimistic update
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, isPaid: newIsPaid } : o
        ))

        const res = await updateOrder(orderId, { isPaid: newIsPaid })

        if (res.success) {
            toast.success(newIsPaid ? "Счет помечен как оплаченный" : "Счет помечен как неоплаченный")
        } else {
            toast.error("Ошибка обновления статуса")
            // Rollback
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, isPaid: !newIsPaid } : o
            ))
        }
    }

    const getEmployeePaymentStatus = (order: Order) => {
        const paidAmount = order.employeePaidAmount || 0
        if (paidAmount >= order.totalPrice * 0.85) return 'Оплачен'
        if (paidAmount > 0) return 'Частично оплачен'
        return 'Не оплачен'
    }

    const currentOrderForModal = employeePaymentModal.orderId
        ? orders.find(o => o.id === employeePaymentModal.orderId) || null
        : null

    return (
        <div className="min-h-screen bg-[#f4f1ea] font-serif-body">
            {/* Modals */}
            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, orderId: null })}
                onSubmit={handlePaymentSubmit}
                paymentForm={paymentForm}
                setPaymentForm={setPaymentForm}
            />

            <EmployeePaymentModal
                isOpen={employeePaymentModal.isOpen}
                onClose={() => setEmployeePaymentModal({ isOpen: false, orderId: null })}
                onSubmit={handleEmployeePaymentSubmit}
                form={employeePaymentForm}
                setForm={setEmployeePaymentForm}
                order={currentOrderForModal}
                onAutoPayout={handleAutoPayout}
                employees={employees}
            />

            <OrderFormModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSubmit={handleSubmit}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
                employees={employees}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <div>
                        <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter">
                            Заказы<span className="text-blue-600">.</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setCurrentOrder({ employee: userName })
                            setIsEditing(true)
                        }}
                        className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-zinc-800 transition-colors text-sm sm:text-base flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Создать
                    </button>
                </div>

                {/* Stats Cards */}
                <OrderStats
                    totalOrders={orders.length}
                    activeOrders={stats.activeOrders}
                    totalPaid={stats.totalPaid}
                    totalPending={stats.totalPending}
                />

                {/* Filters */}
                <OrderFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    employeeFilter={employeeFilter}
                    setEmployeeFilter={setEmployeeFilter}
                    allEmployees={allEmployees}
                />

                {/* Orders Table */}
                <OrdersTable
                    orders={filteredAndSortedOrders}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    expandedRows={expandedRows}
                    onToggleExpand={toggleRowExpansion}
                    highlightedOrderId={highlightedOrderId}
                    isAdmin={isAdmin}
                    onEdit={(order) => {
                        setCurrentOrder(order)
                        setIsEditing(true)
                    }}
                    onDelete={handleDelete}
                    onToggleIsPaid={handleToggleIsPaid}
                    onAddEmployeePayment={(orderId) => {
                        const order = orders.find(o => o.id === orderId)
                        setEmployeePaymentForm(prev => ({ ...prev, employee: order?.employee || '' }))
                        setEmployeePaymentModal({ isOpen: true, orderId })
                    }}
                    onDeleteEmployeePayment={handleDeleteEmployeePayment}
                    getEmployeePaymentStatus={getEmployeePaymentStatus}
                />

                {/* Results Summary */}
                {filteredAndSortedOrders.length !== orders.length && (
                    <div className="mt-4 text-sm text-zinc-600 text-center">
                        Показано {filteredAndSortedOrders.length} из {orders.length} заказов
                    </div>
                )}
            </div>
        </div>
    )
}
