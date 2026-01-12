import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotesProvider from "@/components/NotesProvider";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return <NotesProvider>{children}</NotesProvider>;
}
