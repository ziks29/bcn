"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Image as ImageIcon, Undo, Redo, Code } from 'lucide-react'
import { useEffect } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange?: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    const addImage = () => {
        const url = window.prompt('URL изображения:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className="border-b-2 border-black p-2 flex gap-2 flex-wrap bg-zinc-50">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('bold') ? 'bg-zinc-300' : ''}`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('italic') ? 'bg-zinc-300' : ''}`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <div className="w-px h-8 bg-zinc-300 mx-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-300' : ''}`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-300' : ''}`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-300' : ''}`}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-300' : ''}`}
                title="Quote"
            >
                <Quote size={18} />
            </button>
            <div className="w-px h-8 bg-zinc-300 mx-1"></div>
            <button
                type="button"
                onClick={addImage}
                className="p-2 rounded hover:bg-zinc-200 transition-colors"
                title="Add Image"
            >
                <ImageIcon size={18} />
            </button>
            <div className="w-px h-8 bg-zinc-300 mx-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                title="Redo"
            >
                <Redo size={18} />
            </button>
        </div>
    )
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content: content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none m-5 focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    // Update editor content if prop changes externally (optional, but good for initial load if dynamic)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // careful with loops here, only set if significantly different or initial
            // For now, we assume initial content is sufficient
        }
    }, [content, editor])

    return (
        <div className="border-2 border-black bg-white w-full">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            {/* Hidden input to ensure value is submitted in forms if needed, 
                though we usually control an external hidden input via onChange */}
        </div>
    )
}
