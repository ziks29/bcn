"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { cleanPhone } from "@/lib/utils";

export async function createContact(formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "CHIEF_EDITOR")) {
        return { success: false, message: "Нет доступа" };
    }

    const name = formData.get("name") as string;
    const phoneInput = formData.get("phone") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    const phone = cleanPhone(phoneInput) || phoneInput; // Fallback to raw if undefined/empty, though cleanPhone handles it

    try {
        await prisma.contact.create({
            data: { name, phone, order }
        });

        revalidatePath("/admin/contacts");
        revalidatePath("/services");
        revalidatePath("/");

        return { success: true, message: "Контакт успешно создан" };
    } catch (error) {
        return { success: false, message: "Не удалось создать контакт" };
    }
}

export async function updateContact(id: string, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "CHIEF_EDITOR")) {
        return { success: false, message: "Нет доступа" };
    }

    const name = formData.get("name") as string;
    const phoneInput = formData.get("phone") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    const phone = cleanPhone(phoneInput) || phoneInput;

    try {
        await prisma.contact.update({
            where: { id },
            data: { name, phone, order }
        });

        revalidatePath("/admin/contacts");
        revalidatePath("/services");
        revalidatePath("/");

        return { success: true, message: "Контакт успешно обновлён" };
    } catch (error) {
        return { success: false, message: "Не удалось обновить контакт" };
    }
}

export async function deleteContact(id: string) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "CHIEF_EDITOR")) {
        return { success: false, message: "Нет доступа" };
    }

    try {
        await prisma.contact.delete({
            where: { id }
        });

        revalidatePath("/admin/contacts");
        revalidatePath("/services");
        revalidatePath("/");

        return { success: true, message: "Контакт успешно удалён" };
    } catch (error) {
        return { success: false, message: "Не удалось удалить контакт" };
    }
}
