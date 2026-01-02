"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signup } from "../signup/actions";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        if (mode === "login") {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                if (res.error === "CredentialsSignin") {
                    setError("Неверное имя пользователя или пароль");
                } else {
                    setError("Ваш аккаунт еще не одобрен администратором");
                }
                setLoading(false);
            } else {
                router.push(callbackUrl);
            }
        } else {
            // Signup mode
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);
            formData.append("displayName", displayName);
            formData.append("phoneNumber", phoneNumber);

            const result = await signup(formData);

            if (result.success) {
                setSuccessMessage(result.message);
                setUsername("");
                setPassword("");
                setDisplayName("");
                setPhoneNumber("");
                setMode("login");
            } else {
                setError(result.message);
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center p-4 font-serif-body">
            <div className="bg-[#f4f1ea] border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                {/* Newspaper Header Style */}
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mb-2">
                        {mode === "login" ? "Вход в Систему" : "Регистрация"}
                    </h1>
                    <p className="text-xs font-sans uppercase tracking-widest text-zinc-600">
                        {mode === "login" ? "Только для авторизованного персонала" : "Создание новой учетной записи"}
                    </p>
                </div>

                {successMessage && (
                    <div className="bg-green-100 border border-green-900 text-green-900 px-4 py-3 mb-6 text-sm font-bold uppercase tracking-wide">
                        ✓ {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-900 text-red-900 px-4 py-3 mb-6 text-sm font-bold uppercase tracking-wide">
                        ⚠ {error}
                    </div>
                )}

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => { setMode("login"); setError(""); setSuccessMessage(""); }}
                        className={`flex-1 py-2 text-sm font-bold uppercase transition-colors ${mode === "login" ? "bg-black text-white" : "bg-white text-black border-2 border-black hover:bg-zinc-100"
                            }`}
                    >
                        Вход
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode("signup"); setError(""); setSuccessMessage(""); }}
                        className={`flex-1 py-2 text-sm font-bold uppercase transition-colors ${mode === "signup" ? "bg-black text-white" : "bg-white text-black border-2 border-black hover:bg-zinc-100"
                            }`}
                    >
                        Регистрация
                    </button>
                </div>

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
                            minLength={mode === "signup" ? 6 : undefined}
                        />
                    </div>

                    {mode === "signup" && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Отображаемое имя</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-white border-2 border-black p-2 font-mono focus:outline-none focus:bg-yellow-50 transition-colors"
                                required
                                placeholder="Как вас называть"
                            />
                        </div>
                    )}

                    {mode === "signup" && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Номер телефона</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-white border-2 border-black p-2 font-mono focus:outline-none focus:bg-yellow-50 transition-colors"
                                placeholder="555-5555"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-headline text-xl uppercase py-3 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (mode === "login" ? "Проверка..." : "Создание...") : (mode === "login" ? "Войти" : "Зарегистрироваться")}
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
