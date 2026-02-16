"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sparkles,
    LayoutDashboard,
    Database,
    FileText,
    NotebookPen,
    Menu,
    X,
    LogOut, Plus, Zap, Activity, DollarSign, Users, Sun, Moon, Monitor
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTemplate } from "../context/TemplateContext";
import { useTheme } from "../context/ThemeContext";
import { getIcon } from "../lib/templates";
import { cn } from "../lib/utils";
import TemplateGallery from "./TemplateGallery";
import ModuleLibrary from "./ModuleLibrary";
import { ALL_MODULES } from "../lib/templates";

export default function Sidebar() {
    const pathname = usePathname();
    const { signOut, user } = useAuth();
    const { activeTemplate, enabledModuleIds } = useTemplate();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isModuleLibraryOpen, setIsModuleLibraryOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    const toggleSidebar = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsGalleryOpen(false);
                setIsModuleLibraryOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const enabledModules = ALL_MODULES.filter(m => enabledModuleIds.includes(m.id));

    return (
        <>
            <TemplateGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
            <ModuleLibrary isOpen={isModuleLibraryOpen} onClose={() => setIsModuleLibraryOpen(false)} />

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 flex flex-col shadow-2xl md:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0"
            )}>
                <div className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white font-outfit uppercase">
                                FlowSpace<span className="text-blue-600">.</span>
                            </h1>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] font-outfit mt-1 text-blue-600/80">
                                Focus & Performance
                            </p>
                        </div>
                        {!isOnline && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Offline</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 mb-8 mt-4">
                    <button
                        onClick={() => setIsGalleryOpen(true)}
                        className="w-full relative px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all flex items-center justify-between group/btn"
                    >
                        <div className="flex items-center gap-3">
                            <Plus className="w-4 h-4 text-blue-600 transition-transform group-hover/btn:rotate-90" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Import Template</span>
                        </div>
                        <Activity className="w-3.5 h-3.5 text-blue-600/40" />
                    </button>
                </div>

                {/* Module Library Button moved into main nav items or kept as is if preferred */}

                <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
                    <div className="px-4 mb-4">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Workspace</span>
                    </div>

                    {enabledModules.map((item) => {
                        const Icon = getIcon(item.iconName);
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-50")} />
                                <span className="font-medium text-sm tracking-tight">{item.label}</span>
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-800 space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                        {[
                            { id: 'light', icon: Sun },
                            { id: 'system', icon: Monitor },
                            { id: 'dark', icon: Moon }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center py-2 rounded-lg transition-all",
                                    theme === t.id
                                        ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600"
                                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                <t.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {user?.email?.[0].toUpperCase() ?? "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate dark:text-white leading-none mb-1">{user?.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5 opacity-50" />
                        <span className="font-bold uppercase text-[10px] tracking-widest">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
