import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContactsList from "./ContactsList";
import CreateContactForm from "./CreateContactForm";

export default async function ContactsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    // Only admins and chief editors can manage contacts
    if (session.user.role !== "ADMIN" && session.user.role !== "CHIEF_EDITOR") {
        redirect("/admin");
    }

    const contacts = await prisma.contact.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-8 font-serif-body">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <Link href="/admin" className="text-zinc-500 hover:text-black">← Назад в панель</Link>
                    <h1 className="font-headline text-4xl uppercase tracking-tighter mt-2">Управление Контактами</h1>
                    <p className="text-zinc-600 mt-2">Управление контактной информацией сотрудников, отображаемой в футере и на странице услуг</p>
                </div>

                {/* Форма создания нового контакта */}
                <CreateContactForm />

                {/* Список контактов */}
                <ContactsList contacts={contacts} />
            </div>
        </div>
    );
}
