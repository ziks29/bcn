"use client";

import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { getGalleryItemsForExcalidraw } from "@/app/actions/gallery";

interface GalleryItem {
    id: string;
    url: string;
    name: string | null;
}

interface GalleryPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (url: string) => void;
}

export default function GalleryPickerModal({
    isOpen,
    onClose,
    onSelectImage,
}: GalleryPickerModalProps) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadGalleryItems();
        }
    }, [isOpen]);

    const loadGalleryItems = async () => {
        setLoading(true);
        try {
            const data = await getGalleryItemsForExcalidraw();
            setItems(data as GalleryItem[]);
        } catch (error) {
            console.error("Failed to load gallery items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = (url: string) => {
        onSelectImage(url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border-2 border-black">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-black">
                    <h2 className="text-xl font-headline uppercase tracking-tighter flex items-center gap-2">
                        <ImageIcon size={24} />
                        Галерея изображений
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Gallery Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Загрузка...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Нет изображений в галерее
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectImage(item.url)}
                                    className="group relative aspect-square border-2 border-black rounded-lg overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
                                >
                                    <img
                                        src={item.url}
                                        alt={item.name || "Gallery image"}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                                            Вставить
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
