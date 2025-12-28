"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote,
    Heading1, Heading2, Heading3, Image as ImageIcon, Undo, Redo,
    Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Youtube as YoutubeIcon, Table as TableIcon, Trash2, MoreHorizontal,
    Loader2
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react';
import { uploadImage } from '@/app/admin/upload-action';
import { toast } from "sonner";
import GalleryModal from './GalleryModal';

interface RichTextEditorProps {
    content: string;
    onChange?: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);


    const addImage = useCallback(() => {
        if (!editor) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const result = await uploadImage(formData);
                    if (result.success && result.url) {
                        editor.chain().focus().setImage({ src: result.url }).run();
                    } else {
                        toast.error(result.error || "Failed to upload image");
                    }
                } catch (e) {
                    toast.error("Error uploading image");
                } finally {
                    setIsUploading(false);
                }
            }
        };
        input.click();
    }, [editor]);

    const addYoutube = useCallback(() => {
        if (!editor) return;
        const url = prompt('Enter YouTube URL');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className="border-b-2 border-black p-2 flex gap-1 flex-wrap bg-zinc-50 sticky top-0 z-10 items-center">
            {/* History */}
            <div className="flex gap-1 border-r border-zinc-300 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-zinc-200 disabled:opacity-30"><Undo size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-zinc-200 disabled:opacity-30"><Redo size={16} /></button>
            </div>

            {/* Formatting */}
            <div className="flex gap-1 border-r border-zinc-300 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('bold') ? 'bg-zinc-300' : ''}`}><Bold size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('italic') ? 'bg-zinc-300' : ''}`}><Italic size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('underline') ? 'bg-zinc-300' : ''}`}><UnderlineIcon size={16} /></button>
            </div>

            {/* Headings */}
            <div className="flex gap-1 border-r border-zinc-300 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-300' : ''}`}><Heading2 size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-300' : ''}`}><Heading3 size={16} /></button>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r border-zinc-300 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-300' : ''}`}><AlignLeft size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-300' : ''}`}><AlignCenter size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-300' : ''}`}><AlignRight size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-zinc-300' : ''}`}><AlignJustify size={16} /></button>
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r border-zinc-300 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('bulletList') ? 'bg-zinc-300' : ''}`}><List size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('orderedList') ? 'bg-zinc-300' : ''}`}><ListOrdered size={16} /></button>
            </div>

            {/* Inserts */}
            <div className="flex gap-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('blockquote') ? 'bg-zinc-300' : ''}`}><Quote size={16} /></button>
                <button type="button" onClick={setLink} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('link') ? 'bg-zinc-300' : ''}`}><LinkIcon size={16} /></button>

                <button type="button" onClick={addYoutube} className={`p-1.5 rounded hover:bg-zinc-200 ${editor.isActive('youtube') ? 'bg-zinc-300' : ''}`}><YoutubeIcon size={16} /></button>

                <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded hover:bg-zinc-200"><TableIcon size={16} /></button>

                <button type="button" onClick={() => setIsGalleryOpen(true)} className="p-1.5 rounded hover:bg-zinc-200" title="Галерея">
                    <ImageIcon size={16} />
                </button>
            </div>

            {/* Table Actions (only visible when in table) */}
            {editor.isActive('table') && (
                <div className="flex gap-1 border-l border-zinc-300 pl-2 ml-1">
                    <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1.5 rounded hover:bg-zinc-200 text-xs font-bold">+Col</button>
                    <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1.5 rounded hover:bg-zinc-200 text-xs font-bold">+Row</button>
                    <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="p-1.5 rounded hover:bg-red-200 text-red-700"><Trash2 size={16} /></button>
                </div>
            )}

            <GalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelect={(url) => {
                    editor.chain().focus().setImage({ src: url }).run();
                    setIsGalleryOpen(false);
                }}
            />
        </div>
    )
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto my-4 border border-zinc-200 rounded',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
            }),
            Youtube.configure({
                controls: false,
                HTMLAttributes: {
                    class: 'w-full aspect-video my-4 rounded shadow-sm',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none m-5 focus:outline-none min-h-[400px]',
            },
            handleDrop: function (view, event, slice, moved) {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const formData = new FormData();
                        formData.append('file', file);

                        uploadImage(formData).then(result => {
                            if (result.success && result.url) {
                                const { schema } = view.state;
                                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                if (coordinates) {
                                    const node = schema.nodes.image.create({ src: result.url });
                                    const transaction = view.state.tr.insert(coordinates.pos, node);
                                    view.dispatch(transaction);
                                }
                            } else {
                                toast.error(result.error || "Failed to upload dropped image");
                            }
                        });
                        return true; // handled
                    }
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Update editor content when it changes from outside (e.g., draft restoration)
            // Use commands.setContent to update without breaking the transaction
            const { from, to } = editor.state.selection;
            editor.commands.setContent(content);

            // Try to restore cursor position if the document is still valid
            try {
                if (from <= editor.state.doc.content.size) {
                    editor.commands.setTextSelection({ from: Math.min(from, editor.state.doc.content.size), to: Math.min(to, editor.state.doc.content.size) });
                }
            } catch (e) {
                // Cursor position restoration failed, that's okay
            }
        }
    }, [content, editor])

    return (
        <div className="border-2 border-black bg-white w-full flex flex-col">
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto max-h-[800px]">
                <EditorContent editor={editor} />
            </div>
            {/* Styles for tables handled via globals or prose, usually prose is good but tables need specific borders sometimes */}
            <style jsx global>{`
                .ProseMirror table {
                    border-collapse: collapse;
                    margin: 0;
                    overflow: hidden;
                    table-layout: fixed;
                    width: 100%;
                }
                .ProseMirror td,
                .ProseMirror th {
                    border: 2px solid #ced4da;
                    box-sizing: border-box;
                    min-width: 1em;
                    padding: 3px 5px;
                    position: relative;
                    vertical-align: top;
                }
                .ProseMirror th {
                    font-weight: bold;
                    text-align: left;
                    background-color: #f1f3f5;
                }
                .ProseMirror .selectedCell:after {
                    background: rgba(200, 200, 255, 0.4);
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    pointer-events: none;
                    position: absolute;
                    z-index: 2;
                }
                .ProseMirror iframe {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 16/9;
                }
                .ProseMirror img {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                .ProseMirror img.ProseMirror-selectednode {
                    outline: 3px solid #68CEF8;
                }
            `}</style>
        </div>
    )
}
