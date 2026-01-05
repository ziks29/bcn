import React from 'react'

interface OrderStatsProps {
    totalOrders: number
    activeOrders: number
    totalPaid: number
    totalPending: number
}

export default function OrderStats({ totalOrders, activeOrders, totalPaid, totalPending }: OrderStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Всего заказов</div>
                <div className="font-headline text-2xl font-bold">{totalOrders}</div>
            </div>
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Активных</div>
                <div className="font-headline text-2xl font-bold text-blue-600">{activeOrders}</div>
            </div>
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Оплачено</div>
                <div className="font-headline text-2xl font-bold text-emerald-600">${totalPaid.toFixed(1)}</div>
            </div>
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">К оплате</div>
                <div className="font-headline text-2xl font-bold text-red-600">${totalPending.toFixed(1)}</div>
            </div>
        </div>
    )
}
