"use client";

import React, { useState, useEffect } from "react";
import { X, Pin, Archive, Trash2, Clock, Tag, Palette } from "lucide-react";

interface Note {
    id: string;
    title: string;
    content: string;
    color: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    isPinned: boolean;
    isArchived: boolean;
    reminderDate: Date | null;
    categoryId: string | null;
    category?: { id: string; name: string; color: string } | null;
    createdAt: Date;
    updatedAt: Date;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface NoteEditorProps {
    note: Note | null;
    categories: Category[];
    onSave: (data: Partial<Note>) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
}

const COLORS = [
    "#fef3c7", // Yellow
    "#fce7f3", // Pink
    "#dbeafe", // Blue
    "#dcfce7", // Green
    "#f3e8ff", // Purple
    "#fed7aa", // Orange
    "#e2e8f0", // Gray
    "#ffffff", // White
];

export default function NoteEditor({
    note,
    categories,
    onSave,
    onClose,
    onDelete,
}: NoteEditorProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [color, setColor] = useState("#fef3c7");
    const [isPinned, setIsPinned] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [reminderDate, setReminderDate] = useState<string>("");
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Initialize form when note changes
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setColor(note.color);
            setIsPinned(note.isPinned);
            setCategoryId(note.categoryId);
            setReminderDate(
                note.reminderDate
                    ? new Date(note.reminderDate).toISOString().split("T")[0]
                    : ""
            );
        } else {
            setTitle("");
            setContent("");
            setColor("#fef3c7");
            setIsPinned(false);
            setCategoryId(null);
            setReminderDate("");
        }
    }, [note]);

    const handleSave = () => {
        onSave({
            id: note?.id,
            title: title || "Без заголовка",
            content,
            color,
            isPinned,
            categoryId,
            reminderDate: reminderDate ? new Date(reminderDate) : null,
        });
    };

    const handleDelete = () => {
        if (note && confirm("Удалить эту заметку?")) {
            onDelete(note.id);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-full max-w-2xl mx-4 rounded-xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: color }}
            >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-black/10 bg-black/5">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                            {note ? "Редактирование" : "Новая заметка"}
                        </span>
                        {isPinned && <Pin size={16} className="text-red-600" />}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Заголовок заметки..."
                        className="w-full px-3 py-2 text-lg font-bold bg-white/50 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                    />

                    {/* Content */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Напишите что-нибудь..."
                        rows={10}
                        className="w-full px-3 py-2 bg-white/50 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                    />

                    {/* Options Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Color Picker */}
                        <div className="relative">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                            >
                                <Palette size={16} />
                                <span
                                    className="w-4 h-4 rounded-full border border-black/20"
                                    style={{ backgroundColor: color }}
                                />
                            </button>
                            {showColorPicker && (
                                <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg flex gap-1">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                setColor(c);
                                                setShowColorPicker(false);
                                            }}
                                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-black" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <select
                            value={categoryId || ""}
                            onChange={(e) => setCategoryId(e.target.value || null)}
                            className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white/70 focus:outline-none"
                        >
                            <option value="">Без категории</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Reminder */}
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-600" />
                            <input
                                type="date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                className="px-2 py-1 bg-white/50 rounded-lg focus:outline-none"
                            />
                        </div>

                        {/* Pin Toggle */}
                        <button
                            onClick={() => setIsPinned(!isPinned)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isPinned
                                    ? "bg-red-500 text-white"
                                    : "bg-white/50 hover:bg-white/70"
                                }`}
                        >
                            <Pin size={16} />
                            <span className="text-sm">{isPinned ? "Закреплено" : "Закрепить"}</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 flex items-center justify-between border-t border-black/10 bg-black/5">
                    <div>
                        {note && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                                <span>Удалить</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-black text-white hover:bg-black/80 rounded-lg transition-colors font-bold"
                        >
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
