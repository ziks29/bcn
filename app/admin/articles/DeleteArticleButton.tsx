"use client";

import { deleteArticle } from "../actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteArticleButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Вы уверены?")) return;

        startTransition(async () => {
            const result = await deleteArticle(id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Удалить"
        >
            <Trash2 size={18} />
        </button>
    );
}
