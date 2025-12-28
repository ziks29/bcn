"use client";

import { useState, useEffect, useRef } from "react";
import RichTextEditor from "./RichTextEditor";
import { Save, Clock } from "lucide-react";

interface ArticleEditorProps {
    initialContent?: string;
    articleId?: string;
    onDraftClear?: () => void;
}

interface DraftData {
    content: string;
    timestamp: number;
    title?: string;
}

export default function ArticleEditorInput({
    initialContent = "",
    articleId = "new",
    onDraftClear
}: ArticleEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const draftKey = `article-draft-${articleId}`;

    // Load draft on mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const savedDraft = localStorage.getItem(draftKey);
                if (savedDraft) {
                    const draft: DraftData = JSON.parse(savedDraft);
                    const draftAge = Date.now() - draft.timestamp;
                    const sevenDays = 7 * 24 * 60 * 60 * 1000;

                    // Clean up drafts older than 7 days
                    if (draftAge > sevenDays) {
                        localStorage.removeItem(draftKey);
                        return;
                    }

                    // Only show prompt if draft is different from initial content
                    if (draft.content !== initialContent && draft.content.trim() !== "") {
                        setShowDraftPrompt(true);
                    }
                }
            } catch (error) {
                console.error("Failed to load draft:", error);
            }
        };

        loadDraft();
    }, [draftKey, initialContent]);

    // Autosave with debounce
    useEffect(() => {
        // Don't autosave if content is empty or same as initial
        if (!content || content === initialContent) {
            return;
        }

        setAutosaveStatus("saving");

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for 2 seconds
        saveTimeoutRef.current = setTimeout(() => {
            try {
                const draft: DraftData = {
                    content,
                    timestamp: Date.now()
                };
                localStorage.setItem(draftKey, JSON.stringify(draft));
                setAutosaveStatus("saved");
                setLastSaved(new Date());

                // Reset to idle after 3 seconds
                setTimeout(() => setAutosaveStatus("idle"), 3000);
            } catch (error) {
                console.error("Failed to save draft:", error);
                setAutosaveStatus("idle");
            }
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content, draftKey, initialContent]);

    // Clear draft function
    const clearDraft = () => {
        try {
            localStorage.removeItem(draftKey);
            onDraftClear?.();
        } catch (error) {
            console.error("Failed to clear draft:", error);
        }
    };

    // Restore draft
    const restoreDraft = () => {
        try {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                const draft: DraftData = JSON.parse(savedDraft);
                setContent(draft.content);
                setShowDraftPrompt(false);
            }
        } catch (error) {
            console.error("Failed to restore draft:", error);
        }
    };

    // Dismiss draft prompt
    const dismissDraft = () => {
        setShowDraftPrompt(false);
        clearDraft();
    };

    // Expose clear draft function globally for form submission
    useEffect(() => {
        (window as any).__clearArticleDraft = clearDraft;
        return () => {
            delete (window as any).__clearArticleDraft;
        };
    }, [draftKey]);

    return (
        <div className="w-full">
            {/* Draft Restoration Prompt */}
            {showDraftPrompt && (
                <div className="mb-4 border-2 border-amber-600 bg-amber-50 p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Clock className="text-amber-600 mt-1" size={20} />
                        <div>
                            <p className="font-bold text-sm">Найден несохраненный черновик</p>
                            <p className="text-xs text-zinc-600 mt-1">Восстановить автосохраненную версию?</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={restoreDraft}
                            className="px-3 py-1 bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                        >
                            Восстановить
                        </button>
                        <button
                            type="button"
                            onClick={dismissDraft}
                            className="px-3 py-1 border border-zinc-300 text-xs hover:bg-zinc-100"
                        >
                            Отклонить
                        </button>
                    </div>
                </div>
            )}

            {/* Autosave Status Indicator */}
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 min-h-[20px]">
                {autosaveStatus === "saving" && (
                    <>
                        <Save size={14} className="animate-pulse" />
                        <span>Сохранение...</span>
                    </>
                )}
                {autosaveStatus === "saved" && (
                    <>
                        <Save size={14} className="text-green-600" />
                        <span className="text-green-600">Сохранено на устройстве</span>
                        {lastSaved && (
                            <span className="text-zinc-400">
                                {lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </>
                )}
            </div>

            <RichTextEditor content={content} onChange={setContent} />
            <textarea
                name="content"
                value={content}
                readOnly
                className="hidden"
            />
        </div>
    );
}
