import React from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Order } from '../../types'
import { updateOrder } from '@/app/actions/orders'
import { toast } from 'sonner'

interface ExpandedOrderDetailsProps {
    order: Order
    isAdmin: boolean
    onToggleIsPaid: (orderId: string, newValue: boolean) => Promise<void>
    onAddEmployeePayment: (orderId: string) => void
    onDeleteEmployeePayment: (paymentId: string) => void
}

export default function ExpandedOrderDetails({
    order,
    isAdmin,
    onToggleIsPaid,
    onAddEmployeePayment,
    onDeleteEmployeePayment
}: ExpandedOrderDetailsProps) {
    return (
        <tr className="bg-zinc-100 border-t border-zinc-300">
            <td colSpan={7} className="p-4">
                {/* Order Comment */}
                {order.notes && (
                    <div className="mb-4">
                        <h5 className="font-bold text-sm uppercase tracking-wider mb-2">Комментарий</h5>
                        <div className="bg-white border border-zinc-300 p-3">
                            <p className="text-sm text-zinc-700">{order.notes}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider">Оплата (Клиент)</h4>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold uppercase ${order.isPaid ? 'text-emerald-600' : 'text-zinc-400'}`}>
                            {order.isPaid ? 'Счет оплачен' : 'Не оплачен'}
                        </span>
                        <button
                            onClick={() => onToggleIsPaid(order.id, !order.isPaid)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${order.isPaid ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                        >
                            <span
                                className={`${order.isPaid ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>
                </div>

                {/* Employee Payments Section */}
                <div className="mb-4 flex justify-between items-center bg-blue-50/50 pb-4 border-b border-blue-100">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-blue-800">Выплаты сотруднику</h4>
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-zinc-500 font-medium">
                            <span title="85% (Выплата)">{(order.totalPrice * 0.85).toFixed(1)}</span>
                            <span className="mx-1 text-zinc-300">/</span>
                            <span title="15% (Компании)">{(order.totalPrice * 0.15).toFixed(1)}</span>
                        </div>
                        {(order.employeePaidAmount || 0) < order.totalPrice * 0.85 && (
                            <button
                                onClick={() => onAddEmployeePayment(order.id)}
                                className="bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} />
                                Выплатить
                            </button>
                        )}
                    </div>
                </div>

                {(!order.employeePayments || order.employeePayments.length === 0) ? (
                    <p className="text-sm text-zinc-500 italic">Выплат пока нет</p>
                ) : (
                    <div className="grid gap-2">
                        {order.employeePayments.map(payment => (
                            <div key={payment.id} className="bg-white border border-blue-200 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="font-headline text-lg font-bold text-blue-700">
                                        ${payment.amount.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        <div className="font-mono">{new Date(payment.paymentDate).toLocaleDateString('ru-RU')}</div>
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        Выплатил: {payment.processedBy}
                                        {payment.recipient && (
                                            <> • <span className="text-zinc-500">Получил: {payment.recipient}</span></>
                                        )}
                                    </div>
                                    {payment.notes && (
                                        <div className="text-xs text-zinc-400 italic max-w-xs truncate">
                                            {payment.notes}
                                        </div>
                                    )}
                                </div>
                                {isAdmin && !payment.id.startsWith('temp-') && (
                                    <button
                                        onClick={() => onDeleteEmployeePayment(payment.id)}
                                        className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                        title="Удалить выплату"
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
    )
}
