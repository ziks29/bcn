import React from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { Order, formatDate } from '../../types'

interface OrderTableRowProps {
    order: Order
    index: number
    isExpanded: boolean
    isHighlighted: boolean
    isAdmin: boolean
    userName: string
    onToggleExpand: (orderId: string) => void
    onEdit: (order: Order) => void
    onDelete: (orderId: string) => void
    getEmployeePaymentStatus: (order: Order) => string
}

export default function OrderTableRow({
    order,
    index,
    isExpanded,
    isHighlighted,
    isAdmin,
    userName,
    onToggleExpand,
    onEdit,
    onDelete,
    getEmployeePaymentStatus
}: OrderTableRowProps) {
    // Check if current user can edit this order
    const canEdit = isAdmin || order.createdBy === userName

    return (
        <tr
            id={`order-${order.id}`}
            className={`border-t-2 border-zinc-200 hover:bg-zinc-50 transition-colors ${isHighlighted ? 'bg-purple-100 ring-2 ring-purple-400' :
                index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'
                }`}
        >
            <td className="p-3 text-sm">
                <div className="font-mono text-xs text-zinc-500">
                    {order.startDate ? formatDate(order.startDate) : new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </div>
                <div className="font-mono text-xs text-zinc-400">
                    {order.endDate ? formatDate(order.endDate) : new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </div>
            </td>
            <td className="p-3">
                <div className="font-bold text-sm">{order.clientName || order.client}</div>
                <div className="text-xs text-zinc-500">{order.client}</div>
            </td>
            <td className="p-3 text-sm">{order.service}</td>
            <td className="p-3 text-sm text-zinc-700 hidden md:table-cell max-w-xs truncate">
                {order.description}
            </td>
            <td className="p-3 text-sm font-medium">{order.employee}</td>
            <td className="p-3 text-right">
                <div className="font-headline text-lg font-bold">
                    ${order.totalPrice.toFixed(1)}
                </div>
                <div className="text-xs text-zinc-500">
                    {getEmployeePaymentStatus(order)}
                </div>
            </td>
            <td className="p-3">
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onToggleExpand(order.id)}
                        className="p-2 hover:bg-zinc-200 rounded transition-colors"
                        title="Развернуть"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => onEdit(order)}
                            className="p-2 hover:bg-zinc-200 rounded transition-colors"
                            title="Редактировать"
                        >
                            <Pencil size={16} />
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={() => onDelete(order.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                            title="Удалить"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    )
}
