import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import OrdersClient from "./OrdersClient"
import { getBusinessData } from "@/lib/services/business.service"

export default async function OrdersPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const role = (session.user as any)?.role || "USER"

    // Use centralized service - includes user relations and proper serialization
    const data = await getBusinessData()

    return (
        <OrdersClient
            userName={session.user.name || "Сотрудник"}
            userRole={role}
            initialData={data.orders}
            employees={data.employees}
        />
    )
}
