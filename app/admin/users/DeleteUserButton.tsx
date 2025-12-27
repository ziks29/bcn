"use client";

import { deleteUser } from "./actions";
import { toast } from "sonner";

interface DeleteUserButtonProps {
    userId: string;
    role: string;
    currentUserRole: string; // "ADMIN" or "CHIEF_EDITOR" passed as string
    adminCount: number;
    isCurrentUser: boolean;
}

export default function DeleteUserButton({ userId, role, currentUserRole, adminCount, isCurrentUser }: DeleteUserButtonProps) {
    const handleDelete = async () => {
        if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

        const result = await deleteUser(userId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    // Logic for disabling button:
    // 1. Cannot delete if it's the last admin and user is admin.
    // 2. Cannot delete self.
    const isDisabled = (role === 'ADMIN' && adminCount <= 1) || isCurrentUser;

    return (
        <button
            type="button" // Important: type button to avoid form submission if not wrapped
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 font-bold px-2 disabled:opacity-50"
            disabled={isDisabled}
            title={isDisabled ? "Cannot delete the last admin" : "Delete user"}
        >
            X
        </button>
    );
}
