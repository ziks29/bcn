import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updatePassword, updateProfileInfo } from "./actions";
import { ProfileForm } from "./ProfileForm";
import { formatPhone } from "@/lib/utils";
import PhoneInput from "@/app/components/PhoneInput";

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Need to fetch user to get current display name since session might just have the effective result
    // Actually session logic we wrote: name = displayName || username.
    // So session.user.name is the display name (or username if not set).
    // BUT for the form we want to edit them separately. 
    // Ideally we should pass the raw user object here or update logic.
    // Let's assume for now we can't easily get raw username from session if name is overridden.
    // So let's fetch user.
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin" className="text-zinc-500 hover:text-black">← Назад в панель</Link>
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">
                        Настройки Профиля
                    </h1>
                </div>

                <div className="space-y-8">
                    {/* Profile Info Update Form */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="font-headline text-2xl uppercase mb-4 text-zinc-800">Основные Данные</h2>
                        <div className="bg-zinc-100 p-4 mb-4 text-sm border-l-4 border-zinc-500">
                            <p className="font-bold">Как это работает:</p>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li><strong>Имя пользователя:</strong> Используется для входа. Уникальное.</li>
                                <li><strong>Отображаемое имя:</strong> Подпись под вашими статьями ("Редактор", "Вася Пупкин"). Если не указано, используется имя пользователя.</li>
                            </ul>
                        </div>
                        <ProfileForm
                            action={updateProfileInfo}
                            submitLabel="Сохранить Данные"
                            submitClass="bg-black text-white px-4 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors"
                        >
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Имя пользователя (Логин)</label>
                                <input
                                    name="username"
                                    defaultValue={user?.username || ""}
                                    required
                                    minLength={3}
                                    className="w-full border-2 border-black p-2 font-bold bg-yellow-50"
                                />
                                <p className="text-xs text-red-600 mt-1">* Смена логина потребует повторного входа.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Отображаемое имя (Публичное)</label>
                                <input
                                    name="displayName"
                                    defaultValue={user?.displayName || ""}
                                    placeholder={user?.username}
                                    className="w-full border-2 border-black p-2 mb-4"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Номер телефона</label>
                                <PhoneInput
                                    name="phoneNumber"
                                    defaultValue={formatPhone(user?.phoneNumber) || ""}
                                    placeholder="555-5555"
                                    className="w-full border-2 border-black p-2 mb-4"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Био (Об авторе)</label>
                                <textarea
                                    name="bio"
                                    defaultValue={user?.bio || ""}
                                    rows={4}
                                    className="w-full border-2 border-black p-2"
                                    placeholder="Расскажите о себе (отображается под статьями)..."
                                />
                            </div>
                        </ProfileForm>
                    </div>

                    {/* Password Update Form */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="font-headline text-2xl uppercase mb-4 text-zinc-800">Изменить Пароль</h2>
                        <ProfileForm
                            action={updatePassword}
                            submitLabel="Обновить Пароль"
                            submitClass="bg-red-700 text-white px-4 py-2 font-bold uppercase hover:bg-red-800 transition-colors"
                        >
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Текущий пароль</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    className="w-full border-2 border-black p-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Новый пароль</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        required
                                        minLength={6}
                                        className="w-full border-2 border-black p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-1">Подтвердите пароль</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        minLength={6}
                                        className="w-full border-2 border-black p-2"
                                    />
                                </div>
                            </div>
                        </ProfileForm>
                    </div>
                </div>
            </div>
        </div>
    );
}
