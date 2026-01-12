"use client";

import React, { useState } from "react";
import { StickyNote } from "lucide-react";

interface NotesButtonProps {
    onClick: () => void;
    noteCount?: number;
}

export default function NotesButton({ onClick, noteCount = 0 }: NotesButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
            title="Личные заметки"
        >
            <StickyNote size={24} className="transition-transform group-hover:rotate-12" />

            {noteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {noteCount > 9 ? "9+" : noteCount}
                </span>
            )}
        </button>
    );
}
