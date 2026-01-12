"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    X,
    Trash2,
    Clock,
    GripVertical,
    Check,
    Palette,
    Tag,
} from "lucide-react";

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

interface StickyNoteProps {
    note: Note;
    isNew?: boolean;
    categories?: Category[];
    onUpdate: (id: string, data: Partial<Note>, skipReload?: boolean) => void;
    onDelete: (id: string) => void;
    onClose?: (id: string) => void;
    onPositionChange: (id: string, x: number, y: number) => void;
    onSizeChange: (id: string, width: number, height: number) => void;
    onSaveNew?: (data: Partial<Note>) => void;
    onCancelNew?: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
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

export default function StickyNoteComponent({
    note,
    isNew = false,
    categories = [],
    onUpdate,
    onDelete,
    onClose,
    onPositionChange,
    onSizeChange,
    onSaveNew,
    onCancelNew,
    containerRef,
}: StickyNoteProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isEditing, setIsEditing] = useState(isNew);
    const [localPos, setLocalPos] = useState({ x: note.posX, y: note.posY });
    const [localSize, setLocalSize] = useState({ width: note.width, height: note.height });
    const [showActions, setShowActions] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Editable fields
    const [editTitle, setEditTitle] = useState(note.title);
    const [editContent, setEditContent] = useState(note.content);
    const [editColor, setEditColor] = useState(note.color);
    const [editCategoryId, setEditCategoryId] = useState<string | null>(note.categoryId);
    const [editReminderDate, setEditReminderDate] = useState<string>(
        note.reminderDate ? new Date(note.reminderDate).toISOString().split("T")[0] : ""
    );

    const noteRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartSize = useRef({ width: 0, height: 0 });

