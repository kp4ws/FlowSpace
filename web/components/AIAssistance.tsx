"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Loader2, Mail, FileText, ChevronRight, Zap } from "lucide-react";
import api from "../lib/api";
import { cn } from "../lib/utils";
import { useTemplate } from "../context/TemplateContext";

export default function AIAssistance() {
    const { activeTemplate } = useTemplate();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"menu" | "email" | "summarize" | "research">("menu");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    // Form States
    const [emailForm, setEmailForm] = useState({ client_name: "", topic: "", context: "" });
    const [notesText, setNotesText] = useState("");
    const [researchTopic, setResearchTopic] = useState("");

    const handleGenerateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/ai/generate-email", emailForm);
            setResult(res.data.suggestion);
            setMode("menu");
        } catch (error) {
            console.error("AI Email Generation Error:", error);
            setResult("Failed to generate email draft.");
        } finally {
            setLoading(false);
        }
    };

    const handleSummarizeNotes = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/ai/summarize-notes", { notes: notesText });
            setResult(res.data.suggestion);
            setMode("menu");
        } catch (error) {
            console.error("AI Summarization Error:", error);
            setResult("Failed to summarize notes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border border-white/20",
                    isOpen
                        ? "bg-gray-900 text-white rotate-90 scale-90"
                        : activeTemplate.aiTheme === "blue" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" :
                            activeTemplate.aiTheme === "purple" ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20" :
                                activeTemplate.aiTheme === "slate" ? "bg-slate-600 hover:bg-slate-700 text-white shadow-slate-500/20" :
                                    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
                    !isOpen && "hover:scale-110 active:scale-95"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
            </button>

            {/* Assistance Panel */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform origin-bottom-right transition-all duration-300 scale-100 opacity-100">
                    {/* Header */}
                    <div className={cn(
                        "p-5 text-white bg-gradient-to-r",
                        activeTemplate.aiTheme === "blue" ? "from-blue-600 to-indigo-600" :
                            activeTemplate.aiTheme === "purple" ? "from-purple-600 to-pink-600" :
                                activeTemplate.aiTheme === "slate" ? "from-slate-600 to-slate-800" :
                                    "from-emerald-600 to-teal-600"
                    )}>
                        <h3 className="flex items-center gap-2 font-bold text-lg font-outfit uppercase">
                            Assistant
                        </h3>
                        <p className="text-white/70 text-xs mt-1">How can I help?</p>
                    </div>

                    <div className="p-5 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4 text-blue-600">
                                <Loader2 className="w-10 h-10 animate-spin" />
                                <p className="text-sm font-medium animate-pulse">Thinking...</p>
                            </div>
                        ) : mode === "menu" ? (
                            <div className="space-y-4">
                                {result && (
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-2">Latest Suggestion</p>
                                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                                            {result}
                                        </pre>
                                        <button
                                            onClick={() => setResult("")}
                                            className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
                                        >
                                            Clear Result
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setMode(activeTemplate.id === "freelancer" ? "email" : "research")}
                                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-700 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                                            {activeTemplate.id === "freelancer" ? <Mail className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {activeTemplate.id === "freelancer" ? "Draft Email" : "Analyze Experiment"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activeTemplate.id === "freelancer" ? "Quick follow-ups for clients" : "Statistical inference mockup"}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </button>

                                <button
                                    onClick={() => setMode("summarize")}
                                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-100 dark:border-gray-700 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 dark:text-white">Summarize Notes</p>
                                            <p className="text-xs text-gray-500">Get key takeaways quickly</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                                </button>
                            </div>
                        ) : mode === "email" ? (
                            <form onSubmit={handleGenerateEmail} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button onClick={() => setMode("menu")} className="text-xs font-bold text-blue-600 hover:underline">← Back to Menu</button>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase ml-1">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. John Doe"
                                        value={emailForm.client_name}
                                        onChange={(e) => setEmailForm({ ...emailForm, client_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase ml-1">Topic</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Project Proposal"
                                        value={emailForm.topic}
                                        onChange={(e) => setEmailForm({ ...emailForm, topic: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase ml-1">Additional Context</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Any specific points to mention?"
                                        value={emailForm.context}
                                        onChange={(e) => setEmailForm({ ...emailForm, context: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                    Generate Draft
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSummarizeNotes} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button onClick={() => setMode("menu")} className="text-xs font-bold text-purple-600 hover:underline">← Back to Menu</button>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase ml-1">Notes to Summarize</label>
                                    <textarea
                                        rows={8}
                                        required
                                        placeholder="Paste your client notes here..."
                                        value={notesText}
                                        onChange={(e) => setNotesText(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Summarize Now
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
