"use client";

import { useState, useTransition } from "react";
import { createContact } from "./actions";
import { toast } from "sonner";

export default function CreateContactForm() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createContact(formData);
            if (result.success) {
                toast.success(result.message);
                // Reset form
                (document.getElementById("contact-form") as HTMLFormElement)?.reset();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            <h2 className="font-headline text-2xl uppercase mb-4">Добавить Новый Контакт</h2>
            <form id="contact-form" action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Имя</label>
                        <input
                            name="name"
                            required
                            disabled={isPending}
                            className="w-full border-2 border-black p-2 disabled:opacity-50"
                            placeholder="Иван Иванов"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Телефон</label>
                        <input
                            name="phone"
                            required
                            disabled={isPending}
                            className="w-full border-2 border-black p-2 disabled:opacity-50"
                            placeholder="555-0123"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Порядок</label>
                        <input
                            name="order"
                            type="number"
                            defaultValue={0}
                            disabled={isPending}
                            className="w-full border-2 border-black p-2 disabled:opacity-50"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#4b3634] text-white px-6 py-2 font-bold uppercase hover:bg-zinc-900 transition-colors disabled:opacity-50"
                >
                    {isPending ? "Добавление..." : "Добавить Контакт"}
                </button>
            </form>
        </div>
    );
}
