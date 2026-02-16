"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error for debugging
        console.error(error);
    }, [error]);

    const isDev = process.env.NODE_ENV === "development";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 font-inter">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 p-10 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner">
                    <AlertCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter mb-4 font-outfit uppercase">
                    System Interruption
                </h1>

                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                    {isDev
                        ? error.message
                        : "An unexpected error occurred within the workspace. Our systems have been notified."}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Re-Initialize Workspace
                    </button>

                    <Link
                        href="/"
                        className="w-full py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Return to Hub
                    </Link>
                </div>

                {isDev && error.digest && (
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            Trace ID: {error.digest}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
