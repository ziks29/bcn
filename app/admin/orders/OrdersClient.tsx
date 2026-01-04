"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Search, Pencil, Trash2, DollarSign, ChevronDown, ChevronUp, Calendar, User, Filter } from "lucide-react"
import { toast } from "sonner"
import {
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus
} from "@/app/actions/orders"
import {
    addPayment,
    deletePayment
} from "@/app/actions/payments"

interface Payment {
    id: string
    amount: number
    paymentDate: string
    paymentMethod: string
    receivedBy: string
    receiptNumber?: string | null
    notes?: string | null
}

interface Order {
    id: string
    client: string
    description: string
    packageType: string
    quantity: number
    startDate: string
    endDate: string
    employee: string
    status: string
    totalPrice: number
    notes?: string | null
    createdBy: string
    createdAt: string
    payments: Payment[]
}

type SortKey = 'client' | 'startDate' | 'totalPrice' | 'status' | 'employee'
type SortDirection = 'asc' | 'desc'

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Все статусы', color: 'zinc' },
    { value: 'PENDING', label: 'В ожидании', color: 'yellow' },
    { value: 'ACTIVE', label: 'Активный', color: 'blue' },
    { value: 'COMPLETED', label: 'Завершён', color: 'green' },
    { value: 'CANCELLED', label: 'Отменён', color: 'red' }
]

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Наличные' },
    { value: 'CARD', label: 'Карта' },
    { value: 'BANK_TRANSFER', label: 'Перевод' }
]

