import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExcalidrawWrapper from "@/components/ExcalidrawWrapper";

export default async function ExcalidrawPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return <ExcalidrawWrapper />;
}
