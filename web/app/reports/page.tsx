"use client";

import React from "react";
import { LineChart, TrendingUp, DollarSign, Users, FileText, Calendar } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto relative min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <LineChart className="w-8 h-8 text-purple-600" />
                        Reports
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Detailed breakdowns of metrics and activity.
                    </p>
                </div>
            </div>

            {/* Premium Empty State */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-gray-100 dark:border-white/5 shadow-2xl shadow-purple-500/5">
                <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <LineChart className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">REPORTS CORE BETA</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                    We're calibrating the AI engines. Real-time business reporting and predictive financial models will be available in your next sync.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
                    {[
                        { icon: DollarSign, title: "Capital Flow", desc: "Live revenue & expense tracking" },
                        { icon: Users, title: "Identity Metrics", desc: "Client lifecycle analytics" },
                        { icon: TrendingUp, title: "Scale Engine", desc: "AI-driven growth forecasting" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 transition-all hover:scale-105">
                            <item.icon className="w-8 h-8 text-purple-600 mb-4" />
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-widest text-xs">{item.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
