"use client";

import React from "react";
import { X, Check, Lock, ArrowRight, Plus, LayoutDashboard, Users, Heart, Share2, Globe, User, GraduationCap } from "lucide-react";
import { Template, TEMPLATES } from "../lib/templates";
import { useTemplate } from "../context/TemplateContext";
import { cn } from "../lib/utils";

export default function TemplateGallery({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const {
        activeTemplate,
        applyTemplate,
        availableTemplates,
        customTemplates,
        deleteCustomTemplate,
        favoritedIds,
        toggleFavorite,
        marketplaceWorkspaces,
        shareWorkspace,
        toggleLike,
        likedIds
    } = useTemplate();
    const [activeTab, setActiveTab] = React.useState<'presets' | 'marketplace' | 'custom' | 'favorites'>('presets');

    if (!isOpen) return null;

    const allTemplates = [...availableTemplates, ...marketplaceWorkspaces, ...customTemplates];
    const filteredTemplates =
        activeTab === 'presets' ? availableTemplates :
            activeTab === 'marketplace' ? marketplaceWorkspaces :
                activeTab === 'custom' ? customTemplates :
                    allTemplates.filter(t => favoritedIds.includes(t.id));

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 italic-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">

                    {/* Left: Intro Sidebar */}
                    <div className="lg:w-1/3 bg-gray-50 dark:bg-white/5 p-10 border-r border-gray-100 dark:border-white/5 flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/20">
                                <Plus className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-4">
                                WORKSPACE<br />MARKETPLACE
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                Explore community layouts, use pro presets, or manage your personal workspace architecture.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('presets')}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold flex items-center gap-3 px-6 transition-all",
                                        activeTab === 'presets' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                                    )}
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    System Presets
                                </button>
                                <button
                                    onClick={() => setActiveTab('marketplace')}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold flex items-center gap-3 px-6 transition-all",
                                        activeTab === 'marketplace' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                                    )}
                                >
                                    <Globe className="w-5 h-5" />
                                    Marketplace
                                </button>
                                <button
                                    onClick={() => setActiveTab('custom')}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold flex items-center gap-3 px-6 transition-all",
                                        activeTab === 'custom' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                                    )}
                                >
                                    <User className="w-5 h-5" />
                                    My Spaces
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold flex items-center gap-3 px-6 transition-all",
                                        activeTab === 'favorites' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                                    )}
                                >
                                    <Heart className="w-5 h-5" />
                                    Favorites
                                </button>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Import System</p>
                                <p className="text-[11px] text-gray-500 font-medium">Templates are applied as a baseline. You can modify your workspace freely after importing.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Grid of Templates */}
                    <div className="lg:w-2/3 p-6 sm:p-10 overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                {activeTab === 'presets' && "System Presets"}
                                {activeTab === 'marketplace' && "Community Shared"}
                                {activeTab === 'custom' && "Personal Library"}
                                {activeTab === 'favorites' && "Saved Collections"}
                            </span>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10">
                            {filteredTemplates.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
                                    <LayoutDashboard className="w-12 h-12 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No layouts found in this category.</p>
                                </div>
                            )}
                            {filteredTemplates.map((t) => {
                                const isCustom = 'isCustom' in t;
                                const isFavorited = favoritedIds.includes(t.id);
                                return (
                                    <div
                                        key={t.id}
                                        className={cn(
                                            "group block relative text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300",
                                            "bg-white dark:bg-gray-800/50 border-slate-100 dark:border-white/5 hover:border-blue-500/30 hover:shadow-xl",
                                            !isCustom && activeTab === 'presets' && t.isPremium && "opacity-60 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                                                t.previewColor || "bg-blue-600"
                                            )}>
                                                {t.id === 'student' ? <GraduationCap className="w-6 h-6" /> : (isCustom ? <Users className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(t.id);
                                                    }}
                                                    className={cn(
                                                        "p-2 rounded-xl transition-all",
                                                        isFavorited ? "bg-red-50 text-red-500 dark:bg-red-900/20" : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500"
                                                    )}
                                                    title="Add to personal favorites"
                                                >
                                                    <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                                                </button>
                                                {activeTab === 'marketplace' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleLike(t.id);
                                                        }}
                                                        className={cn(
                                                            "p-2 rounded-xl transition-all flex items-center gap-1.5",
                                                            likedIds.includes(t.id) ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-500"
                                                        )}
                                                        title="Like this layout"
                                                    >
                                                        <Globe className={cn("w-4 h-4", likedIds.includes(t.id) && "fill-current")} />
                                                        <span className="text-[10px] font-bold">{(t as any).likesCount || 0}</span>
                                                    </button>
                                                )}
                                                {isCustom && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                shareWorkspace(t as any);
                                                            }}
                                                            className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-500 rounded-xl transition-all"
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteCustomTemplate(t.id);
                                                            }}
                                                            className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black italic tracking-tighter mb-1 text-slate-900 dark:text-white">
                                            {t.name.toUpperCase()}
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-blue-500">
                                            {t.tagline}
                                        </p>
                                        <p className="text-xs leading-relaxed line-clamp-2 text-slate-500 mb-4">
                                            {t.description}
                                        </p>

                                        {activeTab === 'marketplace' && (
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Globe className="w-3 h-3 fill-blue-500 text-blue-500" />
                                                    {(t as any).likesCount || 0} Global Likes
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Users className="w-3 h-3" />
                                                    {Math.floor(Math.random() * 50)} Community Imports
                                                </div>
                                            </div>
                                        )}

                                        {(!t.isPremium || isCustom) && (
                                            <button
                                                onClick={() => {
                                                    applyTemplate(t);
                                                    onClose();
                                                }}
                                                className="mt-6 flex items-center justify-center w-full py-4 bg-slate-50 dark:bg-white/5 group-hover:bg-blue-600 group-hover:text-white rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-widest border border-slate-100 dark:border-white/5"
                                            >
                                                Import {t.name}
                                                <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
