"use client"

import React, { useState } from 'react'
import { createCategory, updateCategory } from './actions'
import { toast } from 'sonner'
import { Edit2, Check, X, Plus } from 'lucide-react'

export default function CategoryList({ initialCategories }: { initialCategories: any[] }) {
    const [categories, setCategories] = useState(initialCategories)
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCreate = async () => {
        if (!newName.trim()) return
        if (categories.length >= 8) {
            toast.error("Максимальное количество категорий - 8")
            return
        }

        setIsSubmitting(true)
        const res = await createCategory(newName)
        if (res.success) {
            toast.success(res.message)
            setNewName('')
            // This is a naive refresh, ideally actions should return the new object or revalidate
            window.location.reload()
        } else {
            toast.error(res.message)
        }
        setIsSubmitting(false)
    }

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return
        setIsSubmitting(true)
        const res = await updateCategory(id, editName)
        if (res.success) {
            toast.success(res.message)
            setEditingId(null)
            window.location.reload()
        } else {
            toast.error(res.message)
        }
        setIsSubmitting(false)
    }


    return (
        <div className="space-y-6">
            {/* Create New */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Название новой категории"
                    className="flex-grow border-2 border-black p-2 font-bold focus:outline-none focus:bg-zinc-50"
                    disabled={categories.length >= 8 || isSubmitting}
                />
                <button
                    onClick={handleCreate}
                    disabled={categories.length >= 8 || isSubmitting || !newName.trim()}
                    className="bg-black text-white px-4 py-2 font-bold uppercase disabled:bg-zinc-300 flex items-center gap-2"
                >
                    <Plus size={18} /> Добавить
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between border-2 border-black p-3 hover:bg-zinc-50 transition-colors">
                        {editingId === cat.id ? (
                            <div className="flex-grow flex gap-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-grow border-b-2 border-black p-1 font-bold focus:outline-none bg-transparent"
                                />
                                <button onClick={() => handleUpdate(cat.id)} className="text-green-700 p-1 hover:bg-green-50"><Check size={20} /></button>
                                <button onClick={() => setEditingId(null)} className="text-red-700 p-1 hover:bg-red-50"><X size={20} /></button>
                            </div>
                        ) : (
                            <>
                                <span className="font-bold text-lg">{cat.name}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(cat.id)
                                            setEditName(cat.name)
                                        }}
                                        className="p-2 border border-zinc-200 hover:border-black transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {categories.length === 0 && (
                    <p className="text-center text-zinc-500 py-4 italic border-2 border-dashed border-zinc-300">Категории не созданы</p>
                )}
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Заполнено: {categories.length} / 8
            </div>
        </div>
    )
}
