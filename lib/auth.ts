import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signInSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = signInSchema.safeParse(credentials)

                if (!parsedCredentials.success) {
                    return null
                }

                const { username, password } = parsedCredentials.data

                const user = await prisma.user.findUnique({
                    where: { username },
                })

                if (!user) {
                    return null
                }

                const passwordsMatch = await bcrypt.compare(password, user.password)

                if (!passwordsMatch) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.displayName || user.username,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token) {
                (session.user as any).role = token.role as string;
                (session.user as any).id = token.id as string;
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
})
