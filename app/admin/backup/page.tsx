"use client"

import { useState } from "react"
import Link from "next/link"
import { generateBackup } from "./actions"
import { toast } from "sonner"

export default function BackupPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleBackup = async () => {
        setIsLoading(true)
        try {
            const data = await generateBackup()

            // Create a blob and download it
            const blob = new Blob([data], { type: "application/json" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `bcn_backup_${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success("Резервная копия успешно создана и скачана")
        } catch (error) {
            console.error(error)
            toast.error("Ошибка при создании резервной копии")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-serif-body">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b-2 border-black pb-4">
                    <div>
                        <Link href="/admin" className="text-zinc-500 hover:text-black text-sm font-bold uppercase tracking-widest block mb-2">← Назад в панель</Link>
                        <h1 className="font-headline text-3xl sm:text-4xl uppercase tracking-tighter">
                            Резервное копирование
                        </h1>
                    </div>
                </div>

                <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h2 className="font-newspaper text-2xl font-bold mb-2">Экспорт базы данных</h2>
                            <p className="text-zinc-600 mb-4">
                                Создание полной резервной копии всех данных (пользователи, статьи, реклама, настройки) в формате JSON.
                                Файл будет автоматически скачан на ваше устройство.
                            </p>

                            <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded text-sm text-amber-800">
                                <strong>Внимание:</strong> Резервная копия содержит конфиденциальные данные пользователей. Храните этот файл в надежном месте.
                            </div>
                        </div>

                        <button
                            onClick={handleBackup}
                            disabled={isLoading}
                            className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-zinc-800 transition-colors self-start flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Создание копии...
                                </>
                            ) : (
                                <>
                                    💾 Скачать резервную копию
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