    // Focus title input when in edit mode
    useEffect(() => {
        if (isEditing && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditing]);

    // Sync with props when note changes
    const prevNoteIdRef = useRef(note.id);
    useEffect(() => {
        // Only reset position/size if this is a different note
        if (prevNoteIdRef.current !== note.id) {
            setLocalPos({ x: note.posX, y: note.posY });
            setLocalSize({ width: note.width, height: note.height });
            setEditTitle(note.title);
            setEditContent(note.content);
            setEditColor(note.color);
            prevNoteIdRef.current = note.id;
        }
    }, [note.id, note.posX, note.posY, note.width, note.height, note.title, note.content, note.color]);

    // Save changes
    const handleSave = useCallback(() => {
        if (isNew && onSaveNew) {
            onSaveNew({
                title: editTitle || "Без заголовка",
                content: editContent,
                color: editColor,
                categoryId: editCategoryId,
                reminderDate: editReminderDate ? new Date(editReminderDate) : null,
                posX: localPos.x,
                posY: localPos.y,
                width: localSize.width,
                height: localSize.height,
            });
        } else {
            onUpdate(note.id, {
                title: editTitle || "Без заголовка",
                content: editContent,
                color: editColor,
                categoryId: editCategoryId,
                reminderDate: editReminderDate ? new Date(editReminderDate) : null,
            });
            setIsEditing(false);
        }
    }, [isNew, onSaveNew, onUpdate, note.id, editTitle, editContent, editColor, editCategoryId, editReminderDate, localPos, localSize]);

    // Autosave with debounce (for existing notes)
    useEffect(() => {
        if (isNew || !isEditing) return;

        const timeout = setTimeout(() => {
            // Save to cloud (skip reload to keep edit mode open)
            onUpdate(note.id, {
                title: editTitle || "Без заголовка",
                content: editContent,
                color: editColor,
                categoryId: editCategoryId,
                reminderDate: editReminderDate ? new Date(editReminderDate) : null,
            }, true); // skipReload = true for autosave
        }, 1500); // Autosave after 1.5s of no typing

        return () => clearTimeout(timeout);
    }, [isNew, isEditing, note.id, editTitle, editContent, editColor, editCategoryId, editReminderDate, onUpdate]);

    // Store current edit values in refs for click-outside handler
    const editValuesRef = useRef({
        title: editTitle,
        content: editContent,
        color: editColor,
        categoryId: editCategoryId,
        reminderDate: editReminderDate,
    });

    // Keep refs updated
    useEffect(() => {
        editValuesRef.current = {
            title: editTitle,
            content: editContent,
            color: editColor,
            categoryId: editCategoryId,
            reminderDate: editReminderDate,
        };
    }, [editTitle, editContent, editColor, editCategoryId, editReminderDate]);

    // Click outside to exit edit mode (for existing notes)
    useEffect(() => {
        if (!isEditing || isNew) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (noteRef.current && !noteRef.current.contains(e.target as Node)) {
                const vals = editValuesRef.current;
                // Save and exit edit mode - reload to show changes
                onUpdate(note.id, {
                    title: vals.title || "Без заголовка",
                    content: vals.content,
                    color: vals.color,
                    categoryId: vals.categoryId,
                    reminderDate: vals.reminderDate ? new Date(vals.reminderDate) : null,
                }, false); // reload data to show changes
                setIsEditing(false);
            }
        };

        // Add listener after a small delay to avoid triggering on the same click
        const timeout = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeout);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing, isNew, note.id, onUpdate]);

    // Cancel editing
    const handleCancel = useCallback(() => {
        if (isNew && onCancelNew) {
            onCancelNew();
        } else {
            setEditTitle(note.title);
            setEditContent(note.content);
            setEditColor(note.color);
            setIsEditing(false);
        }
    }, [isNew, onCancelNew, note.title, note.content, note.color]);

    // Drag handlers - allow drag from grip handle even while editing
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(".note-actions")) return;
        if ((e.target as HTMLElement).closest(".note-editable")) return;
        if ((e.target as HTMLElement).closest(".color-picker")) return;
        if ((e.target as HTMLElement).closest(".edit-footer")) return;
        e.preventDefault();
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - localPos.x,
            y: e.clientY - localPos.y,
        };
    }, [localPos]);

    const handleDrag = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        let newX = e.clientX - dragStartPos.current.x;
        let newY = e.clientY - dragStartPos.current.y;

        // Keep within viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - localSize.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - localSize.height));

        setLocalPos({ x: newX, y: newY });
    }, [isDragging, localSize]);

    const handleDragEnd = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (!isNew) {
                onPositionChange(note.id, localPos.x, localPos.y);
            }
        }
    }, [isDragging, isNew, note.id, localPos, onPositionChange]);

    // Resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeStartSize.current = { width: localSize.width, height: localSize.height };
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    }, [localSize]);

    const handleResize = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        const newWidth = Math.max(200, resizeStartSize.current.width + deltaX);
        const newHeight = Math.max(150, resizeStartSize.current.height + deltaY);

        setLocalSize({ width: newWidth, height: newHeight });
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        if (isResizing) {
            setIsResizing(false);
            if (!isNew) {
                onSizeChange(note.id, localSize.width, localSize.height);
            }
        }
    }, [isResizing, isNew, note.id, localSize, onSizeChange]);

    // Mouse event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleDrag);
            document.addEventListener("mouseup", handleDragEnd);
            return () => {
                document.removeEventListener("mousemove", handleDrag);
                document.removeEventListener("mouseup", handleDragEnd);
            };
        }
    }, [isDragging, handleDrag, handleDragEnd]);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleResize);
            document.addEventListener("mouseup", handleResizeEnd);
            return () => {
                document.removeEventListener("mousemove", handleResize);
                document.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [isResizing, handleResize, handleResizeEnd]);

    // Double click to edit
    const handleDoubleClick = useCallback(() => {
        if (!isNew) {
            setIsEditing(true);
        }
    }, [isNew]);

    const isOverdue = note.reminderDate && new Date(note.reminderDate) < new Date();

    return (
        <div
            ref={noteRef}
            className="absolute select-none pointer-events-auto"
            style={{
                left: localPos.x,
                top: localPos.y,
                width: localSize.width,
                height: localSize.height,
                zIndex: isDragging || isResizing || isEditing ? 100 : note.isPinned ? 50 : 10,
            }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => { setShowActions(false); setShowColorPicker(false); }}
            onDoubleClick={handleDoubleClick}
        >
            <div
                className="w-full h-full rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-xl"
                style={{
                    backgroundColor: isEditing ? editColor : note.color,
                    cursor: isDragging ? "grabbing" : isEditing ? "default" : "grab",
                    border: isOverdue ? "2px solid #ef4444" : isEditing ? "2px solid #3b82f6" : "1px solid rgba(0,0,0,0.1)",
                }}
            >
                {/* Header - always draggable via grip */}
                <div
                    className="px-3 py-2 flex items-center justify-between border-b border-black/10"
                    onMouseDown={handleDragStart}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical size={14} className="text-black/40 shrink-0 cursor-grab" onMouseDown={handleDragStart} />
                        {!isEditing && note.reminderDate && (
                            <Clock size={12} className={isOverdue ? "text-red-600" : "text-blue-600"} />
                        )}
                        {isEditing ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Заголовок..."
                                className="note-editable flex-1 bg-transparent border-none outline-none font-bold text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSave();
                                    if (e.key === "Escape") handleCancel();
                                }}
                            />
                        ) : (
                            <span className="font-bold text-sm truncate">{note.title || "Без заголовка"}</span>
                        )}
                    </div>

                    {/* Category badge */}
                    {!isEditing && note.category && (
                        <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0"
                            style={{ backgroundColor: note.category.color }}
                        >
                            {note.category.name}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div
                    className="flex-1 px-3 py-2 overflow-hidden text-sm"
                    onMouseDown={!isEditing ? handleDragStart : undefined}
                >
                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Напишите что-нибудь..."
                            className="note-editable w-full h-full bg-transparent border-none outline-none resize-none text-black/80"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap h-full break-words text-black/80">
                            {note.content || "Пустая заметка..."}
                        </p>
                    )}
                </div>

                {/* Edit mode footer - color, category, reminder */}
                {isEditing && (
                    <div className="edit-footer px-2 py-1.5 border-t border-black/10 flex items-center gap-2 flex-wrap bg-black/5">
                        {/* Color picker */}
                        <div className="color-picker relative">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="flex items-center gap-1 p-1.5 rounded hover:bg-black/10"
                                title="Цвет"
                            >
                                <Palette size={14} />
                                <span
                                    className="w-4 h-4 rounded-full border border-black/20"
                                    style={{ backgroundColor: editColor }}
                                />
                            </button>
                            {showColorPicker && (
                                <div className="absolute bottom-full left-0 mb-1 p-1.5 bg-white rounded-lg shadow-lg flex gap-1 z-50">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => { setEditColor(c); setShowColorPicker(false); }}
                                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${editColor === c ? "border-black" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category selector */}
                        {categories.length > 0 && (
                            <select
                                value={editCategoryId || ""}
                                onChange={(e) => setEditCategoryId(e.target.value || null)}
                                className="text-xs px-2 py-1 bg-white/50 border border-black/10 rounded"
                            >
                                <option value="">Без категории</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Reminder date */}
                        <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-500" />
                            <input
                                type="date"
                                value={editReminderDate}
                                onChange={(e) => setEditReminderDate(e.target.value)}
                                className="text-xs px-1 py-0.5 bg-white/50 border border-black/10 rounded"
                            />
                        </div>

                        {/* New note: only show create button */}
                        {isNew && (
                            <div className="flex items-center gap-1 ml-auto">
                                <button
                                    onClick={handleCancel}
                                    className="px-2 py-1 text-xs hover:bg-black/10 rounded"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-black/80 flex items-center gap-1"
                                >
                                    <Check size={12} />
                                    Создать
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions - show on hover (not in edit mode) */}
                {showActions && !isEditing && (
                    <div className="note-actions absolute top-1 right-1 flex items-center gap-1 bg-white/90 rounded-lg p-1 shadow-sm">
                        {/* Close note (hide from canvas) */}
                        {onClose && (
                            <button
                                onClick={() => onClose(note.id)}
                                className="p-1 hover:bg-black/10 rounded"
                                title="Закрыть (скрыть)"
                            >
                                <X size={14} />
                            </button>
                        )}
                        {/* Close note (hide from canvas) */}
                        <button
                            onClick={() => onDelete(note.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                            title="Удалить"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                {/* Resize handle */}
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                    onMouseDown={handleResizeStart}
                >
                    <svg
                        className="w-full h-full text-black/30"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
