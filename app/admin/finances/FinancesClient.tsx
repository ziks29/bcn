"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Minus, Search, Pencil, Trash2, DollarSign, Filter, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import {
    createTransaction,
    deleteTransaction
} from "@/app/actions/transactions"

interface Payment {
    id: string
    amount: number
    paymentDate: string
    paymentMethod: string
    receivedBy: string
    order: {
        client: string
        description: string
    }
}

interface Transaction {
    id: string
    type: string
    amount: number
    description: string
    category: string | null
    date: string
    createdBy: string
    orderId?: string | null  // Link to order for invoice payments
    employeePaymentId?: string | null  // Link to employee payment for salary transactions
}

const TRANSACTION_TYPES = [
    { value: 'ALL', label: 'Все', color: 'zinc' },
    { value: 'INCOME', label: 'Доход', color: 'emerald' },
    { value: 'EXPENSE', label: 'Расход', color: 'red' }
]

const CATEGORIES = [
    'Зарплата',
    'Счета',
    'Аренда',
    'Другой доход',
    'Прочее'
]

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function formatCurrency(amount: number) {
    return `$${amount.toFixed(2)}`
}

export default function FinancesClient({
    userName,
    userRole,
    payments = [],
    transactions = []
}: {
    userName: string
    userRole: string
    payments?: Payment[]
    transactions?: Transaction[]
}) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [editingType, setEditingType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    })

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const isAdmin = ['ADMIN', 'CHIEF_EDITOR'].includes(userRole)

    // Calculate statistics
    const stats = useMemo(() => {
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
        const totalIncome = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0)
        const totalExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalRevenue = totalPayments + totalIncome
        const balance = totalRevenue - totalExpenses

        // This month stats
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const thisMonthPayments = payments
            .filter(p => new Date(p.paymentDate) >= thisMonthStart)
            .reduce((sum, p) => sum + p.amount, 0)
        const thisMonthIncome = transactions
            .filter(t => t.type === 'INCOME' && new Date(t.date) >= thisMonthStart)
            .reduce((sum, t) => sum + t.amount, 0)
        const thisMonthExpenses = transactions
            .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= thisMonthStart)
            .reduce((sum, t) => sum + t.amount, 0)

        const thisMonthProfit = (thisMonthPayments + thisMonthIncome) - thisMonthExpenses

        return {
            balance,
            totalRevenue,
            totalExpenses,
            thisMonthProfit
        }
    }, [payments, transactions])

    // Filter and combine transactions and payments
    const allEntries = useMemo(() => {
        const paymentEntries = payments.map(p => ({
            id: p.id,
            type: 'PAYMENT' as const,
            amount: p.amount,
            description: `${p.order.client} - ${p.order.description}`,
            category: 'Оплата клиента',
            date: p.paymentDate,
            createdBy: p.receivedBy,
            isPayment: true,
            orderId: null,  // Payments don't have orderId
            employeePaymentId: null  // Payments don't have employeePaymentId
        }))

        const transactionEntries = transactions.map(t => ({
            id: t.id,
            type: t.type as 'INCOME' | 'EXPENSE',
            amount: t.amount,
            description: t.description,
            category: t.category || '-',
            date: t.date,
            createdBy: t.createdBy,
            isPayment: false,
            orderId: t.orderId,  // Include orderId for invoice payments
            employeePaymentId: t.employeePaymentId  // Include employeePaymentId for salary transactions
        }))

        let combined = [...paymentEntries, ...transactionEntries]

        // Apply filters
        if (typeFilter !== 'ALL') {
            combined = combined.filter(entry => {
                if (typeFilter === 'INCOME') {
                    return entry.type === 'INCOME' || entry.type === 'PAYMENT';
                } else if (typeFilter === 'EXPENSE') {
                    return entry.type === 'EXPENSE';
                }
                return true;
            });
        }

        if (searchTerm) {
            combined = combined.filter(entry =>
                entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Date range filter
        if (startDate || endDate) {
            combined = combined.filter(entry => {
                const entryDate = new Date(entry.date)
                const start = startDate ? new Date(startDate) : null
                const end = endDate ? new Date(endDate) : null

                if (start && end) {
                    // Set end date to end of day for inclusive filtering
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    return entryDate >= start && entryDate <= endOfDay
                } else if (start) {
                    return entryDate >= start
                } else if (end) {
                    // Set end date to end of day for inclusive filtering
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    return entryDate <= endOfDay
                }
                return true
            })
        }

        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [payments, transactions, searchTerm, typeFilter, startDate, endDate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.amount || !formData.description) {
            toast.error("Заполните все поля")
            return
        }

        const transactionDate = new Date(formData.date)
        const now = new Date()
        transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

        const res = await createTransaction({
            type: editingType,
            amount: Number(formData.amount),
            description: formData.description,
            category: formData.category || undefined,
            date: transactionDate,
            createdBy: userName
        })

        if (res.success) {
            toast.success(editingType === 'INCOME' ? "Доход добавлен" : "Расход добавлен")
            router.refresh()
            setIsEditing(false)
            setFormData({
                amount: '',
                description: '',
                category: '',
                date: new Date().toISOString().split('T')[0]
            })
        } else {
            toast.error("Ошибка при создании")
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Удалить эту транзакцию?")) {
            const res = await deleteTransaction(id)
            if (res.success) {
                toast.success("Транзакция удалена")
                router.refresh()
            } else {
                toast.error("Ошибка при удалении")
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f1ea] font-serif-body">
            {/* Transaction Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 md:p-8 max-w-lg w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-headline text-xl font-bold mb-4 uppercase">
                            {editingType === 'INCOME' ? 'Добавить доход' : 'Добавить расход'}
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Сумма ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Описание</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Например: Зарплата сотрудника"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Категория (опционально)</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Например: Зарплата, Аренда, Счета..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Дата</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
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
                                    Добавить
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
                            Финансы<span className="text-emerald-600">.</span>
                        </h1>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditingType('INCOME')
                                    setIsEditing(true)
                                }}
                                className="bg-emerald-600 text-white px-6 py-3 font-bold uppercase hover:bg-emerald-700 transition-colors text-sm sm:text-base flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Доход
                            </button>
                            <button
                                onClick={() => {
                                    setEditingType('EXPENSE')
                                    setIsEditing(true)
                                }}
                                className="bg-red-600 text-white px-6 py-3 font-bold uppercase hover:bg-red-700 transition-colors text-sm sm:text-base flex items-center gap-2"
                            >
                                <Minus size={18} />
                                Расход
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Баланс</div>
                        <div className={`font-headline text-2xl font-bold ${stats.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.balance)}
                        </div>
                    </div>
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Доход всего</div>
                        <div className="font-headline text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Расходы всего</div>
                        <div className="font-headline text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Прибыль за месяц</div>
                        <div className={`font-headline text-2xl font-bold ${stats.thisMonthProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.thisMonthProfit)}
                        </div>
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
                                placeholder="Описание, категория..."
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Filter size={12} />
                                Тип
                            </label>
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {TRANSACTION_TYPES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Начало периода</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Конец периода</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setStartDate('')
                                    setEndDate('')
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Очистить даты
                            </button>
                        )}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-4 bg-black text-white">
                        <h2 className="font-bold uppercase tracking-widest text-sm">Все транзакции</h2>
                    </div>
                    <div className="divide-y-2 divide-zinc-200">
                        {allEntries.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 italic">
                                Нет транзакций
                            </div>
                        ) : (
                            allEntries.map((entry, index) => (
                                <div
                                    key={`${entry.type}-${entry.id}`}
                                    className={`p-4 hover:bg-zinc-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`p-2 rounded ${entry.type === 'EXPENSE' ? 'bg-red-100' : 'bg-emerald-100'
                                                }`}>
                                                {entry.type === 'EXPENSE' ? (
                                                    <TrendingDown className="text-red-600" size={20} />
                                                ) : (
                                                    <TrendingUp className="text-emerald-600" size={20} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{entry.description}</div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {formatDate(entry.date)} • {entry.category} • {entry.createdBy}
                                                </div>
                                                {entry.isPayment && (
                                                    <div className="text-xs text-blue-600 mt-1">Платёж от клиента</div>
                                                )}
                                                {(entry.orderId || entry.employeePaymentId) && (
                                                    <Link
                                                        href={`/admin/orders?orderId=${entry.orderId || ''}`}
                                                        className="text-xs text-purple-600 hover:text-purple-800 mt-1 inline-flex items-center gap-1"
                                                    >
                                                        → Связано с заказом
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`font-headline text-lg font-bold ${entry.type === 'EXPENSE' ? 'text-red-600' : 'text-emerald-600'
                                                }`}>
                                                {entry.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(entry.amount)}
                                            </div>
                                            {!entry.isPayment && !entry.orderId && !entry.employeePaymentId && entry.category !== 'Удаление заказа' && isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Results Summary */}
                {allEntries.length > 0 && (
                    <div className="mt-4 text-sm text-zinc-600 text-center">
                        Показано {allEntries.length} {allEntries.length === 1 ? 'транзакция' : 'транзакций'}
                    </div>
                )}
            </div>
        </div>
    )
}
