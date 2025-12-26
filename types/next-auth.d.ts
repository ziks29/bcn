import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        role: string
        id: string
        displayName?: string | null
    }

    interface Session {
        user: User & {
            role: string
            id: string
        }
    }
}
