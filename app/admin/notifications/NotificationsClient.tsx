"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Copy, Send, Pencil, Trash2, Clock, Check, DollarSign, Archive, ArchiveRestore, ChevronDown, ChevronUp, Filter, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import {
    createNotification,
    updateNotification,
    deleteNotification as deleteNotificationAction,
    processSendNotification,
    toggleNotificationPayout as togglePayoutAction,
    payAllEmployee,
    toggleArchiveNotification
} from "@/app/actions/notifications"

interface SendGeneric {
    userName: string
    timestamp: string
    isPaid?: boolean
}

interface Notification {
    id: string
    customer: string
    adText: string
    quantity: number
    sentCount: number
    lastSentTime?: string | null
    history: SendGeneric[]
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    author: string
    isNew?: boolean
    isArchived?: boolean
    price?: number
    employeeRate?: number
    orderId?: string | null
    createdAt: string
}

function getSentToday(history: SendGeneric[]) {
    if (!history) return 0
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return history.filter(h => new Date(h.timestamp).getTime() >= startOfDay).length
}

function TimeSince({ date }: { date?: string | null }) {
    const [label, setLabel] = useState("")

    useEffect(() => {
        if (!date) return

        const updateKey = setInterval(() => {
            const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

            if (diff < 60) {
                setLabel(`${diff}с`)
            } else if (diff < 3600) {
                setLabel(`${Math.floor(diff / 60)}м ${diff % 60}с`)
            } else {
                setLabel(`${Math.floor(diff / 3600)}ч ${Math.floor((diff % 3600) / 60)}м`)
            }
        }, 1000)

        return () => clearInterval(updateKey)
    }, [date])

    if (!date) return null

    return (
        <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
            <Clock size={12} />
            {label || "0с"}
        </span>
    )
}

function FormatTime({ date }: { date: string }) {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()

    const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    if (isToday) return timeStr

    const dateStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
    return `${dateStr} ${timeStr}`
}

