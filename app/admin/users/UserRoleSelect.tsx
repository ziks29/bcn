"use client";

import { updateUserRole } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";

type Role = "ADMIN" | "CHIEF_EDITOR" | "EDITOR" | "AUTHOR" | "DISABLED";

interface UserRoleSelectProps {
    userId: string;
    currentRole: Role | string;
    disabled?: boolean;
}

export default function UserRoleSelect({ userId, currentRole, disabled }: UserRoleSelectProps) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as Role;
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("role", newRole);

        // Optimistically update or just wait? Better wait to confirm.
        startTransition(async () => {
            const result = await updateUserRole(formData);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
                // Reset select value if failed (primitive reset)
                e.target.value = currentRole;
            }
        });
    };

    return (
        <select
            disabled={disabled || isPending}
            defaultValue={currentRole}
            className={`border-2 border-black text-sm p-1 ${isPending ? 'opacity-50' : ''}`}
            onChange={handleChange}
        >
            <option value="ADMIN">ADMIN</option>
            <option value="CHIEF_EDITOR">CHIEF</option>
            <option value="EDITOR">EDITOR</option>
            <option value="AUTHOR">AUTHOR</option>
            <option value="DISABLED">DISABLED</option>
        </select>
    );
}
