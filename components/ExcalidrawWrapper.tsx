"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { getExcalidrawBoard, updateExcalidrawBoard } from "@/app/actions/excalidraw";
import SnapshotModal from "./SnapshotModal";
import GalleryPickerModal from "./GalleryPickerModal";
import { History, Image as ImageIcon } from "lucide-react";

// Dynamically import Excalidraw ONLY on the client
const Excalidraw = dynamic(
    async () => {
        const comp = await import("@excalidraw/excalidraw");
        return comp.Excalidraw;
    },
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
                    <p className="font-headline uppercase tracking-tighter text-xl">Загрузка доски...</p>
                </div>
            </div>
        ),
    }
);

const ExcalidrawWrapper = () => {
    const [initialData, setInitialData] = useState<any>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [showSnapshotModal, setShowSnapshotModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load initial data from database on mount
    useEffect(() => {
        getExcalidrawBoard().then((board) => {
            if (board) {
                // Sanitize appState to ensure collaborators is a Map
                const appState = (board.appState as Record<string, any>) || {};
                if (appState.collaborators && !(appState.collaborators instanceof Map)) {
                    appState.collaborators = new Map();
                }

                setInitialData({
                    elements: board.elements,
                    appState: appState,
                    files: board.files || {},
                });
            }
        }).catch((error) => {
            console.error("Failed to load Excalidraw board:", error);
        });
    }, []);

    // Debounced save function - saves 2 seconds after last change
    const handleChange = useCallback((elements: any, appState: any, files: any) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            updateExcalidrawBoard(elements, appState, files).catch((error) => {
                console.error("Failed to save Excalidraw board:", error);
            });
        }, 2000);
    }, []);

    // Handle snapshot load
    const handleLoadSnapshot = (data: { elements: any; appState: any; files?: any }) => {
        if (excalidrawAPI) {
            // Sanitize appState to ensure collaborators is a Map
            const appState = data.appState as Record<string, any>;
            if (appState.collaborators && !(appState.collaborators instanceof Map)) {
                appState.collaborators = new Map();
            }

            excalidrawAPI.updateScene({
                elements: data.elements,
                appState: appState,
            });

            // Add files if present
            if (data.files) {
                const filesArray = Object.entries(data.files).map(([id, fileData]: [string, any]) => ({
                    id,
                    dataURL: fileData.dataURL,
                    mimeType: fileData.mimeType,
                    created: fileData.created,
                }));
                if (filesArray.length > 0) {
                    excalidrawAPI.addFiles(filesArray);
                }
            }
        }
    };

    // Handle gallery image insertion
    const handleSelectImage = async (url: string) => {
        if (!excalidrawAPI) return;

        try {
            // Fetch the image and convert to blob
            const response = await fetch(url);
            const blob = await response.blob();

            // Get image dimensions
            const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.src = url;
            });

            // Create a unique file ID
            const fileId = `image-${Date.now()}`;

            // Add the file to Excalidraw first
            await excalidrawAPI.addFiles([{
                id: fileId,
                dataURL: url,
                mimeType: blob.type,
                created: Date.now(),
            }]);

            // Get current app state for positioning
            const appState = excalidrawAPI.getAppState();
            const viewportCenter = {
                x: (appState.scrollX || 0) + ((appState.width || window.innerWidth) / 2),
                y: (appState.scrollY || 0) + ((appState.height || window.innerHeight) / 2),
            };

            // Calculate scaled dimensions
            const scaledWidth = width / 2;
            const scaledHeight = height / 2;

            // Create a proper Excalidraw image element with all required properties
            const imageElement = {
                type: "image",
                version: 1,
                versionNonce: Math.floor(Math.random() * 1000000000),
                isDeleted: false,
                id: `img-${Date.now()}`,
                fillStyle: "solid",
                strokeWidth: 0,
                strokeStyle: "solid",
                roughness: 0,
                opacity: 100,
                angle: 0,
                x: viewportCenter.x - scaledWidth / 2,
                y: viewportCenter.y - scaledHeight / 2,
                strokeColor: "transparent",
                backgroundColor: "transparent",
                width: scaledWidth,
                height: scaledHeight,
                seed: Math.floor(Math.random() * 1000000000),
                groupIds: [],
                frameId: null,
                roundness: null,
                boundElements: null,
                updated: Date.now(),
                link: null,
                locked: false,
                fileId: fileId,
                status: "saved",
                scale: [1, 1],
            };

            // Get existing elements safely
            const existingElements = excalidrawAPI.getSceneElements() || [];

            // Update the scene with the new image element
            excalidrawAPI.updateScene({
                elements: [...existingElements, imageElement],
            });
        } catch (error) {
            console.error("Failed to insert image:", error);
            alert("Не удалось вставить изображение");
        }
    };

    return (
        <div style={{ height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, overflow: "hidden" }}>
            {/* Floating Action Buttons */}
            <div className="fixed top-16 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => setShowSnapshotModal(true)}
                    className="px-4 py-3 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 font-bold uppercase text-sm"
                    title="Снимки"
                >
                    <History size={18} />
                    Снимки
                </button>
                <button
                    onClick={() => setShowGalleryModal(true)}
                    className="px-4 py-3 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 font-bold uppercase text-sm"
                    title="Галерея"
                >
                    <ImageIcon size={18} />
                    Галерея
                </button>
            </div>

            <Excalidraw
                langCode="ru-RU"
                initialData={initialData}
                onChange={handleChange}
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                UIOptions={{
                    canvasActions: {
                        changeViewBackgroundColor: true,
                        clearCanvas: true,
                        export: { saveFileToDisk: true },
                        loadScene: true,
                        saveToActiveFile: true,
                        toggleTheme: true,
                    },
                }}
            />

            {/* Modals */}
            <SnapshotModal
                isOpen={showSnapshotModal}
                onClose={() => setShowSnapshotModal(false)}
                onLoadSnapshot={handleLoadSnapshot}
                currentElements={excalidrawAPI?.getSceneElements() || []}
                currentAppState={excalidrawAPI?.getAppState() || {}}
                currentFiles={excalidrawAPI?.getFiles() || {}}
            />

            <GalleryPickerModal
                isOpen={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
                onSelectImage={handleSelectImage}
            />
        </div>
    );
};

export default ExcalidrawWrapper;
