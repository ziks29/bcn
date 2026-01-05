import React from 'react'
import { Order } from '../../types'

interface EmployeePaymentFormData {
    amount: string
    paymentDate: string
    paymentMethod: string
    notes: string
    employee: string
}

interface EmployeePaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    form: EmployeePaymentFormData
    setForm: (form: EmployeePaymentFormData) => void
    order: Order | null
    onAutoPayout: (order: Order, amount: number) => void
    employees: Array<{ id: string, name: string }>
}

export default function EmployeePaymentModal({
    isOpen,
    onClose,
    onSubmit,
    form,
    setForm,
    order,
    onAutoPayout,
    employees
}: EmployeePaymentModalProps) {
    if (!isOpen || !order) return null

    const handleAutoPayoutClick = () => {
        const maxPayout = order.totalPrice * 0.85
        const paid = order.employeePaidAmount || 0
        const remaining = Math.max(0, maxPayout - paid)
        onAutoPayout(order, remaining)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 max-w-lg w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-headline text-xl font-bold mb-4 uppercase">Выплатить сотруднику</h3>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">
                            Сумма выплаты
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">
                            Сотрудник
                        </label>
                        <select
                            value={form.employee}
                            onChange={e => setForm({ ...form, employee: e.target.value })}
                            className="w-full border-2 border-black p-2 font-serif focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Выберите сотрудника</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                onClose()
                                setForm({
                                    amount: '',
                                    paymentDate: new Date().toISOString().split('T')[0],
                                    paymentMethod: '',
                                    notes: '',
                                    employee: ''
                                })
                            }}
                            className="px-4 py-2 font-bold uppercase hover:bg-zinc-100 transition-colors text-sm"
                        >
                            Отмена
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 font-bold uppercase hover:bg-blue-700 transition-colors text-sm"
                            >
                                Выплатить
                            </button>
                            <button
                                type="button"
                                onClick={handleAutoPayoutClick}
                                className="bg-emerald-600 text-white px-4 py-2 font-bold uppercase hover:bg-emerald-700 transition-colors text-sm"
                            >
                                Выплатить всё
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
