"use client";

import { useState, useCallback } from "react";
import { uploadGalleryImage, addExternalImage, deleteGalleryItem } from "./actions";
import { toast } from "sonner";
import { Trash2, Link as LinkIcon, Upload, Loader2, Copy, CheckCircle2 } from "lucide-react";
import Image from "next/image";

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

export default function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
    const [items, setItems] = useState<GalleryItem[]>(initialItems);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingUrl, setIsAddingUrl] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadGalleryImage(formData);
            if (result.success) {
                toast.success("Изображение загружено");
                // Refresh to sync
                window.location.reload();
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

    const handleExternalUrl = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const url = formData.get("url") as string;

        if (!url) return;

        setIsAddingUrl(true);
        try {
            const result = await addExternalImage(url);
            if (result.success) {
                toast.success("Ссылка добавлена");
                window.location.reload();
            } else {
                toast.error(result.error || "Ошибка добавления ссылки");
            }
        } catch (error) {
            toast.error("Ошибка добавления");
        } finally {
            setIsAddingUrl(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить это изображение?")) return;

        try {
            const result = await deleteGalleryItem(id);
            if (result.success) {
                toast.success("Изображение удалено");
                setItems(items.filter(item => item.id !== id));
            } else {
                toast.error(result.error || "Ошибка удаления");
            }
        } catch (error) {
            toast.error("Ошибка удалениия");
        }
    };

    const copyToClipboard = (url: string) => {
        const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Ссылка скопирована");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {/* Upload Form */}
                <div
                    className={`flex-1 space-y-4 border-2 border-dashed p-4 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <h3 className="font-bold uppercase tracking-widest text-sm">Загрузить изображение</h3>
                    <div className="flex items-center gap-4">
                        <label className={`cursor-pointer bg-black text-white px-6 py-3 font-bold uppercase hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            Выбрать файл
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                        <span className="text-xs text-zinc-500">
                            {isDragging ? "Отпустите файл для загрузки" : "Макс. размер: 5MB (или перетащите сюда)"}
                        </span>
                    </div>
                </div>

                {/* External URL Form */}
                <div className="flex-1 space-y-4 border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-6">
                    <h3 className="font-bold uppercase tracking-widest text-sm">Добавить внешнюю ссылку</h3>
                    <form onSubmit={handleExternalUrl} className="flex gap-2">
                        <input
                            name="url"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            required
                            className="flex-1 border-2 border-zinc-200 p-2 font-mono text-sm focus:border-black focus:outline-none"
                            disabled={isAddingUrl}
                        />
                        <button
                            type="submit"
                            disabled={isAddingUrl}
                            className="bg-zinc-200 hover:bg-zinc-300 px-4 py-2 font-bold uppercase disabled:opacity-50"
                        >
                            {isAddingUrl ? <Loader2 className="animate-spin" /> : <LinkIcon size={20} />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="group relative border-2 border-zinc-200 bg-white aspect-square flex items-center justify-center overflow-hidden hover:border-black transition-colors">
                        <div className="relative w-full h-full">
                            <Image
                                src={item.url}
                                alt={item.name || "Gallery Image"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => copyToClipboard(item.url)}
                                className="p-2 bg-white rounded-full hover:bg-zinc-200 transition-colors"
                                title="Копировать ссылку"
                            >
                                <Copy size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Удалить"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 text-white ${item.type === 'UPLOAD' ? 'bg-blue-600' : 'bg-green-600'}`}>
                                {item.type === 'UPLOAD' ? 'Файл' : 'Ссылка'}
                            </span>
                        </div>

                        {/* Usage Badge */}
                        {item.usageCount > 0 && (
                            <div className="absolute top-2 right-2 group/tooltip">
                                <div className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm shadow-sm">
                                    <CheckCircle2 size={12} />
                                    <span>{item.usageCount}</span>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute right-0 top-full mt-2 w-64 bg-black text-white text-xs p-3 rounded shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                                    <div className="font-bold mb-2 uppercase tracking-wider">Используется в:</div>

                                    {item.usedInArticles.length > 0 && (
                                        <div className="mb-2">
                                            <div className="text-emerald-400 font-semibold mb-1">Статьи ({item.usedInArticles.length}):</div>
                                            <ul className="list-disc list-inside space-y-1">
                                                {item.usedInArticles.map(article => (
                                                    <li key={article.id} className="truncate">{article.title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {item.usedInAds.length > 0 && (
                                        <div>
                                            <div className="text-blue-400 font-semibold mb-1">Реклама ({item.usedInAds.length}):</div>
                                            <ul className="list-disc list-inside space-y-1">
                                                {item.usedInAds.map(ad => (
                                                    <li key={ad.id} className="truncate">{ad.company}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-400 italic">
                        Галерея пуста. Загрузите изображения.
                    </div>
                )}
            </div>
        </div>
    );
}
