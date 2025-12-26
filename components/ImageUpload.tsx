"use client";

import React, { useState, useRef, useTransition } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/app/admin/upload-action";

interface ImageUploadProps {
    name: string;
    defaultValue?: string | null;
}

export default function ImageUpload({ name, defaultValue }: ImageUploadProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(defaultValue || null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const result = await uploadImage(formData);
            if (result.success && result.url) {
                setImageUrl(result.url);
            } else {
                setError(result.error || "Upload failed");
            }
        });
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div className="w-full">
            {/* Hidden inputs to store the actual value for the form submission */}
            <input type="hidden" name={name} value={imageUrl || ""} />

            {!imageUrl ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`
                        border-2 border-dashed p-8 text-center cursor-pointer transition-colors relative
                        flex flex-col items-center justify-center min-h-[200px]
                        ${isDragging ? "border-blue-500 bg-blue-50" : "border-zinc-300 hover:border-zinc-800 bg-white"}
                        ${error ? "border-red-500 bg-red-50" : ""}
                    `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && e.target.files.length > 0 && handleFile(e.target.files[0])}
                        className="hidden"
                        accept="image/*"
                    />

                    {isPending ? (
                        <div className="flex flex-col items-center text-zinc-500">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span className="text-xs font-bold uppercase tracking-widest">Загрузка...</span>
                        </div>
                    ) : (
                        <>
                            <Upload size={32} className="mb-2 text-zinc-400" />
                            <p className="font-bold text-sm mb-1">Нажмите или перетащите фото сюда</p>
                            <p className="text-xs text-zinc-500">JPG, PNG, WEBP (до 5MB)</p>
                        </>
                    )}

                    {error && (
                        <p className="mt-4 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 absolute bottom-2">
                            {error}
                        </p>
                    )}
                </div>
            ) : (
                <div className="relative border-2 border-black bg-zinc-100 group">
                    <img
                        src={imageUrl}
                        alt="Uploaded preview"
                        className={`w-full h-auto max-h-[400px] object-cover ${isPending ? "opacity-50" : ""}`}
                    />

                    {isPending && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={48} />
                        </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-sm border border-black transition-opacity opacity-0 group-hover:opacity-100"
                            title="Replace"
                        >
                            <ImageIcon size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageUrl(null)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-sm border border-black transition-opacity opacity-0 group-hover:opacity-100"
                            title="Remove"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Hidden input to allow replacing even when reviewing */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && e.target.files.length > 0 && handleFile(e.target.files[0])}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            )}
        </div>
    );
}
