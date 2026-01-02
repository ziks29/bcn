"use client";

import { useState } from "react";
import { updateContact, deleteContact } from "./actions";
import { toast } from "sonner";
import { Trash2, Edit, Save, X } from "lucide-react";
import { formatPhone, formatPhoneInput } from "@/lib/utils";

interface Contact {
    id: string;
    name: string;
    phone: string;
    order: number;
}

export default function ContactsList({ contacts }: { contacts: Contact[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ name: "", phone: "", order: 0 });

    const handleEdit = (contact: Contact) => {
        setEditingId(contact.id);
        setEditData({ name: contact.name, phone: contact.phone, order: contact.order });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ name: "", phone: "", order: 0 });
    };

    const handleSave = async (id: string) => {
        const formData = new FormData();
        formData.set("name", editData.name);
        formData.set("phone", editData.phone);
        formData.set("order", editData.order.toString());

        const result = await updateContact(id, formData);
        if (result.success) {
            toast.success(result.message);
            setEditingId(null);
        } else {
            toast.error(result.message);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Вы уверены, что хотите удалить ${name}?`)) return;

        const result = await deleteContact(id);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-2 border-black p-4 bg-zinc-50">
                <h2 className="font-headline text-2xl uppercase">Текущие Контакты</h2>
            </div>
            <div className="divide-y-2 divide-zinc-200">
                {contacts.map(contact => (
                    <div key={contact.id} className="p-4 hover:bg-zinc-50 transition-colors">
                        {editingId === contact.id ? (
                            // Edit Mode
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Имя</label>
                                    <input
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full border-2 border-black p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Телефон</label>
                                    <input
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: formatPhoneInput(e.target.value) })}
                                        className="w-full border-2 border-black p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Порядок</label>
                                    <input
                                        type="number"
                                        value={editData.order}
                                        onChange={(e) => setEditData({ ...editData, order: parseInt(e.target.value) })}
                                        className="w-full border-2 border-black p-2"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSave(contact.id)}
                                        className="p-2 bg-green-600 text-white hover:bg-green-700"
                                        title="Сохранить"
                                    >
                                        <Save size={20} />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-2 bg-zinc-400 text-white hover:bg-zinc-500"
                                        title="Отмена"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-500">Имя</p>
                                        <p className="font-bold">{contact.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-500">Телефон</p>
                                        <p>{formatPhone(contact.phone)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-500">Порядок</p>
                                        <p>{contact.order}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(contact)}
                                        className="p-2 hover:bg-zinc-200 transition-colors"
                                        title="Редактировать"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contact.id, contact.name)}
                                        className="p-2 hover:bg-red-100 text-red-600 transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {contacts.length === 0 && (
                    <div className="p-8 text-center text-zinc-400 italic">
                        Контактов пока нет. Добавьте первый контакт выше.
                    </div>
                )}
            </div>
        </div>
    );
}
