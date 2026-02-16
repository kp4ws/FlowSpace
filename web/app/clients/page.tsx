"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useTemplate } from "../../context/TemplateContext";
import { getIcon } from "../../lib/templates";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import {
    Plus,
    Search,
    MoreVertical,
    Mail,
    Calendar,
    Loader2,
    Briefcase,
    X
} from "lucide-react";

type Client = {
    id: number;
    name: string;
    email: string | null;
    notes: string | null;
    created_at: string;
};

export default function ClientsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { activeTemplate } = useTemplate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: "", email: "", notes: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const EntityIcon = getIcon(activeTemplate.entitiesIcon);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchClients();
        import("../../lib/sync").then(m => m.syncClients());
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get("/clients/");
            const items = res.data;
            await import("../../lib/db").then(async ({ db }) => {
                await db.clients.clear();
                await db.clients.bulkAdd(items.map((c: any) => ({ ...c, is_synced: 1 })));
            });
            setClients(items);
        } catch (error) {
            console.warn("Offline fallback", error);
            const { db } = await import("../../lib/db");
            const local = await db.clients.toArray();
            setClients(local as any);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const clientData = { ...newClient, created_at: new Date().toISOString(), is_synced: 0, user_id: user?.id || "mock-user" };

        try {
            const { db } = await import("../../lib/db");
            const localId = await db.clients.add(clientData as any);
            setClients([...clients, { ...clientData, id: localId } as any]);
            setNewClient({ name: "", email: "", notes: "" });
            setIsModalOpen(false);

            const { syncClients } = await import("../../lib/sync");
            await syncClients();
            const updated = await db.clients.toArray();
            setClients(updated as any);
        } catch (error) {
            console.error("Failed to add client:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto relative min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <EntityIcon className="w-8 h-8 text-blue-600" />
                        Clients
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your clients list and details.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Add Client
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search clients...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>All Clients</option>
                        <option>Active</option>
                        <option>Previous</option>
                    </select>
                </div>
            </div>

            {/* Clients Grid/List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500/50" />
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <Briefcase className="w-32 h-32 text-blue-600 rotate-12" />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                                    {client.name[0]}
                                </div>
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                    {client.name}
                                </h3>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{client.email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>Added {new Date(client.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {client.notes && (
                                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                        {client.notes}
                                    </p>
                                )}

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        View Details
                                    </span>
                                    <div className="flex -space-x-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold">
                                                INV
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <EntityIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No clients found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {searchTerm ? `No matches for "${searchTerm}"` : `Start by adding your first client.`}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                    >
                        Add Client
                    </button>
                </div>
            )}

            {/* Add Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/20 dark:border-gray-700/50 overflow-hidden transform transition-all duration-300 scale-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Client</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddClient} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Client Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={`e.g. ${activeTemplate.id === 'freelancer' ? 'Acme Corp' : 'Project X'}`}
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Email / Contact
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="contact@example.com"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Initial Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add any initial thoughts or details..."
                                        value={newClient.notes}
                                        onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Save Client
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
