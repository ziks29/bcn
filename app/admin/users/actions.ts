"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cleanPhone } from "@/lib/utils";

// Ensure only ADMIN or CHIEF_EDITOR can perform these actions
const checkAdmin = async () => {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CHIEF_EDITOR") {
        throw new Error("Unauthorized: Admins or Chief Editors only");
    }
    return session;
};

export async function createUser(formData: FormData) {
    try {
        await checkAdmin();

        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as string;
        const phoneNumberInput = formData.get("phoneNumber") as string;
        const phoneNumber = cleanPhone(phoneNumberInput);

        if (phoneNumberInput && !phoneNumber) {
            return { success: false, message: "Номер телефона должен содержать ровно 7 цифр" };
        }

        if (!username || !password || !role) {
            return { success: false, message: "Заполните все обязательные поля" };
        }

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return { success: false, message: "Пользователь с таким именем уже существует" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                displayName: username,
                phoneNumber,
                approved: true  // Admin-created users are auto-approved
            }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Пользователь успешно создан" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка создания пользователя" };
    }
}

export async function deleteUser(userId: string) {
    try {
        const session = await checkAdmin();

        if (userId === session.user.id) {
            return { success: false, message: "Вы не можете удалить свой аккаунт" };
        }

        // Check if user has any articles
        const articleCount = await prisma.article.count({
            where: { authorId: userId }
        });

        if (articleCount > 0) {
            return {
                success: false,
                message: `Невозможно удалить пользователя. У него есть ${articleCount} статей. Сначала удалите или переназначьте их.`
            };
        }

        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/admin/users");
        return { success: true, message: "Пользователь удален" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка удаления пользователя" };
    }
}

export async function updateUserRole(formData: FormData) {
    try {
        const session = await checkAdmin();

        const userId = formData.get("userId") as string;
        const newRole = formData.get("role") as string;

        if (userId === session.user.id) {
            return { success: false, message: "Вы не можете изменить собственную роль" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Роль успешно обновлена" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка обновления роли" };
    }
}

export async function approveUser(userId: string) {
    try {
        await checkAdmin();

        await prisma.user.update({
            where: { id: userId },
            data: { approved: true }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Пользователь одобрен и может войти в систему" };
    } catch (e: any) {
        return { success: false, message: e.message || "Ошибка одобрения пользователя" };
    }
}
