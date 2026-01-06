"use client";

import { createUser } from "./actions";
import { toast } from "sonner";
import { useRef } from "react";
import PhoneInput from "@/app/components/PhoneInput";

export default function CreateUserForm() {
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        const result = await createUser(formData);
        if (result.success) {
            toast.success(result.message);
            formRef.current?.reset();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Имя пользователя (Логин)</label>
                <input name="username" required className="w-full border-2 border-black p-2 font-bold" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Отображаемое имя (Полное имя)</label>
                <input name="displayName" className="w-full border-2 border-black p-2" placeholder="Например: Tomas Jackson" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Пароль</label>
                <input name="password" type="password" required className="w-full border-2 border-black p-2" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Номер телефона</label>
                <PhoneInput name="phoneNumber" placeholder="555-5555" className="w-full border-2 border-black p-2" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Роль</label>
                <select name="role" className="w-full border-2 border-black p-2 font-bold bg-white" defaultValue="AUTHOR">
                    <option value="ADMIN">Администратор (Полный доступ)</option>
                    <option value="CHIEF_EDITOR">Главный Редактор (Статьи + Авторы)</option>
                    <option value="EDITOR">Редактор (Публикация)</option>
                    <option value="AUTHOR">Автор (Только свои статьи)</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold uppercase py-3 hover:bg-zinc-800 transition-colors">
                Создать Пользователя
            </button>
        </form>
    );
}
