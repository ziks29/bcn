"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ArticleForm({
    action,
    children,
    submitLabel = "Опубликовать"
}: {
    action: (formData: FormData) => Promise<{ success: boolean; message: string; redirect?: string }>;
    children: React.ReactNode;
    submitLabel?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await action(formData);

            if (result.success) {
                toast.success(result.message);
                if (result.redirect) {
                    router.push(result.redirect);
                }
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {children}

                <div className="mt-8 pt-6 border-t border-zinc-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-red-700 text-white px-6 py-3 font-headline text-xl uppercase hover:bg-red-800 transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Сохранение..." : submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}
