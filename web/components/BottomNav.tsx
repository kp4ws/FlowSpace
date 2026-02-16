"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTemplate } from "../context/TemplateContext";
import { ALL_MODULES, getIcon } from "../lib/templates";
import { cn } from "../lib/utils";
import { LayoutDashboard } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();
    const { enabledModuleIds } = useTemplate();

    // Get only enabled modules for mobile nav
    const enabledModules = ALL_MODULES.filter(m => enabledModuleIds.includes(m.id));

    // Only show first 4 to avoid overcrowding
    const visibleModules = enabledModules.slice(0, 4);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 px-4 py-2 flex items-center justify-around md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-none animate-in slide-in-from-bottom duration-500">
            <Link
                href="/"
                className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all",
                    pathname === "/" ? "text-blue-600 scale-110" : "text-gray-400 opacity-60 hover:opacity-100"
                )}
            >
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-bold tracking-tight uppercase font-outfit">Hub</span>
            </Link>

            {visibleModules.map((item) => {
                const Icon = getIcon(item.iconName);
                const isActive = pathname === item.path;
                return (
                    <Link
                        key={item.id}
                        href={item.path}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all",
                            isActive ? "text-blue-600 scale-110" : "text-gray-400 opacity-60 hover:opacity-100"
                        )}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-bold tracking-tight uppercase font-outfit truncate max-w-[60px]">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
