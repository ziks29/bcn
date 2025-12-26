"use client";

import { useState } from "react";
import RichTextEditor from "./RichTextEditor";
import Link from "next/link";
// We need to import the server actions in a way that we can pass them to the form
// However, passing server actions as props is cleaner if we just wrap the form parts.

// Actually, simpler approach: Make the whole form a client component that calls the server action.
// Or just a wrapper for the editor part that updates a hidden input.

interface ArticleEditorProps {
    initialContent?: string;
}

export default function ArticleEditorInput({ initialContent = "" }: ArticleEditorProps) {
    const [content, setContent] = useState(initialContent);

    return (
        <div className="w-full">
            <RichTextEditor content={content} onChange={setContent} />
            <textarea
                name="content"
                value={content}
                readOnly
                className="hidden"
            />
        </div>
    );
}
