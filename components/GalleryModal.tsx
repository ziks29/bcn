"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Upload, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { getGalleryItemsWithUsage, uploadGalleryImage, addExternalImage } from "@/app/admin/gallery/actions";
import { toast } from "sonner";

interface GalleryItem {
    id: string;
    url: string;
    name: string | null;
    type: string;
    createdAt: Date;
    usageCount: number;
    usedInArticles: Array<{ id: string; title: string }>;
    usedInAds: Array<{ id: string; company: string }>;
}

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export default function GalleryModal({ isOpen, onClose, onSelect }: GalleryModalProps) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingUrl, setIsAddingUrl] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const urlInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadItems();
        }
    }, [isOpen]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await getGalleryItemsWithUsage();
            setItems(data);
        } catch (error) {
            console.error("Failed to load gallery items", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadGalleryImage(formData);
            if (result.success && result.url) {
                toast.success("Изображение загружено");
                loadItems(); // Reload list
            } else {
                toast.error(result.error || "Ошибка загрузки");
            }
        } catch (error) {
            toast.error("Произошла ошибка");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    // Drag and Drop handlers
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleExternalUrl = async () => {
        const url = urlInputRef.current?.value || "";

        console.log("GalleryModal: Attempting to add external URL:", url);

        if (!url) {
            console.warn("GalleryModal: URL is empty, skipping submission");
            return;
        }

        setIsAddingUrl(true);
        try {
            const result = await addExternalImage(url);
            if (result.success) {
                toast.success("Ссылка добавлена");
                loadItems();
                if (urlInputRef.current) urlInputRef.current.value = "";
            } else {
                toast.error(result.error || "Ошибка добавления");
            }
        } catch (error) {
            toast.error("Ошибка добавления");
        } finally {
            setIsAddingUrl(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleExternalUrl();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b-2 border-black bg-zinc-50">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Галерея</h2>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b-2 border-zinc-200 flex flex-col md:flex-row gap-4 bg-white">
                    <div
                        className={`flex gap-4 items-center border-2 border-dashed p-2 px-4 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        <label className={`cursor-pointer bg-black text-white px-4 py-2 font-bold uppercase hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 text-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            Загрузить
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                        <span className="text-xs text-zinc-500 hidden sm:inline">
                            {isDragging ? "Отпустите файл" : "или перетащите сюда"}
                        </span>
                    </div>

                    <div className="flex gap-2 flex-1">
                        <input
                            ref={urlInputRef}
                            type="url"
                            placeholder="Внешняя ссылка..."
                            className="flex-1 border-2 border-zinc-200 p-2 font-mono text-sm focus:border-black focus:outline-none"
                            disabled={isAddingUrl}
                            onKeyDown={handleInputKeyDown}
                        />
                        <button
                            type="button"
                            onClick={handleExternalUrl}
                            disabled={isAddingUrl}
                            className="bg-zinc-200 hover:bg-zinc-300 px-3 py-2 font-bold uppercase disabled:opacity-50"
                        >
                            {isAddingUrl ? <Loader2 className="animate-spin" size={16} /> : <LinkIcon size={16} />}
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 bg-zinc-100">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-zinc-400" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item.url)}
                                    className="group relative border-2 border-zinc-200 bg-white aspect-square flex items-center justify-center overflow-hidden hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={item.url}
                                            alt={item.name || "Gallery Image"}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                    {/* Usage Badge */}
                                    {item.usageCount > 0 && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm shadow-sm">
                                            <CheckCircle2 size={12} />
                                            <span>{item.usageCount}</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-full py-12 text-center text-zinc-400 italic">
                                    Нет изображений. Загрузите что-нибудь!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
