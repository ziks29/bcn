"use client"

import { approveUser } from "./actions"
import { toast } from "sonner"
import { Check } from "lucide-react"

export default function ApproveUserButton({ userId }: { userId: string }) {
    const handleApprove = async () => {
        const result = await approveUser(userId)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 flex items-center gap-1 text-sm font-bold uppercase transition-colors"
            title="Одобрить пользователя"
        >
            <Check size={16} />
            <span className="hidden sm:inline">Одобрить</span>
        </button>
    )
}
