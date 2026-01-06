import React from 'react'
import { Search, User } from 'lucide-react'

interface OrderFiltersProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    employeeFilter: string
    setEmployeeFilter: (value: string) => void
    allEmployees: string[]
}

export default function OrderFilters({
    searchTerm,
    setSearchTerm,
    employeeFilter,
    setEmployeeFilter,
    allEmployees
}: OrderFiltersProps) {
    return (
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
                        placeholder="Клиент, описание..."
                        className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {/* Employee Filter */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <User size={12} />
                        Сотрудник
                    </label>
                    <select
                        value={employeeFilter}
                        onChange={e => setEmployeeFilter(e.target.value)}
                        className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Все сотрудники</option>
                        {allEmployees.map(emp => (
                            <option key={emp} value={emp}>{emp}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}
