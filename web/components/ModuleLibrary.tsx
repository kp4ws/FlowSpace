"use client";

import React from "react";
import { X, Check, Lock, Zap, Sparkles } from "lucide-react";
import { useTemplate } from "../context/TemplateContext";
import { ALL_MODULES, getIcon } from "../lib/templates";
import { cn } from "../lib/utils";

type ModuleLibraryProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ModuleLibrary({ isOpen, onClose }: ModuleLibraryProps) {
    const { activeTemplate, enabledModuleIds, toggleModule } = useTemplate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-4xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-outfit uppercase">
                                    Module Marketplace
                                </h2>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">
                                Enable specialized functionality for your <span className="text-blue-500 font-bold">{activeTemplate.name}</span> workspace.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                        >
                            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                        </button>
                    </div>

                    {/* Module Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                        {ALL_MODULES.map((module) => {
                            const Icon = getIcon(module.iconName);
                            const isEnabled = enabledModuleIds.includes(module.id);

                            return (
                                <div
                                    key={module.id}
                                    className={cn(
                                        "relative group flex flex-col p-6 rounded-[2.5rem] border transition-all duration-300",
                                        isEnabled
                                            ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500/30"
                                            : "bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110",
                                            isEnabled ? "bg-white dark:bg-blue-500 text-blue-500 dark:text-white" : "bg-white dark:bg-gray-800 text-gray-400"
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        <button
                                            onClick={() => !module.isPremium && toggleModule(module.id)}
                                            disabled={module.isPremium}
                                            className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                                                module.isPremium
                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 cursor-not-allowed"
                                                    : isEnabled
                                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                                        : "bg-gray-200 dark:bg-white/10 text-gray-400 hover:bg-gray-300 dark:hover:bg-white/20"
                                            )}
                                        >
                                            {module.isPremium ? <Lock className="w-5 h-5" /> : isEnabled ? <Check className="w-5 h-5" /> : <PlusCircle className="w-5 h-5 invisible group-hover:visible" />}
                                        </button>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                                {module.label}
                                            </h4>
                                            {module.isPremium && (
                                                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-[8px] font-black text-white rounded-full uppercase tracking-tighter">
                                                    PRO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                            {module.description}
                                        </p>
                                    </div>

                                    {/* Overlay for Premium */}
                                    {module.isPremium && (
                                        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                Upgrade to Unlock
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Changes are saved instantly
                        </div>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all text-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { PlusCircle } from "lucide-react";
