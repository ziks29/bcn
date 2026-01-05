import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Order, SortKey, SortDirection } from '../../types'
import OrderTableRow from './OrderTableRow'
import ExpandedOrderDetails from './ExpandedOrderDetails'

interface OrdersTableProps {
    orders: Order[]
    sortKey: SortKey
    sortDirection: SortDirection
    onSort: (key: SortKey) => void
    expandedRows: Set<string>
    onToggleExpand: (orderId: string) => void
    highlightedOrderId: string | null
    isAdmin: boolean
    userName: string
    onEdit: (order: Order) => void
    onDelete: (orderId: string) => void
    onToggleIsPaid: (orderId: string, newValue: boolean) => Promise<void>
    onAddEmployeePayment: (orderId: string) => void
    onDeleteEmployeePayment: (paymentId: string) => void
    getEmployeePaymentStatus: (order: Order) => string
}

export default function OrdersTable({
    orders,
    sortKey,
    sortDirection,
    onSort,
    expandedRows,
    onToggleExpand,
    highlightedOrderId,
    isAdmin,
    userName,
    onEdit,
    onDelete,
    onToggleIsPaid,
    onAddEmployeePayment,
    onDeleteEmployeePayment,
    getEmployeePaymentStatus
}: OrdersTableProps) {
    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) return null
        return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    }

    return (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                <button
                                    onClick={() => onSort('startDate')}
                                    className="flex items-center gap-1 hover:text-blue-300"
                                >
                                    ДАТА {getSortIcon('startDate')}
                                </button>
                            </th>
                            <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                <button
                                    onClick={() => onSort('client')}
                                    className="flex items-center gap-1 hover:text-blue-300"
                                >
                                    КЛИЕНТ {getSortIcon('client')}
                                </button>
                            </th>
                            <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">УСЛУГА</th>
                            <th className="text-left p-3 text-xs font-bold uppercase tracking-widest hidden md:table-cell">
                                ОПИСАНИЕ
                            </th>
                            <th className="text-left p-3 text-xs font-bold uppercase tracking-widest">
                                <button
                                    onClick={() => onSort('employee')}
                                    className="flex items-center gap-1 hover:text-blue-300"
                                >
                                    СОТРУДНИК {getSortIcon('employee')}
                                </button>
                            </th>
                            <th className="text-right p-3 text-xs font-bold uppercase tracking-widest">
                                <button
                                    onClick={() => onSort('totalPrice')}
                                    className="flex items-center gap-1 ml-auto hover:text-blue-300"
                                >
                                    СУММА {getSortIcon('totalPrice')}
                                </button>
                            </th>
                            <th className="text-center p-3 text-xs font-bold uppercase tracking-widest">
                                ДЕЙСТВИЯ
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-zinc-500 italic">
                                    Нет заказов
                                </td>
                            </tr>
                        ) : (
                            orders.map((order, index) => {
                                const isExpanded = expandedRows.has(order.id)

                                return (
                                    <React.Fragment key={order.id}>
                                        <OrderTableRow
                                            order={order}
                                            index={index}
                                            isExpanded={isExpanded}
                                            isHighlighted={highlightedOrderId === order.id}
                                            isAdmin={isAdmin}
                                            userName={userName}
                                            onToggleExpand={onToggleExpand}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            getEmployeePaymentStatus={getEmployeePaymentStatus}
                                        />
                                        {isExpanded && (
                                            <ExpandedOrderDetails
                                                order={order}
                                                isAdmin={isAdmin}
                                                onToggleIsPaid={onToggleIsPaid}
                                                onAddEmployeePayment={onAddEmployeePayment}
                                                onDeleteEmployeePayment={onDeleteEmployeePayment}
                                            />
                                        )}
                                    </React.Fragment>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
