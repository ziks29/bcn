import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import FinancesClient from "./FinancesClient"
import { getBusinessData } from "@/lib/services/business.service"

export default async function FinancesPage() {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    // Use centralized service - includes user relations and proper serialization
    const data = await getBusinessData()

    return (
        <FinancesClient
            userName={session.user.name || "Сотрудник"}
            userRole={role}
            payments={data.payments}
            transactions={data.transactions}
        />
    )
}