function formatDate(dateStr: string) {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year.slice(2)}`
}

function getStatusColor(status: string) {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status)
    return statusOption?.color || 'zinc'
}

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
    const [orders, setOrders] = useState<Order[]>(initialData)
    const [isEditing, setIsEditing] = useState(false)
    const [currentOrder, setCurrentOrder] = useState<Partial<Order>>({})
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, orderId: string | null }>({ isOpen: false, orderId: null })
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        receiptNumber: '',
        notes: ''
    })

    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [employeeFilter, setEmployeeFilter] = useState('ALL')
    const [sortKey, setSortKey] = useState<SortKey>('startDate')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(userRole)

    // Get unique employees from orders for filter (in addition to database employees)
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

            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
            const matchesEmployee = employeeFilter === 'ALL' || order.employee === employeeFilter

            return matchesSearch && matchesStatus && matchesEmployee
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
    }, [orders, searchTerm, statusFilter, employeeFilter, sortKey, sortDirection])

    // Calculate Statistics
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
        const totalPaid = orders.reduce((sum, o) => {
            const paid = o.payments.reduce((pSum, p) => pSum + p.amount, 0)
            return sum + paid
        }, 0)
        const totalPending = totalRevenue - totalPaid
        const activeOrders = orders.filter(o => o.status === 'ACTIVE').length

        return { totalRevenue, totalPaid, totalPending, activeOrders }
    }, [orders])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) return null
        return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
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
        if (!currentOrder.client || !currentOrder.description || !currentOrder.packageType ||
            !currentOrder.employee || !currentOrder.quantity || !currentOrder.totalPrice ||
            !currentOrder.startDate || !currentOrder.endDate) {
            toast.error("Заполните все обязательные поля")
            return
        }

        const payload = {
            client: currentOrder.client.trim(),
            description: currentOrder.description.trim(),
            packageType: currentOrder.packageType.trim(),
            quantity: Number(currentOrder.quantity),
            startDate: currentOrder.startDate,
            endDate: currentOrder.endDate,
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
                setIsEditing(false)
                setCurrentOrder({})
                // Update local state to show changes immediately
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
                setIsEditing(false)
                setCurrentOrder({})
                // Add new order to local state immediately
                // Note: We won't have the actual ID from the server, so we'll use a temp one
                // The page will revalidate and show the real data soon
                const newOrder = {
                    ...payload,
                    id: 'temp-' + Date.now(),
                    status: currentOrder.status || 'PENDING',
                    payments: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setOrders(prevOrders => [newOrder, ...prevOrders])
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
                // Remove order from local state immediately
                setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId))
            } else {
                toast.error("Ошибка при удалении")
            }
        }
    }

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const res = await updateOrderStatus(orderId, newStatus)
        if (res.success) {
            toast.success("Статус обновлён")
            // Update local state immediately
            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === orderId
                        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
                        : o
                )
            )
        } else {
            toast.error("Ошибка при обновлении статуса")
        }
    }

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!paymentModal.orderId) return

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

            // Update local state immediately
            const newPayment = {
                id: 'temp-' + Date.now(),
                orderId: paymentModal.orderId,
                amount: Number(paymentForm.amount),
                paymentDate: paymentForm.paymentDate,
                paymentMethod: paymentForm.paymentMethod,
                receivedBy: userName,
                receiptNumber: paymentForm.receiptNumber || null,
                notes: paymentForm.notes || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
                paymentMethod: 'CASH',
                receiptNumber: '',
                notes: ''
            })
        } else {
            toast.error("Ошибка добавления платежа")
        }
    }

    const handleDeletePayment = async (paymentId: string) => {
        if (confirm("Удалить этот платёж?")) {
            const res = await deletePayment(paymentId)
            if (res.success) {
                toast.success("Платёж удалён")
                // Remove payment from local state immediately
                setOrders(prevOrders =>
                    prevOrders.map(o => ({
                        ...o,
                        payments: o.payments.filter(p => p.id !== paymentId)
                    }))
                )
            } else {
                toast.error("Ошибка при удалении")
            }
        }
    }

    const getTotalPaid = (order: Order) => {
        return order.payments.reduce((sum, p) => sum + p.amount, 0)
    }

    const getPaymentStatus = (order: Order) => {
        const paid = getTotalPaid(order)
        if (paid === 0) return 'unpaid'
        if (paid >= order.totalPrice) return 'paid'
        return 'partial'
    }

    return (
        <div className="min-h-screen bg-[#f4f1ea] font-serif-body">
            {/* Payment Modal */}
            {paymentModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 md:p-8 max-w-lg w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-headline text-xl font-bold mb-4 uppercase">Добавить платёж</h3>
                        <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Сумма</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Дата</label>
                                <input
                                    type="date"
                                    value={paymentForm.paymentDate}
                                    onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Метод оплаты</label>
                                <select
                                    value={paymentForm.paymentMethod}
                                    onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {PAYMENT_METHODS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Номер чека (опционально)</label>
                                <input
                                    type="text"
                                    value={paymentForm.receiptNumber}
                                    onChange={e => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Примечания</label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModal({ isOpen: false, orderId: null })}
                                    className="px-4 py-2 font-bold uppercase hover:bg-zinc-100 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors"
                                >
                                    Добавить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Form Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white p-6 md:p-8 max-w-2xl w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8">
                        <h2 className="font-headline text-2xl mb-4 font-bold uppercase">
                            {currentOrder.id ? "Редактировать заказ" : "Новый заказ"}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Клиент</label>
                                    <input
                                        type="text"
                                        value={currentOrder.client || ""}
                                        onChange={e => setCurrentOrder({ ...currentOrder, client: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Сотрудник</label>
                                    <select
                                        value={currentOrder.employee || ""}
                                        onChange={e => setCurrentOrder({ ...currentOrder, employee: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Выберите сотрудника</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.name}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Описание</label>
                                <input
                                    type="text"
                                    value={currentOrder.description || ""}
                                    onChange={e => setCurrentOrder({ ...currentOrder, description: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Например: Рекламная рассылка"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Пакет</label>
                                    <input
                                        type="text"
                                        value={currentOrder.packageType || ""}
                                        onChange={e => setCurrentOrder({ ...currentOrder, packageType: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="50 рассылок"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Количество</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentOrder.quantity || ""}
                                        onChange={e => setCurrentOrder({ ...currentOrder, quantity: parseInt(e.target.value) })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Дата начала</label>
                                    <input
                                        type="date"
                                        value={currentOrder.startDate || ""}
                                        onChange={e => setCurrentOrder({ ...currentOrder, startDate: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Дата окончания</label>
                                    <input
                                        type="date"
                                        value={currentOrder.endDate || ""}
                                        onChange={e => setCurrentOrder({ ...currentOrder, endDate: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Общая стоимость ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentOrder.totalPrice || ""}
                                    onChange={e => setCurrentOrder({ ...currentOrder, totalPrice: parseFloat(e.target.value) })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Примечания</label>
                                <textarea
                                    value={currentOrder.notes || ""}
                                    onChange={e => setCurrentOrder({ ...currentOrder, notes: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 font-bold uppercase hover:bg-zinc-100 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Всего заказов</div>
                        <div className="font-headline text-2xl font-bold">{orders.length}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Активных</div>
                        <div className="font-headline text-2xl font-bold text-blue-600">{stats.activeOrders}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Оплачено</div>
                        <div className="font-headline text-2xl font-bold text-emerald-600">${stats.totalPaid.toFixed(1)}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">К оплате</div>
                        <div className="font-headline text-2xl font-bold text-red-600">${stats.totalPending.toFixed(1)}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Search size={12} />
                                Поиск
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Клиент, описание..."
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Filter size={12} />
                                Статус
                            </label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <User size={12} />
                                Сотрудник
                            </label>
                            <select
                                value={employeeFilter}
                                onChange={e => setEmployeeFilter(e.target.value)}
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Все сотрудники</option>
                                {allEmployees.map(emp => (
                                    <option key={emp} value={emp}>{emp}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                        <button
                                            onClick={() => handleSort('startDate')}
                                            className="flex items-center gap-1 hover:text-blue-300"
                                        >
                                            Дата {getSortIcon('startDate')}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                        <button
                                            onClick={() => handleSort('client')}
                                            className="flex items-center gap-1 hover:text-blue-300"
                                        >
                                            Клиент {getSortIcon('client')}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest hidden md:table-cell">
                                        Описание
                                    </th>
                                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                        <button
                                            onClick={() => handleSort('employee')}
                                            className="flex items-center gap-1 hover:text-blue-300"
                                        >
                                            Сотрудник {getSortIcon('employee')}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="flex items-center gap-1 hover:text-blue-300"
                                        >
                                            Статус {getSortIcon('status')}
                                        </button>
                                    </th>
                                    <th className="text-right p-3 text-xs font-bold uppercase tracking-widest">
                                        <button
                                            onClick={() => handleSort('totalPrice')}
                                            className="flex items-center gap-1 ml-auto hover:text-blue-300"
                                        >
                                            Сумма {getSortIcon('totalPrice')}
                                        </button>
                                    </th>
                                    <th className="text-center p-3 text-xs font-bold uppercase tracking-widest">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-zinc-500 italic">
                                            Нет заказов
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedOrders.map((order, index) => {
                                        const isExpanded = expandedRows.has(order.id)
                                        const totalPaid = getTotalPaid(order)
                                        const paymentStatus = getPaymentStatus(order)

                                        return (
                                            <React.Fragment key={order.id}>
                                                <tr className={`border-t-2 border-zinc-200 hover:bg-zinc-50 ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
                                                    <td className="p-3 text-sm">
                                                        <div className="font-mono text-xs text-zinc-500">
                                                            {formatDate(order.startDate)}
                                                        </div>
                                                        <div className="font-mono text-xs text-zinc-400">
                                                            {formatDate(order.endDate)}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-sm">{order.client}</div>
                                                        <div className="text-xs text-zinc-500">{order.packageType}</div>
                                                    </td>
                                                    <td className="p-3 text-sm text-zinc-700 hidden md:table-cell max-w-xs truncate">
                                                        {order.description}
                                                    </td>
                                                    <td className="p-3 text-sm font-medium">{order.employee}</td>
                                                    <td className="p-3">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className={`text-xs font-bold uppercase px-2 py-1 border-2 border-${getStatusColor(order.status)}-500 bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                            disabled={!isAdmin}
                                                        >
                                                            {STATUS_OPTIONS.filter(s => s.value !== 'ALL').map(opt => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="font-headline text-lg font-bold">
                                                            ${order.totalPrice.toFixed(1)}
                                                        </div>
                                                        <div className={`text-xs font-bold ${paymentStatus === 'paid' ? 'text-emerald-600' : paymentStatus === 'partial' ? 'text-amber-600' : 'text-red-600'}`}>
                                                            {paymentStatus === 'paid' ? '✓ Оплачено' : paymentStatus === 'partial' ? `Частично: $${totalPaid.toFixed(1)}` : 'Не оплачено'}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => toggleRowExpansion(order.id)}
                                                                className="p-2 hover:bg-zinc-200 rounded transition-colors"
                                                                title="Платежи"
                                                            >
                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentOrder(order)
                                                                    setIsEditing(true)
                                                                }}
                                                                className="p-2 hover:bg-zinc-200 rounded transition-colors"
                                                                title="Редактировать"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => handleDelete(order.id)}
                                                                    className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                                    title="Удалить"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Row - Payments */}
                                                {isExpanded && (
                                                    <tr className="bg-zinc-100 border-t border-zinc-300">
                                                        <td colSpan={7} className="p-4">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h4 className="font-bold text-sm uppercase tracking-wider">История платежей</h4>
                                                                <button
                                                                    onClick={() => setPaymentModal({ isOpen: true, orderId: order.id })}
                                                                    className="bg-emerald-600 text-white px-3 py-1 text-xs font-bold uppercase hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Plus size={14} />
                                                                    Добавить платёж
                                                                </button>
                                                            </div>
                                                            {order.payments.length === 0 ? (
                                                                <p className="text-sm text-zinc-500 italic">Платежей пока нет</p>
                                                            ) : (
                                                                <div className="grid gap-2">
                                                                    {order.payments.map(payment => (
                                                                        <div key={payment.id} className="bg-white border border-zinc-300 p-3 flex justify-between items-center">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="font-headline text-lg font-bold text-emerald-700">
                                                                                    ${payment.amount.toFixed(2)}
                                                                                </div>
                                                                                <div className="text-xs text-zinc-500">
                                                                                    <div className="font-mono">{new Date(payment.paymentDate).toLocaleDateString('ru-RU')}</div>
                                                                                    <div>{PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label}</div>
                                                                                </div>
                                                                                <div className="text-xs text-zinc-400">
                                                                                    Принял: {payment.receivedBy}
                                                                                </div>
                                                                                {payment.receiptNumber && (
                                                                                    <div className="text-xs text-zinc-400">
                                                                                        Чек: {payment.receiptNumber}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {isAdmin && (
                                                                                <button
                                                                                    onClick={() => handleDeletePayment(payment.id)}
                                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

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
