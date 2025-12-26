"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Неверное имя пользователя или пароль");
            setLoading(false);
        } else {
            router.push(callbackUrl);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center p-4 font-serif-body">
            <div className="bg-[#f4f1ea] border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                {/* Newspaper Header Style */}
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mb-2">Вход в Система</h1>
                    <p className="text-xs font-sans uppercase tracking-widest text-zinc-600">Только для авторизованного персонала</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-900 text-red-900 px-4 py-3 mb-6 text-sm font-bold uppercase tracking-wide">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Имя пользователя</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white border-2 border-black p-2 font-mono focus:outline-none focus:bg-yellow-50 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border-2 border-black p-2 font-mono focus:outline-none focus:bg-yellow-50 transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-headline text-xl uppercase py-3 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Проверка..." : "Войти"}
                    </button>
                </form>

                <div className="mt-8 pt-4 border-t border-zinc-300 text-center">
                    <p className="text-xs text-zinc-500 italic font-serif-body">
                        "Новости никогда не спят, но редакторам иногда нужно."
                    </p>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black"></div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center">
                <div className="text-black font-headline text-2xl">Загрузка...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
