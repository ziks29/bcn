"use client";

import { useState } from "react";
import { resetUserPassword } from "./actions";
import { toast } from "sonner";
import { KeyRound, X, Check } from "lucide-react";

export default function ResetPasswordButton({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Пароль должен быть не менее 6 символов");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("newPassword", newPassword);

        const result = await resetUserPassword(formData);
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            setNewPassword("");
            setIsOpen(false);
        } else {
            toast.error(result.message);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-zinc-100 hover:bg-black hover:text-white border-2 border-black p-2 transition-all flex items-center gap-1 text-xs font-bold uppercase"
                title="Сбросить пароль"
            >
                <KeyRound size={16} />
                Пароль
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <form 
                onSubmit={handleReset}
                className="bg-[#f4f1ea] border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 relative"
            >
                <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute -top-4 -right-4 bg-white border-2 border-black p-1 hover:bg-red-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="font-headline text-xl uppercase border-b-2 border-black pb-2">Новый пароль</h3>
                <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full bg-white border-2 border-black p-2 font-mono focus:outline-none focus:bg-yellow-50"
                    autoFocus
                    required
                />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-black text-white font-headline py-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase"
                    >
                        {loading ? "..." : <><Check size={18} /> Сохранить</>}
                    </button>
                    <button
                         type="button"
                         onClick={() => setIsOpen(false)}
                         className="px-4 bg-white border-2 border-black hover:bg-zinc-100 font-headline uppercase"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}
