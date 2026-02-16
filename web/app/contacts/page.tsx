"use client";

import React from "react";
import { Users, Mail, Phone, Building2, MapPin, Calendar } from "lucide-react";

export default function ContactsPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto relative min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Contacts
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Address book for all professional connections.
                    </p>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contacts Module Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                    This module will provide a comprehensive contact management system for all your professional connections.
                </p>

                {/* Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
                    {[
                        { icon: Mail, title: "Email Integration", desc: "Quick access to contact emails" },
                        { icon: Phone, title: "Call Tracking", desc: "Log and track communication history" },
                        { icon: Building2, title: "Company Links", desc: "Associate contacts with companies" }
                    ].map((item, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <item.icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
