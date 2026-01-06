export interface Payment {
    id: string
    amount: number
    paymentDate: string
    paymentMethod: string
    receivedBy: string
    receiptNumber?: string | null
    notes?: string | null
}

export interface EmployeePayment {
    id: string
    amount: number
    paymentDate: string
    paymentMethod: string
    processedBy: string
    recipient?: string | null
    notes?: string | null
}

export interface Order {
    id: string
    client: string      // Phone number xxx-xxxx
    clientName: string  // Client name
    description: string
    service: string
    startDate?: string | null
    endDate?: string | null
    employee: string
    totalPrice: number
    employeePaidAmount?: number
    notes?: string | null
    createdBy: string
    createdAt: string
    isPaid: boolean
    payments: Payment[]
    employeePayments: EmployeePayment[]
}

export type SortKey = 'client' | 'startDate' | 'totalPrice' | 'employee'
export type SortDirection = 'asc' | 'desc'

export const SERVICE_OPTIONS = [
    'Рассылки',
    'Реклама',
    'Консультация',
    'Дизайн',
    'Контент',
    'Другое'
]

// Phone number formatting helper
export function formatPhoneNumber(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Limit to 7 digits
    const limited = digits.substring(0, 7)
    // Format as xxx-xxxx
    if (limited.length > 3) {
        return `${limited.substring(0, 3)}-${limited.substring(3)}`
    }
    return limited
}

export function formatDate(dateStr?: string | null) {
    if (!dateStr) return "-"
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year.slice(2)}`
}
