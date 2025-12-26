import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import UserRoleSelect from "./UserRoleSelect";
import CreateUserForm from "./CreateUserForm";
import DeleteUserButton from "./DeleteUserButton";

export default async function UsersPage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "CHIEF_EDITOR") {
        redirect("/admin");
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8 font-serif-body">
            <Link href="/admin" className="text-zinc-500 hover:text-black mb-4 inline-block">← Назад в панель</Link>
            <div>
                <h1 className="font-headline text-4xl uppercase tracking-tighter mb-8 bg-black text-white p-4 inline-block transform -rotate-1">
                    Управление Сотрудниками
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create User Form */}
                <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
                    <h2 className="font-headline text-2xl uppercase mb-4 border-b-2 border-black pb-2">Добавить сотрудника</h2>
                    <CreateUserForm />
                </div>

                {/* User List */}
                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-white border-2 border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-headline text-xl uppercase">{user.username}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 text-white ${user.role === 'ADMIN' ? 'bg-red-600' :
                                        user.role === 'CHIEF_EDITOR' ? 'bg-purple-600' :
                                            user.role === 'EDITOR' ? 'bg-blue-600' : 'bg-green-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500">{user.displayName || "Без имени"}</p>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <UserRoleSelect
                                    userId={user.id}
                                    currentRole={user.role as Role}
                                    disabled={
                                        (user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1) ||
                                        (session?.user as any)?.id === user.id
                                    }
                                />

                                <DeleteUserButton
                                    userId={user.id}
                                    role={user.role as Role}
                                    currentUserRole={session?.user?.role || "AUTHOR"}
                                    adminCount={users.filter(u => u.role === 'ADMIN').length}
                                    isCurrentUser={(session?.user as any)?.id === user.id}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