function formatDate(dateStr: string) {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year.slice(2)}`
}

export default function NotificationsClient({
    userName,
    userRole,
    initialData = []
}: {
    userName: string,
    userRole: string,
    initialData?: Notification[]
}) {
    const [notifications, setNotifications] = useState<Notification[]>(initialData)
    const [isEditing, setIsEditing] = useState(false)

    const [currentNotification, setCurrentNotification] = useState<Partial<Notification>>({})
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, notificationId: string | null }>({
        isOpen: false,
        notificationId: null
    })
    const [payoutConfirmModal, setPayoutConfirmModal] = useState<{ isOpen: boolean, employeeName: string | null }>({
        isOpen: false,
        employeeName: null
    })
    const [noPriceConfirmModal, setNoPriceConfirmModal] = useState<{ isOpen: boolean, data: any | null }>({
        isOpen: false,
        data: null
    })
    const [isArchiveOpen, setIsArchiveOpen] = useState(false)
    const [sortBy, setSortBy] = useState<"time" | "customer" | "created">("time")
    const [filterActiveMSK, setFilterActiveMSK] = useState(false)

    // Sync state with prop updates (from server revalidation)
    useEffect(() => {
        setNotifications(initialData)
    }, [initialData])

    // Updated to use per-notification rate
    const canManagePayouts = ['ADMIN', 'CHIEF_EDITOR'].includes(userRole)

    // Calculate stats (Personal)
    const totalSends = notifications.reduce((sum, n) => sum + (n.history?.filter(h => h.userName === userName).length || 0), 0)
    const totalPaidSends = notifications.reduce((sum, n) => sum + (n.history?.filter(h => h.userName === userName && h.isPaid).length || 0), 0)

    const totalEarned = notifications.reduce((sum, n) => {
        const count = n.history?.filter(h => h.userName === userName).length || 0
        const rate = n.employeeRate ?? 52
        return sum + (count * rate)
    }, 0)

    const totalPaid = notifications.reduce((sum, n) => {
        const count = n.history?.filter(h => h.userName === userName && h.isPaid).length || 0
        const rate = n.employeeRate ?? 52
        return sum + (count * rate)
    }, 0)

    // Calculate Payout Stats for Admins
    const payoutStats = notifications.reduce((acc, note) => {
        if (!note.history) return acc
        const rate = note.employeeRate ?? 52

        note.history.forEach(h => {
            if (!h.isPaid) {
                if (!acc[h.userName]) {
                    acc[h.userName] = {
                        count: 0,
                        amount: 0
                    }
                }
                acc[h.userName].count += 1
                acc[h.userName].amount += rate
            }
        })
        return acc
    }, {} as Record<string, { count: number, amount: number }>)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            customer: currentNotification.customer!,
            adText: currentNotification.adText!,
            quantity: Number(currentNotification.quantity) || 1,
            startDate: currentNotification.startDate || new Date().toISOString().split('T')[0],
            endDate: currentNotification.endDate || new Date().toISOString().split('T')[0],
            startTime: currentNotification.startTime || "12:00",
            endTime: currentNotification.endTime || "13:00",
            price: currentNotification.price,
            employeeRate: currentNotification.employeeRate // Pass through 0 if set
        }

        if (currentNotification.id) {
            // Edit
            const res = await updateNotification(currentNotification.id, payload)
            if (res.success) {
                toast.success("Рассылка обновлена")
                setIsEditing(false)
                setCurrentNotification({})
            } else {
                toast.error("Ошибка при обновлении")
            }
        } else {
            // Create - check if price is empty
            const hasPrice = payload.price !== undefined && payload.price !== null && payload.price !== 0

            if (!hasPrice) {
                // Show confirmation modal
                setNoPriceConfirmModal({ isOpen: true, data: payload })
                return
            }

            // If price is set, create directly
            const res = await createNotification({ ...payload, author: userName })
            if (res.success) {
                toast.success("Рассылка создана")
                setIsEditing(false)
                setCurrentNotification({})
            } else {
                toast.error("Ошибка при создании")
            }
        }
    }


    const startEdit = (notification: Notification) => {
        setCurrentNotification(notification)
        setIsEditing(true)
    }

    const deleteNotification = async (id: string) => {
        if (confirm("Вы уверены, что хотите удалить это уведомление?")) {
            const res = await deleteNotificationAction(id)
            if (res.success) {
                toast.success("Уведомление удалено")
            } else {
                toast.error("Ошибка при удалении")
            }
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Текст скопирован в буфер обмена")
    }

    const handleSendClick = (id: string) => {
        setConfirmModal({ isOpen: true, notificationId: id })
    }

    const confirmSend = async () => {
        if (!confirmModal.notificationId) return

        const res = await processSendNotification(confirmModal.notificationId, userName)

        if (res.success) {
            toast.success("Отправленный статус записан!")
        } else {
            toast.error(res.error || "Ошибка при отправке")
        }

        setConfirmModal({ isOpen: false, notificationId: null })
    }

    const togglePayout = async (noteId: string, timestamp: string) => {
        if (!canManagePayouts) return

        const res = await togglePayoutAction(noteId, timestamp)
        if (res.success) {
            toast.success("Статус оплаты обновлен")
        } else {
            toast.error("Ошибка обновления статуса")
        }
    }

    const handlePayAll = (employeeName: string) => {
        setPayoutConfirmModal({ isOpen: true, employeeName })
    }

    const confirmPayout = async () => {
        if (!payoutConfirmModal.employeeName) return

        const res = await payAllEmployee(payoutConfirmModal.employeeName)
        if (res.success) {
            toast.success(`Выплата сотруднику ${payoutConfirmModal.employeeName} подтверждена`)
        } else {
            toast.error("Ошибка при проведении выплаты")
        }
        setPayoutConfirmModal({ isOpen: false, employeeName: null })
    }

    const confirmNoPriceCreate = async () => {
        if (!noPriceConfirmModal.data) return

        const res = await createNotification({ ...noPriceConfirmModal.data, author: userName })
        if (res.success) {
            toast.success("Рассылка создана")
            setIsEditing(false)
            setCurrentNotification({})
        } else {
            toast.error("Ошибка при создании")
        }
        setNoPriceConfirmModal({ isOpen: false, data: null })
    }

    const toggleArchive = async (id: string) => {
        const res = await toggleArchiveNotification(id)
        if (res.success) {
            toast.success("Статус архивации изменен")
        } else {
            toast.error("Ошибка изменения статуса")
        }
    }

    // Helper to get the most recent send time from all notifications
    const getLastGlobalSendTime = () => {
        let maxTime = 0
        notifications.forEach(n => {
            if (n.lastSentTime) {
                const time = new Date(n.lastSentTime).getTime()
                if (time > maxTime) maxTime = time
            }
        })
        return maxTime > 0 ? maxTime : null
    }

    // Specific Notification Cooldown Logic
    const notificationToConfirm = confirmModal.notificationId
        ? notifications.find(n => n.id === confirmModal.notificationId)
        : null

    const timeSinceLastSend = notificationToConfirm?.lastSentTime
        ? Math.floor((new Date().getTime() - new Date(notificationToConfirm.lastSentTime).getTime()) / 1000)
        : null

    const isCooldownActive = timeSinceLastSend !== null && timeSinceLastSend < 1800 // 30 minutes in seconds

    // Global Cooldown Logic (5 minutes)
    const lastGlobalSendTime = getLastGlobalSendTime()
    const nowTime = new Date().getTime()
    const timeSinceGlobalSend = lastGlobalSendTime ? Math.floor((nowTime - lastGlobalSendTime) / 1000) : null
    const isGlobalCooldownActive = timeSinceGlobalSend !== null && timeSinceGlobalSend < 300 // 5 minutes in seconds

    const formatTimeSince = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const getTotalCampaignLimit = (quantity: number, startDate: string, endDate: string) => {
        if (!startDate || !endDate) return quantity
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return quantity * diffDays
    }

    // MSK Time helper (Moscow is UTC+3)
    const isCurrentlyActiveMSK = (note: Notification) => {
        const now = new Date()

        // Moscow is UTC+3. Use Intl for reliable extraction regardless of local system time.
        const mskDateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now) // YYYY-MM-DD

        const mskTimeStr = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Moscow',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now) // HH:mm

        const dateInRange = mskDateStr >= note.startDate && mskDateStr <= note.endDate

        const timeInRange = note.startTime <= note.endTime
            ? (mskTimeStr >= note.startTime && mskTimeStr <= note.endTime)
            : (mskTimeStr >= note.startTime || mskTimeStr <= note.endTime)

        return dateInRange && timeInRange
    }

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">


            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white p-6 md:p-8 max-w-sm w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-headline text-xl font-bold mb-4 text-center">Подтверждение</h3>
                        <p className="font-serif text-lg text-center mb-6">Уведомление было отправлено в игре?</p>

                        {isGlobalCooldownActive && timeSinceGlobalSend !== null && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-center">
                                <p className="text-red-600 font-bold text-sm uppercase mb-1">Глобальный КД (5 мин)</p>
                                <p className="text-red-800 text-sm">
                                    Скрипт может не отправить сообщение.<br />
                                    Прошло с последней отправки: <span className="font-mono font-bold text-lg">{formatTimeSince(timeSinceGlobalSend)}</span>
                                </p>
                            </div>
                        )}

                        {isCooldownActive && timeSinceLastSend !== null && (
                            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-center">
                                <p className="text-amber-600 font-bold text-sm uppercase mb-1">Личный КД (30 мин)</p>
                                <p className="text-amber-800 text-sm">
                                    Вы уверены что хотите отправить сейчас? <br />
                                    Прошло с прошлого: <span className="font-mono font-bold text-lg">{formatTimeSince(timeSinceLastSend)}</span>
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, notificationId: null })}
                                className="px-4 py-2 font-bold uppercase hover:bg-zinc-100 transition-colors border-2 border-transparent hover:border-black"
                            >
                                Нет
                            </button>
                            <button
                                onClick={confirmSend}
                                className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors border-2 border-black"
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payout Confirmation Modal */}
            {payoutConfirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white p-6 md:p-8 max-w-sm w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-headline text-xl font-bold mb-4 text-center">Выплата</h3>
                        <p className="font-serif text-lg text-center mb-6">
                            Подтверждаете выплату сотруднику <span className="font-bold">{payoutConfirmModal.employeeName}</span> за все неотплаченные отправки?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setPayoutConfirmModal({ isOpen: false, employeeName: null })}
                                className="px-4 py-2 font-bold uppercase hover:bg-zinc-100 transition-colors border-2 border-transparent hover:border-black"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmPayout}
                                className="bg-emerald-600 text-white px-6 py-2 font-bold uppercase hover:bg-emerald-700 transition-colors border-2 border-emerald-800"
                            >
                                Выплатить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No Price Confirmation Modal */}
            {noPriceConfirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white p-6 md:p-8 max-w-md w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-headline text-xl font-bold mb-4 text-center">Внимание</h3>
                        <div className="mb-6">
                            <p className="font-serif text-lg text-center mb-3">
                                Сумма не указана.
                            </p>
                            <p className="font-serif text-base text-center text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
                                Заказ <span className="font-bold">не будет создан</span> в системе.
                            </p>
                        </div>
                        <p className="font-serif text-sm text-center mb-6 text-zinc-600">
                            Продолжить создание рассылки?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setNoPriceConfirmModal({ isOpen: false, data: null })}
                                className="px-4 py-2 font-bold uppercase hover:bg-zinc-100 transition-colors border-2 border-transparent hover:border-black"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmNoPriceCreate}
                                className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors border-2 border-black"
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/admin" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest block mb-2">
                            ← Назад в меню
                        </Link>
                        <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter">
                            Рассылки<span className="text-pink-600">.</span>
                        </h1>
                    </div>
                    <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Заработано / Оплачено</div>
                            <div className="font-headline text-xl md:text-2xl font-bold">
                                <span className="text-emerald-700">${totalEarned.toFixed(1)}</span>
                                <span className="text-zinc-300 mx-2">/</span>
                                <span className="text-zinc-900">${totalPaid.toFixed(1)}</span>
                            </div>
                        </div>



                        <button
                            onClick={() => {
                                setCurrentNotification({ employeeRate: 52 })
                                setIsEditing(true)
                            }}
                            className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-zinc-800 transition-colors text-sm sm:text-base"
                        >
                            + Создать
                        </button>
                    </div>
                </div>

                {/* Filters and Sorting */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-white border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            onClick={() => setSortBy("time")}
                            className={`px-3 py-1 text-xs font-bold uppercase transition-colors ${sortBy === 'time' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
                        >
                            По времени
                        </button>
                        <button
                            onClick={() => setSortBy("customer")}
                            className={`px-3 py-1 text-xs font-bold uppercase transition-colors ${sortBy === 'customer' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
                        >
                            По клиенту
                        </button>
                        <button
                            onClick={() => setSortBy("created")}
                            className={`px-3 py-1 text-xs font-bold uppercase transition-colors ${sortBy === 'created' ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
                        >
                            По созданию
                        </button>
                    </div>

                    <button
                        onClick={() => setFilterActiveMSK(!filterActiveMSK)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[1px] active:shadow-none ${filterActiveMSK ? 'bg-pink-600 text-white' : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                    >
                        <Filter size={14} />
                        Показать только активные
                    </button>

                    {filterActiveMSK && (
                        <span className="text-[10px] font-bold uppercase text-pink-600 animate-pulse">
                            • Фильтр активен
                        </span>
                    )}
                </div>

                {/* Payouts Summary (Inline) */}
                {canManagePayouts && Object.keys(payoutStats).length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-headline text-xl font-bold uppercase">К выплате</h3>
                            <div className="font-headline text-2xl font-bold text-black border-b-2 border-pink-500">
                                Всего: ${Object.values(payoutStats).reduce((sum, s) => sum + s.amount, 0).toFixed(1)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(payoutStats).map(([name, stats]) => (
                                <div key={name} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg leading-tight">{name}</span>
                                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">
                                                {stats.count} отправок
                                            </span>
                                        </div>
                                        <span className="font-headline text-xl font-bold text-emerald-700">
                                            ${stats.amount.toFixed(1)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handlePayAll(name)}
                                        className="w-full bg-emerald-600 text-white p-2 text-sm font-bold uppercase hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <DollarSign size={16} />
                                        Выплатить
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Form Modal/Overlay */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-white p-6 md:p-8 max-w-lg w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8">
                            <h2 className="font-headline text-2xl mb-4 font-bold uppercase">
                                {currentNotification.id ? "Редактировать" : "Новая рассылка"}
                            </h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Заказчик</label>
                                    <input
                                        type="text"
                                        value={currentNotification.customer || ""}
                                        onChange={e => setCurrentNotification({ ...currentNotification, customer: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="Например: BCN"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold uppercase tracking-widest">Дата начала</label>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentNotification({ ...currentNotification, startDate: new Date().toISOString().split('T')[0] })}
                                                className="text-[10px] font-bold uppercase tracking-wider text-pink-600 hover:text-pink-800"
                                            >
                                                Сегодня
                                            </button>
                                        </div>
                                        <input
                                            type="date"
                                            value={currentNotification.startDate || ""}
                                            onChange={e => setCurrentNotification({ ...currentNotification, startDate: e.target.value })}
                                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold uppercase tracking-widest">Дата окончания</label>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentNotification({ ...currentNotification, endDate: new Date().toISOString().split('T')[0] })}
                                                className="text-[10px] font-bold uppercase tracking-wider text-pink-600 hover:text-pink-800"
                                            >
                                                Сегодня
                                            </button>
                                        </div>
                                        <input
                                            type="date"
                                            value={currentNotification.endDate || ""}
                                            onChange={e => setCurrentNotification({ ...currentNotification, endDate: e.target.value })}
                                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Время с</label>
                                        <input
                                            type="time"
                                            value={currentNotification.startTime || ""}
                                            onChange={e => setCurrentNotification({ ...currentNotification, startTime: e.target.value })}
                                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Время по</label>
                                        <input
                                            type="time"
                                            value={currentNotification.endTime || ""}
                                            onChange={e => setCurrentNotification({ ...currentNotification, endTime: e.target.value })}
                                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Всего в день</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentNotification.quantity || ""}
                                        onChange={e => setCurrentNotification({ ...currentNotification, quantity: parseInt(e.target.value) })}
                                        className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        required
                                    />
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Сумма (Оплата клиентом)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={currentNotification.price || ""}
                                            onChange={e => setCurrentNotification({ ...currentNotification, price: parseFloat(e.target.value) })}
                                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Оставьте пустым если бесплатно"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                                            Если указано, будет автоматически создан Заказ на эту сумму.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Выплата (за 1 шт)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={currentNotification.employeeRate !== undefined ? currentNotification.employeeRate : ""}
                                            onChange={e => setCurrentNotification({ ...currentNotification, employeeRate: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="По умолчанию 52"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                                            Сколько получит сотрудник за одну отправку.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Текст рекламы</label>
                                    <textarea
                                        value={currentNotification.adText || ""}
                                        onChange={e => setCurrentNotification({ ...currentNotification, adText: e.target.value })}
                                        className="w-full border-2 border-black p-2 font-serif min-h-[100px] focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="Введите текст объявления..."
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
                                        Сохранить
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {notifications.filter(n => !n.isArchived).length === 0 ? (
                        <p className="text-zinc-500 italic text-center py-8">Нет активных рассылок.</p>
                    ) : (
                        notifications
                            .filter(n => !n.isArchived)
                            .filter(n => filterActiveMSK ? isCurrentlyActiveMSK(n) : true)
                            .sort((a, b) => {
                                if (sortBy === 'customer') return a.customer.localeCompare(b.customer)
                                if (sortBy === 'created') return (b.createdAt || "").localeCompare(a.createdAt || "")
                                return (a.startTime || "").localeCompare(b.startTime || "")
                            })
                            .map(note => (
                                <div key={note.id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
                                    <div className="flex flex-col flex-1">
                                        {/* Header: Compact */}
                                        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 mb-3 pb-3 border-b border-zinc-100">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-pink-100 text-pink-800 px-2 py-0.5 text-xs font-bold uppercase border border-pink-200">
                                                    {note.customer}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400">
                                                    <span className="hidden sm:inline">|</span>
                                                    <span>{formatDate(note.startDate)} — {formatDate(note.endDate)}</span>
                                                    <span className="hidden sm:inline text-zinc-300">/</span>
                                                    <span className="text-zinc-500">{note.startTime} — {note.endTime}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400">
                                                    by {note.author}
                                                </span>
                                                {note.lastSentTime && (
                                                    <div className="border-l border-zinc-300 pl-2">
                                                        <TimeSince date={note.lastSentTime} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Body: Grid for Desktop */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                                            {/* Left: Ad Text (Taking 2 cols) */}
                                            <div className="lg:col-span-2">
                                                <div className="bg-zinc-50 p-3 sm:p-4 border border-zinc-200 rounded-sm h-full">
                                                    <p className="font-serif text-sm sm:text-base text-zinc-900 leading-relaxed whitespace-pre-wrap">{note.adText}</p>
                                                </div>
                                            </div>

                                            {/* Right: Stats & History (Taking 1 col) */}
                                            <div className="flex flex-col gap-3">
                                                <div className="bg-zinc-100 p-2 rounded-sm border border-zinc-200">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="text-[10px] uppercase font-bold text-zinc-500">Сегодня / Лимит</div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={`text-xl font-black ${getSentToday(note.history || []) >= note.quantity ? 'text-green-600' : 'text-black'}`}>
                                                                {getSentToday(note.history || [])}
                                                            </span>
                                                            <span className="text-xs font-bold text-zinc-400">/</span>
                                                            <span className="text-xs font-bold text-zinc-400">{note.quantity}</span>

                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-zinc-400 text-right">
                                                        Всего отправлено: {note.sentCount || 0} / {getTotalCampaignLimit(note.quantity, note.startDate, note.endDate)}
                                                    </div>
                                                </div>

                                                {note.history && note.history.length > 0 && (
                                                    <div className="flex-1 flex flex-col min-h-[0px]">
                                                        <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5">История</div>
                                                        <div className="flex flex-col gap-1.5 max-h-[150px] lg:max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                                            {note.history.map((h, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`border px-2 py-1.5 flex items-center justify-between gap-2 text-xs transition-colors rounded-sm ${h.isPaid
                                                                        ? 'bg-emerald-50/50 border-emerald-200'
                                                                        : 'bg-white border-zinc-200'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.isPaid ? 'bg-emerald-400' : 'bg-zinc-300'}`}></div>
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="font-bold text-zinc-700 truncate">{h.userName}</span>
                                                                            <span className="font-mono text-zinc-400 text-[9px]"><FormatTime date={h.timestamp} /></span>
                                                                        </div>
                                                                    </div>

                                                                    {canManagePayouts ? (
                                                                        <button
                                                                            onClick={() => togglePayout(note.id, h.timestamp)}
                                                                            className={`p-1 rounded hover:bg-black/5 transition-colors flex-shrink-0 ${h.isPaid ? 'text-emerald-600' : 'text-zinc-300 hover:text-zinc-500'
                                                                                }`}
                                                                        >
                                                                            {h.isPaid ? <Check size={12} strokeWidth={3} /> : <DollarSign size={12} />}
                                                                        </button>
                                                                    ) : (
                                                                        h.isPaid && <Check size={12} className="text-emerald-600 flex-shrink-0" strokeWidth={3} />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto pt-3 border-t-2 border-zinc-100 flex items-center justify-between gap-2">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => copyToClipboard(note.adText)}
                                                className="p-2 hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors rounded-md"
                                                title="Копировать"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => startEdit(note)}
                                                className="p-2 hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors rounded-md"
                                                title="Изменить"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {/* Delete Button - Only Admin/Chief or Author */}
                                            {/* Archive Button for Author/Admin */}
                                            {(['ADMIN', 'CHIEF_EDITOR'].includes(userRole) || note.author === userName) && (
                                                <button
                                                    onClick={() => toggleArchive(note.id)}
                                                    className="p-2 hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors rounded-md"
                                                    title={note.isArchived ? "Разархивировать" : "В архив"}
                                                >
                                                    {note.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                                                </button>
                                            )}

                                            {/* Delete Button - Only Admin */}
                                            {['ADMIN', 'CHIEF_EDITOR'].includes(userRole) && (
                                                <button
                                                    onClick={() => deleteNotification(note.id)}
                                                    className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors rounded-md"
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleSendClick(note.id)}
                                            disabled={getSentToday(note.history || []) >= note.quantity}
                                            className={`flex items-center gap-2 px-4 py-2 font-bold uppercase rounded text-xs tracking-wider transition-all ${getSentToday(note.history || []) >= note.quantity
                                                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                                : 'bg-black text-white hover:bg-zinc-800 shadow-md active:translate-y-[1px]'
                                                }`}
                                        >
                                            <Send size={14} />
                                            <span>Отправить</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Archive Section */}
                {notifications.some(n => n.isArchived) && (
                    <div className="mt-8 border-t-2 border-dashed border-zinc-300 pt-8">
                        <button
                            onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                            className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest hover:text-black transition-colors w-full"
                        >
                            {isArchiveOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            Архив ({notifications.filter(n => n.isArchived).length})
                        </button>

                        {isArchiveOpen && (
                            <div className="grid gap-4 mt-6 opacity-60">
                                {notifications.filter(n => n.isArchived).map(note => (
                                    <div key={note.id} className="bg-zinc-50 border-2 border-zinc-300 p-4 flex flex-col pointer-events-none grayscale-[0.5] relative min-w-0 w-full">
                                        <div className="absolute top-2 right-2 pointer-events-auto z-10">
                                            <button
                                                onClick={() => toggleArchive(note.id)}
                                                className="p-2 hover:bg-white text-zinc-500 hover:text-black transition-colors rounded-md border border-transparent hover:border-black"
                                                title="Разархивировать"
                                            >
                                                <ArchiveRestore size={16} />
                                            </button>
                                        </div>
                                        {/* Simplified View for Archived */}
                                        <div className="flex flex-col gap-2 pr-8">
                                            <div className="flex items-center gap-2 mb-2 min-w-0">
                                                <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 text-xs font-bold uppercase shrink-0">
                                                    {note.customer}
                                                </span>
                                                <span className="text-xs text-zinc-400 flex-1 truncate min-w-0">
                                                    {note.adText}
                                                </span>
                                            </div>
                                            <div className="text-xs text-zinc-400 font-mono">
                                                Отправлено: {note.sentCount} / {getTotalCampaignLimit(note.quantity, note.startDate, note.endDate)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
