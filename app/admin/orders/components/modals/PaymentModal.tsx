import React from 'react'

interface PaymentFormData {
    amount: string
    paymentDate: string
    paymentMethod: string
    receiptNumber: string
    notes: string
}

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    paymentForm: PaymentFormData
    setPaymentForm: (form: PaymentFormData) => void
}

export default function PaymentModal({
    isOpen,
    onClose,
    onSubmit,
    paymentForm,
    setPaymentForm
}: PaymentModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 max-w-lg w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-headline text-xl font-bold mb-4 uppercase">Добавить платёж</h3>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                            onClick={onClose}
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
    )
}
