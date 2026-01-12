"use client";

/**
 * NotesPanel - Sticky Notes Management
 * 
 * This component implements a hybrid storage model:
 * - User-specific data (content, color, categories, reminders): Stored in database, syncs across devices
 * - Device-specific data (positions, sizes, visibility): Stored in localStorage, unique per device
 * 
 * This allows users to have the same notes on all devices, but arrange them differently
 * on each device based on screen size and personal preference.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    X,
    Plus,
    Search,
    Tag,
    Minimize2,
    Settings,
    List,
    Eye,
    Trash2,
} from "lucide-react";
import StickyNote from "./StickyNote";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteCategories,
    createNoteCategory,
    deleteNoteCategory,
} from "@/app/actions/notes";

const COLORS = [
    "#fef3c7", // Yellow
    "#fce7f3", // Pink
    "#dbeafe", // Blue
    "#dcfce7", // Green
    "#f3e8ff", // Purple
    "#fed7aa", // Orange
    "#e2e8f0", // Gray
];

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
    _count?: { notes: number };
}

interface NotesPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [newNote, setNewNote] = useState<Note | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [closedNoteIds, setClosedNoteIds] = useState<Set<string>>(new Set());
    const [showNotesList, setShowNotesList] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load device-specific closed notes from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('closedNotes');
            if (stored) {
                setClosedNoteIds(new Set(JSON.parse(stored)));
            }
        }
    }, []);

    // Save device-specific closed notes to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('closedNotes', JSON.stringify(Array.from(closedNoteIds)));
        }
    }, [closedNoteIds]);

    // Load device-specific positions from localStorage
    const loadLocalPositions = useCallback(() => {
        if (typeof window === 'undefined') return {};
        const stored = localStorage.getItem('notePositions');
        return stored ? JSON.parse(stored) : {};
    }, []);

    // Save device-specific positions to localStorage
    const saveLocalPosition = useCallback((noteId: string, posX: number, posY: number, width: number, height: number) => {
        if (typeof window === 'undefined') return;
        const positions = loadLocalPositions();
        positions[noteId] = { posX, posY, width, height };
        localStorage.setItem('notePositions', JSON.stringify(positions));
    }, [loadLocalPositions]);

    // Load notes and categories
    const loadData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [notesData, categoriesData] = await Promise.all([
                getNotes({
                    categoryId: selectedCategory || undefined,
                    search: searchQuery || undefined,
                }),
                getNoteCategories(),
            ]);
            
            // Merge server data with local positions (device-specific)
            const localPositions = loadLocalPositions();
            const notesWithLocalPositions = (notesData as Note[]).map(note => {
                const localPos = localPositions[note.id];
                if (localPos) {
                    return {
                        ...note,
                        posX: localPos.posX,
                        posY: localPos.posY,
                        width: localPos.width,
                        height: localPos.height,
                    };
                }
                return note;
            });
            
            setNotes(notesWithLocalPositions);
            setCategories(categoriesData as Category[]);
        } catch (error) {
            console.error("Failed to load notes:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [selectedCategory, searchQuery, loadLocalPositions]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, loadData]);

    // Handle search with debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isOpen) {
                loadData(true); // Silent reload for search
            }
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Create new note (inline)
    const handleCreateNote = async () => {
        // Position new note at a visible spot
        const posX = 100 + Math.random() * 200;
        const posY = 150 + Math.random() * 100;

        setNewNote({
            id: "",
            title: "",
            content: "",
            color: "#fef3c7",
            posX,
            posY,
            width: 280,
            height: 220,
            isPinned: false,
            reminderDate: null,
            categoryId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    };

    // Save new note (inline creation)
    const handleSaveNewNote = async (data: Partial<Note>) => {
        try {
            const createdNote = await createNote({
                title: data.title || "Без заголовка",
                content: data.content || "",
                color: data.color,
                posX: data.posX,
                posY: data.posY,
                width: data.width,
                height: data.height,
            });
            
            // Save position to localStorage for this device
            if (createdNote?.id && data.posX !== undefined && data.posY !== undefined && data.width !== undefined && data.height !== undefined) {
                saveLocalPosition(createdNote.id, data.posX, data.posY, data.width, data.height);
            }
            
            setNewNote(null);
            loadData(true); // Silent reload
        } catch (error) {
            console.error("Failed to create note:", error);
        }
    };

    // Cancel new note creation
    const handleCancelNewNote = () => {
        setNewNote(null);
    };

    // Save existing note from modal
    // Update note inline (skipReload for autosave to keep edit mode open)
    // Update note inline (skipReload for autosave to keep edit mode open)
    const handleUpdateNote = async (id: string, data: Partial<Note>, skipReload = false) => {
        try {
            // Optimistic update
            setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));

            await updateNote(id, data);

            // Only reload if we really need to sync (e.g. after edit mode closes), 
            // but we might not need to if optimistic update works well.
            // For now, let's keep it but it shouldn't cause flicker since local state is already updated.
            if (!skipReload) {
                // Background reload to ensure consistency (silent)
                loadData(true);
            }
        } catch (error) {
            console.error("Failed to update note:", error);
            // Revert on error (could be improved with previous state)
            loadData(true);
        }
    };

    // Delete note
    const handleDeleteNote = async (id: string) => {
        if (!confirm("Удалить эту заметку?")) return;
        try {
            // Optimistic delete
            setNotes((prev) => prev.filter((n) => n.id !== id));
            await deleteNote(id);
            loadData(true); // Sync silently
        } catch (error) {
            console.error("Failed to delete note:", error);
            loadData(true); // Revert silently
        }
    };

    // Update position (save to localStorage for device-specific positioning)
    const handlePositionChange = async (id: string, x: number, y: number) => {
        try {
            // Optimistic update
            setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, posX: x, posY: y } : n)));
            
            // Save to localStorage (device-specific)
            const note = notes.find(n => n.id === id);
            if (note) {
                saveLocalPosition(id, x, y, note.width, note.height);
            }
        } catch (error) {
            console.error("Failed to update position:", error);
        }
    };

    // Update size (save to localStorage for device-specific sizing)
    const handleSizeChange = async (id: string, width: number, height: number) => {
        try {
            // Optimistic update
            setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, width, height } : n)));
            
            // Save to localStorage (device-specific)
            const note = notes.find(n => n.id === id);
            if (note) {
                saveLocalPosition(id, note.posX, note.posY, width, height);
            }
        } catch (error) {
            console.error("Failed to update size:", error);
        }
    };

    // Close note (hide from canvas but keep in list)
    const handleCloseNote = (id: string) => {
        setClosedNoteIds(prev => new Set(prev).add(id));
    };

    // Reopen note (show on canvas again)
    const handleReopenNote = (id: string) => {
        setClosedNoteIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    // Create category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createNoteCategory(newCategoryName.trim(), COLORS[Math.floor(Math.random() * COLORS.length)]);
            setNewCategoryName("");
            setShowCategoryDropdown(false);
            loadData(true); // Silent reload
        } catch (error) {
            console.error("Failed to create category:", error);
        }
    };

    // Delete category
    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Удалить эту категорию?")) return;
        try {
            await deleteNoteCategory(id);
            loadData(true); // Silent reload
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Floating Toolbar - doesn't block page interaction */}
            <div
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-white/95 backdrop-blur-sm border border-black/10 rounded-xl shadow-lg px-4 py-2 flex items-center gap-3"
                style={{ pointerEvents: "auto" }}
            >
                {/* <span className="font-bold text-sm">Заметки</span> */}

                {/* Search */}
                {/* <div className="relative">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск..."
                            className="pl-7 pr-2 py-1 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 w-32"
                        />
                    </div> */}

                {/* Category Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <Tag size={14} />
                        <span className="max-w-20 truncate">
                            {selectedCategory
                                ? categories.find(c => c.id === selectedCategory)?.name || "Фильтр"
                                : "Все"
                            }
                        </span>
                    </button>
                    {showCategoryDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-black/10 py-1 min-w-40 z-10">
                            <button
                                onClick={() => { setSelectedCategory(null); setShowCategoryDropdown(false); }}
                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                            >
                                Все категории
                            </button>
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center hover:bg-gray-100 group">
                                    <button
                                        onClick={() => { setSelectedCategory(cat.id); setShowCategoryDropdown(false); }}
                                        className="flex-1 text-left px-3 py-1.5 text-sm flex items-center gap-2"
                                    >
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Удалить категорию"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <div className="border-t border-black/10 mt-1 pt-1">
                                <div className="px-2 flex gap-1">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Новая..."
                                        className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none"
                                        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleCreateCategory(); }}
                                    />
                                    <button
                                        onClick={handleCreateCategory}
                                        className="px-2 py-1 bg-black text-white text-xs rounded hover:bg-black/80"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes List */}
                <button
                    onClick={() => setShowNotesList(!showNotesList)}
                    className={`p-1.5 rounded-lg flex items-center gap-2 transition-colors ${showNotesList ? "bg-purple-500 text-white" : "hover:bg-gray-100"
                        }`}
                    title="Список заметок"
                >
                    <List size={16} />
                    <span className="text-sm">Все заметки</span>
                </button>

                {/* Create Note */}
                <button
                    onClick={handleCreateNote}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-bold text-sm transition-colors"
                >
                    <Plus size={16} />
                    <span>Новая</span>
                </button>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Закрыть заметки"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Floating notes container - doesn't block page */}
            <div
                ref={containerRef}
                className="fixed inset-0 pointer-events-none z-[9990]"
                style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
                {loading ? (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 pointer-events-auto">
                        <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <>
                        {notes.filter(n => !closedNoteIds.has(n.id)).map((note) => (
                            <StickyNote
                                key={note.id}
                                note={note}
                                categories={categories}
                                onUpdate={handleUpdateNote}
                                onDelete={handleDeleteNote}
                                onClose={handleCloseNote}
                                onPositionChange={handlePositionChange}
                                onSizeChange={handleSizeChange}
                                containerRef={containerRef}
                            />
                        ))}
                        {/* New note being created */}
                        {newNote && (
                            <StickyNote
                                key="new-note"
                                note={newNote}
                                isNew={true}
                                categories={categories}
                                onUpdate={handleUpdateNote}
                                onDelete={handleDeleteNote}
                                onPositionChange={handlePositionChange}
                                onSizeChange={handleSizeChange}
                                onSaveNew={handleSaveNewNote}
                                onCancelNew={handleCancelNewNote}
                                containerRef={containerRef}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Notes List Sidebar */}
            {showNotesList && (
                <div className="fixed top-16 right-4 w-72 max-h-96 bg-white rounded-lg shadow-xl border border-black/10 z-[9999] pointer-events-auto overflow-hidden">
                    <div className="px-3 py-2 border-b border-black/10 flex items-center justify-between">
                        <span className="font-bold text-sm">Все заметки</span>
                        <button onClick={() => setShowNotesList(false)} className="p-1 hover:bg-black/10 rounded">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                        {notes.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">Нет заметок</p>
                        ) : (
                            notes.map((note) => {
                                const isClosed = closedNoteIds.has(note.id);
                                return (
                                    <div
                                        key={note.id}
                                        className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 mb-1 ${isClosed ? 'opacity-50' : ''}`}
                                        style={{ borderLeft: `3px solid ${note.color}` }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{note.title || "Без заголовка"}</p>
                                            {note.category && (
                                                <span className="text-[10px] px-1 py-0.5 rounded text-white" style={{ backgroundColor: note.category.color }}>
                                                    {note.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isClosed) {
                                                    handleReopenNote(note.id);
                                                } else {
                                                    handleCloseNote(note.id);
                                                }
                                            }}
                                            className="p-1 hover:bg-black/10 rounded"
                                            title={isClosed ? "Показать" : "Скрыть"}
                                        >
                                            {isClosed ? <Eye size={14} /> : <X size={14} />}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
