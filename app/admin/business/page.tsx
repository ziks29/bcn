import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import BusinessClient from "./BusinessClient"
import { getBusinessData } from "@/lib/services/business.service"

export default async function BusinessPage() {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    // Use centralized service instead of manual queries
    const data = await getBusinessData()

    return (
        <BusinessClient
            userName={session.user.name || "Сотрудник"}
            userRole={role}
            employees={data.employees}
            orders={data.orders}
            payments={data.payments}
            transactions={data.transactions}
        />
    )
}
