"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Download } from "lucide-react";
import { createSnapshot, getSnapshots, loadSnapshot, deleteSnapshot } from "@/app/actions/excalidraw";

interface Snapshot {
    id: string;
    name: string;
    createdBy: string;
    createdAt: Date;
}

interface SnapshotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadSnapshot: (data: { elements: any; appState: any; files?: any }) => void;
    currentElements: any;
    currentAppState: any;
    currentFiles?: any;
}

export default function SnapshotModal({
    isOpen,
    onClose,
    onLoadSnapshot,
    currentElements,
    currentAppState,
    currentFiles,
}: SnapshotModalProps) {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [snapshotName, setSnapshotName] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSnapshots();
        }
    }, [isOpen]);

    const loadSnapshots = async () => {
        setLoading(true);
        try {
            const data = await getSnapshots();
            setSnapshots(data as Snapshot[]);
        } catch (error) {
            console.error("Failed to load snapshots:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSnapshot = async () => {
        if (!snapshotName.trim()) {
            alert("Пожалуйста, введите название снимка");
            return;
        }

        setSaving(true);
        try {
            await createSnapshot(snapshotName, currentElements, currentAppState, currentFiles);
            setSnapshotName("");
            await loadSnapshots();
        } catch (error) {
            console.error("Failed to save snapshot:", error);
            alert("Не удалось сохранить снимок");
        } finally {
            setSaving(false);
        }
    };

    const handleLoadSnapshot = async (id: string) => {
        if (!confirm("Загрузить этот снимок? Несохраненные изменения будут потеряны.")) {
            return;
        }

        try {
            const data = await loadSnapshot(id);
            onLoadSnapshot(data);
            onClose();
        } catch (error) {
            console.error("Failed to load snapshot:", error);
            alert("Не удалось загрузить снимок");
        }
    };

    const handleDeleteSnapshot = async (id: string) => {
        if (!confirm("Удалить этот снимок?")) {
            return;
        }

        try {
            await deleteSnapshot(id);
            await loadSnapshots();
        } catch (error) {
            console.error("Failed to delete snapshot:", error);
            alert("Не удалось удалить снимок");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border-2 border-black">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-black">
                    <h2 className="text-xl font-headline uppercase tracking-tighter">Снимки доски</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Save New Snapshot */}
                <div className="p-4 border-b-2 border-black bg-gray-50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={snapshotName}
                            onChange={(e) => setSnapshotName(e.target.value)}
                            placeholder="Название нового снимка..."
                            className="flex-1 px-3 py-2 border-2 border-black rounded-lg font-sans"
                            onKeyDown={(e) => e.key === "Enter" && handleSaveSnapshot()}
                        />
                        <button
                            onClick={handleSaveSnapshot}
                            disabled={saving || !snapshotName.trim()}
                            className="px-4 py-2 bg-black text-white rounded-lg font-bold uppercase text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save size={16} />
                            {saving ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </div>

                {/* Snapshots List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Загрузка...</div>
                    ) : snapshots.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Нет сохраненных снимков
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {snapshots.map((snapshot) => (
                                <div
                                    key={snapshot.id}
                                    className="flex items-center justify-between p-3 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-bold">{snapshot.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {snapshot.createdBy} •{" "}
                                            {new Date(snapshot.createdAt).toLocaleString("ru-RU")}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleLoadSnapshot(snapshot.id)}
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg font-bold uppercase text-xs hover:bg-blue-600 flex items-center gap-1"
                                        >
                                            <Download size={14} />
                                            Загрузить
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSnapshot(snapshot.id)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold uppercase text-xs hover:bg-red-600 flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
