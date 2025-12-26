"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileInfo(formData: FormData) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return { success: false, message: "Не авторизован" };
        }

        const username = formData.get("username") as string;
        const displayName = formData.get("displayName") as string;
        const bio = formData.get("bio") as string;

        if (!username || username.length < 3) {
            return { success: false, message: "Имя пользователя должно быть не менее 3 символов" };
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true }
        });

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing && existing.id !== session.user.id) {
            return { success: false, message: "Имя пользователя уже занято" };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username,
                displayName: displayName || null,
                bio: bio || null
            },
        });

        if (currentUser?.username !== username) {
            await signOut({ redirectTo: "/login?message=Username updated. Please log in again." });
        } else {
            revalidatePath("/admin");
            revalidatePath("/");
        }

        return { success: true, message: "Профиль обновлен" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка обновления профиля" };
    }
}

export async function updatePassword(formData: FormData) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return { success: false, message: "Не авторизован" };
        }

        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
            return { success: false, message: "Новые пароли не совпадают" };
        }

        if (newPassword.length < 6) {
            return { success: false, message: "Пароль должен быть не менее 6 символов" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return { success: false, message: "Пользователь не найден" };
        }

        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordsMatch) {
            return { success: false, message: "Неверный текущий пароль" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        await signOut({ redirectTo: "/login?message=Password updated. Please log in again." });
        return { success: true, message: "Пароль обновлен" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка обновления пароля" };
    }
}
