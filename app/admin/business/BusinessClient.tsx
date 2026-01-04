"use client"

import { useState } from "react"
import Link from "next/link"
import OrdersClient from "../orders/OrdersClient"
import FinancesClient from "../finances/FinancesClient"

type Tab = 'orders' | 'finances'

export default function BusinessClient({
    userName,
    userRole,
    employees,
    orders,
    payments,
    transactions
}: {
    userName: string
    userRole: string
    employees: Array<{ id: string, name: string }>
    orders: any[]
    payments: any[]
    transactions: any[]
}) {
    const [activeTab, setActiveTab] = useState<Tab>('orders')

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest block mb-2">
                        ← Назад в меню
                    </Link>
                    <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter mb-4">
                        Бизнес<span className="text-blue-600">.</span>
                    </h1>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-3 font-bold uppercase tracking-widest transition-colors border-2 border-black ${activeTab === 'orders'
                                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-black hover:bg-zinc-100'
                                }`}
                        >
                            Заказы
                        </button>
                        <button
                            onClick={() => setActiveTab('finances')}
                            className={`px-6 py-3 font-bold uppercase tracking-widest transition-colors border-2 border-black ${activeTab === 'finances'
                                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-black hover:bg-zinc-100'
                                }`}
                        >
                            Финансы
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'orders' ? (
                        <OrdersClient
                            userName={userName}
                            userRole={userRole}
                            initialData={orders}
                            employees={employees}
                        />
                    ) : (
                        <FinancesClient
                            userName={userName}
                            userRole={userRole}
                            payments={payments}
                            transactions={transactions}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
