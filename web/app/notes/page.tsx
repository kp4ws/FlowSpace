"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useTemplate } from "../../context/TemplateContext";
import { cn } from "../../lib/utils";
import {
    NotebookPen,
    Plus,
    Search,
    Sparkles,
    Loader2,
    Trash2,
    Calendar,
    ChevronRight,
    CheckCircle2,
    Lightbulb
} from "lucide-react";

type Note = {
    id: number;
    content: string;
    created_at: string;
    client_id: number;
};

export default function NotesPage() {
    const { user } = useAuth();
    const { activeTemplate } = useTemplate();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newNote, setNewNote] = useState({ content: "", client_id: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiResult, setAiResult] = useState<{ summary: string; actions: string[] } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        fetchNotes();
        // Trigger background sync on mount
        import('../../lib/sync').then(m => m.syncNotes());
    }, []);

    const fetchNotes = async () => {
        try {
            // 1. Try fetching from network
            const res = await api.get("/notes/");
            const items = res.data;

            // 2. Update local DB (Clear and refill for simplicity in MVP)
            await import('../../lib/db').then(async ({ db }) => {
                await db.notes.clear();
                await db.notes.bulkAdd(items.map((n: any) => ({ ...n, is_synced: 1 })));
            });

            setNotes(items);
        } catch (error) {
            console.warn("Offline or API Error. Loading from local storage.", error);
            // 3. Fallback to local IndexedDB
            const { db } = await import('../../lib/db');
            const localItems = await db.notes.toArray();
            setNotes(localItems as any);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const noteData = {
            content: newNote.content,
            client_id: 1, // Mock
            created_at: new Date().toISOString(),
            is_synced: 0
        };

        try {
            // 1. Optimistic UI & Local Save
            const { db } = await import('../../lib/db');
            const localId = await db.notes.add(noteData);
            setNotes([{ ...noteData, id: localId } as any, ...notes]);
            setNewNote({ content: "", client_id: "" });
            setIsCreating(false);

            // 2. Attempt Background Sync
            const { syncNotes } = await import('../../lib/sync');
            await syncNotes();

            // 3. Refresh list from DB to get server IDs
            const updatedNotes = await db.notes.toArray();
            setNotes(updatedNotes as any);
        } catch (error) {
            console.error("Error creating note:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            await api.delete(`/notes/${id}`);
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    const handleMagicAi = async (content: string) => {
        setIsAiLoading(true);
        try {
            // Simulate AI intelligence based on template
            // In a real app, this would call /ai/summarize-notes or a new /ai/extract-actions
            const templateType = activeTemplate.id;

            await new Promise(r => setTimeout(r, 1500)); // Simulate thinking

            if (templateType === "freelancer") {
                setAiResult({
                    summary: "Client meeting notes regarding the upcoming project milestone.",
                    actions: [
                        "Draft follow-up email to John",
                        "Update the project estimate",
                        "Schedule a review meeting for Friday"
                    ]
                });
            } else {
                setAiResult({
                    summary: "Lab observations for the neural network training run.",
                    actions: [
                        "Inspect GPU logs for epoch 45",
                        "Tune learning rate to 0.001",
                        "Rethink data augmentation strategy"
                    ]
                });
            }
        } catch (error) {
            console.error("Magic AI Error:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-2 font-outfit capitalize">
                        {activeTemplate.id === "freelancer" ? "Smart Notes" : "Lab Notebook"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium capitalize">
                        Manage your {activeTemplate.entitiesLabel.toLowerCase()} and key insights.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Entry
                </button>
            </header>

            {isCreating && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleCreateNote} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
                        <textarea
                            required
                            placeholder="What's on your mind? Capture it here..."
                            className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl mb-4 focus:ring-4 focus:ring-blue-500/10 text-lg transition-all resize-none dark:text-white"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 text-gray-500 hover:text-gray-700 font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Entry"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notes List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <NotebookPen className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">Empty Page</h3>
                            <p className="text-gray-500 mt-1">Start capturing your thoughts today.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="group bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/10 px-3 py-1.5 rounded-full">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(note.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleMagicAi(note.content)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                            title="Magic AI Analysis"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {note.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* AI Insights Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-2xl sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">AI Workspace</h2>
                        </div>

                        {isAiLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-white/50" />
                                <p className="text-sm font-medium animate-pulse">Analyzing entries...</p>
                            </div>
                        ) : aiResult ? (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-3 h-3" />
                                        Smart Summary
                                    </h3>
                                    <p className="text-sm leading-relaxed font-medium">
                                        {aiResult.summary}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Action Items
                                    </h3>
                                    <div className="space-y-2">
                                        {aiResult.actions.map((action, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-white/10 rounded-2xl hover:bg-white/15 transition-colors group cursor-pointer">
                                                <div className="w-4 h-4 rounded-full border-2 border-white/40 mt-0.5 group-hover:border-white transition-colors" />
                                                <span className="text-xs font-semibold">{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setAiResult(null)}
                                    className="w-full py-3 bg-white text-indigo-700 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Dismiss Insights
                                </button>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                    <Sparkles className="w-8 h-8 text-white/40" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Power Up Your Notes</h3>
                                <p className="text-white/60 text-xs leading-relaxed">
                                    Click the Sparkles on any note to extract action items and summaries tailored to your **{activeTemplate.name}** workflow.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Tips</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                Use #tags to categorize entries easily across modules.
                            </li>
                            <li className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                                The AI Assistant can draft emails directly from your insights.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
