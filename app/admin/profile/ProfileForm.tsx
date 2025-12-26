"use client";

import { useTransition } from "react";
import { toast } from "sonner";

export function ProfileForm({
    action,
    children,
    submitLabel,
    submitClass
}: {
    action: (formData: FormData) => Promise<{ success: boolean; message: string }>;
    children: React.ReactNode;
    submitLabel: string;
    submitClass: string;
}) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await action(formData);

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            {children}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className={`${submitClass} disabled:opacity-50`}
                >
                    {isPending ? "Сохранение..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
