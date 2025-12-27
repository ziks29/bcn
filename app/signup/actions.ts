"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function signup(formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const displayName = formData.get("displayName") as string

    // Validate
    if (!username || !password || !displayName) {
        return { success: false, message: "Все поля обязательны" }
    }

    if (username.length < 3) {
        return { success: false, message: "Имя пользователя должно быть не менее 3 символов" }
    }

    if (password.length < 6) {
        return { success: false, message: "Пароль должен быть не менее 6 символов" }
    }

    // Check if username exists
    const existing = await prisma.user.findUnique({
        where: { username }
    })

    if (existing) {
        return { success: false, message: "Имя пользователя уже занято" }
    }

    try {
        // Create pending user
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                displayName,
                role: "AUTHOR",
                approved: false
            }
        })

        return {
            success: true,
            message: "Заявка отправлена! Ожидайте одобрения администратора."
        }
    } catch (error) {
        console.error("Signup error:", error)
        return { success: false, message: "Ошибка при создании аккаунта" }
    }
}
