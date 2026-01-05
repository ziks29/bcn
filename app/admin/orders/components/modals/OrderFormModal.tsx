import React from 'react'
import { Order, SERVICE_OPTIONS, formatPhoneNumber } from '../../types'

interface OrderFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    currentOrder: Partial<Order>
    setCurrentOrder: (order: Partial<Order>) => void
    employees: Array<{ id: string, name: string }>
}

export default function OrderFormModal({
    isOpen,
    onClose,
    onSubmit,
    currentOrder,
    setCurrentOrder,
    employees
}: OrderFormModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white p-6 md:p-8 max-w-2xl w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8">
                <h2 className="font-headline text-2xl mb-4 font-bold uppercase">
                    {currentOrder.id ? "Редактировать заказ" : "Новый заказ"}
                </h2>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Имя клиента / Бизнеса</label>
                            <input
                                type="text"
                                value={currentOrder.clientName || ""}
                                onChange={e => setCurrentOrder({ ...currentOrder, clientName: e.target.value })}
                                className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tomas Jackson"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Телефон</label>
                            <input
                                type="text"
                                value={currentOrder.client || ""}
                                onChange={e => setCurrentOrder({ ...currentOrder, client: formatPhoneNumber(e.target.value) })}
                                className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="123-4567"
                                maxLength={8}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Услуга</label>
                            <input
                                list="service-options"
                                value={currentOrder.service || ""}
                                onChange={e => setCurrentOrder({ ...currentOrder, service: e.target.value })}
                                className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Выберите или введите услугу"
                                required
                            />
                            <datalist id="service-options">
                                {SERVICE_OPTIONS.map(service => (
                                    <option key={service} value={service} />
                                ))}
                            </datalist>
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
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Дата начала (опционально)</label>
                            <input
                                type="date"
                                value={currentOrder.startDate || ""}
                                onChange={e => setCurrentOrder({ ...currentOrder, startDate: e.target.value })}
                                className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Дата окончания (опционально)</label>
                            <input
                                type="date"
                                value={currentOrder.endDate || ""}
                                onChange={e => setCurrentOrder({ ...currentOrder, endDate: e.target.value })}
                                className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Общая стоимость ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={currentOrder.totalPrice ?? ""}
                            onChange={e => setCurrentOrder({ ...currentOrder, totalPrice: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Комментарий</label>
                        <textarea
                            value={currentOrder.notes || ""}
                            onChange={e => setCurrentOrder({ ...currentOrder, notes: e.target.value })}
                            className="w-full border-2 border-black p-2 font-serif min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
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
    )
}
