"use client";

import React, { useState, useEffect } from "react";
import NotesButton from "./NotesButton";
import NotesPanel from "./NotesPanel";
import { getNotes } from "@/app/actions/notes";

interface NotesProviderProps {
    children: React.ReactNode;
}

export default function NotesProvider({ children }: NotesProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [noteCount, setNoteCount] = useState(0);

    // Load note count on mount
    useEffect(() => {
        const loadCount = async () => {
            try {
                const notes = await getNotes();
                setNoteCount(notes.length);
            } catch (error) {
                // User might not be authenticated
                console.error("Failed to load notes count:", error);
            }
        };
        loadCount();
    }, []);

    // Refresh count when panel closes
    const handleClose = async () => {
        setIsOpen(false);
        try {
            const notes = await getNotes();
            setNoteCount(notes.length);
        } catch (error) {
            console.error("Failed to refresh notes count:", error);
        }
    };

    return (
        <>
            {children}
            <NotesButton onClick={() => setIsOpen(true)} noteCount={noteCount} />
            <NotesPanel isOpen={isOpen} onClose={handleClose} />
        </>
    );
}
