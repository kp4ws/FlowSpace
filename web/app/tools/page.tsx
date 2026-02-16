"use client";

import React from "react";
import { Zap, Wrench, Calculator, FileSearch, Mail, QrCode } from "lucide-react";

export default function ToolsPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto relative min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-600" />
                        Tools
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Utility tools for various specialized tasks.
                    </p>
                </div>
            </div>

            {/* Premium Empty State */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-gray-100 dark:border-white/5 shadow-2xl shadow-amber-500/5">
                <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-pulse text-amber-600">
                    <Zap className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 uppercase">CORE UTILITY ENGINES</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                    Custom automation scripts and specialized business utilities are being integrated into the module pipeline.
                </p>

                {/* Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
                    {[
                        { icon: Calculator, title: "Calculators", desc: "Financial and business calculators" },
                        { icon: Mail, title: "Email Templates", desc: "Pre-built professional templates" },
                        { icon: QrCode, title: "QR Generator", desc: "Create QR codes for links and data" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 transition-all hover:scale-105">
                            <item.icon className="w-8 h-8 text-amber-600 mb-4 mx-auto" />
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-widest text-xs tracking-widest">{item.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
