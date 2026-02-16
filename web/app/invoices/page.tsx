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
    Filter,
    Download,
    Loader2,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    User,
    Database,
    FileText
} from "lucide-react";

type Invoice = {
    id: number;
    client_id: number;
    status: string;
    amount: number;
    due_date: string | null;
    created_at: string;
};

type Client = {
    id: number;
    name: string;
};

export default function InvoicesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { activeTemplate } = useTemplate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Standardized labels
    const pageTitle = "Invoices";
    const revenueLabel = "Total Revenue";
    const pendingLabel = "Pending";
    const draftLabel = "Drafts";
    const amountLabel = "Amount";
    const EntityIcon = FileText;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        client_id: "",
        amount: "",
        status: "DRAFT",
        due_date: ""
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchInvoices();
            fetchClients();
            import("../../lib/sync").then(m => m.syncInvoices());
        }
    }, [user]);

    const fetchInvoices = async () => {
        try {
            const res = await api.get("/invoices/");
            const items = res.data;
            await import("../../lib/db").then(async ({ db }) => {
                await db.invoices.clear();
                await db.invoices.bulkAdd(items.map((i: any) => ({ ...i, is_synced: 1 })));
            });
            setInvoices(items);
        } catch (error) {
            console.warn("Offline fallback", error);
            const { db } = await import("../../lib/db");
            const local = await db.invoices.toArray();
            setInvoices(local as any);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get("/clients/");
            setClients(res.data);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    };

    const handleAddInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const invoiceData = {
            client_id: parseInt(newInvoice.client_id),
            amount: parseFloat(newInvoice.amount),
            status: newInvoice.status,
            due_date: newInvoice.due_date,
            created_at: new Date().toISOString(),
            is_synced: 0
        };

        try {
            const { db } = await import("../../lib/db");
            const localId = await db.invoices.add(invoiceData);
            setInvoices([{ ...invoiceData, id: localId } as any, ...invoices]);
            setNewInvoice({ client_id: "", amount: "", status: "DRAFT", due_date: "" });
            setIsModalOpen(false);

            const { syncInvoices } = await import("../../lib/sync");
            await syncInvoices();
            const updated = await db.invoices.toArray();
            setInvoices(updated as any);
        } catch (error) {
            console.error("Failed to add invoice:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'SENT': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'DRAFT': return <FileText className="w-4 h-4 text-gray-400" />;
            default: return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50';
            case 'SENT': return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
            default: return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800/50';
        }
    };

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
                        <EntityIcon className="w-8 h-8 text-purple-600" />
                        {pageTitle}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track and manage your billing, payments, and financial records.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25"
                >
                    <Plus className="w-5 h-5" />
                    New {'Invoice'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 truncate">{revenueLabel}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {'$'}{invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? inv.amount : 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 truncate">{pendingLabel}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${invoices.reduce((acc, inv) => acc + (inv.status === 'SENT' ? inv.amount : 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 truncate">{'Drafts'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {invoices.filter(inv => inv.status === 'DRAFT').length}
                    </p>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Find an invoice...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">{'Invoice ID'}</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">{'Amount'}</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : invoices.length > 0 ? invoices.filter(inv => inv.id.toString().includes(searchTerm)).map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">#{invoice.id.toString().padStart(4, '0')}</span>
                                            <span className="text-xs text-gray-500 uppercase font-black tracking-tighter">CLIENT {invoice.client_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                            getStatusClass(invoice.status)
                                        )}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                                        {'$'}{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(invoice.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-purple-600 hover:text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] flex items-center justify-center mb-6 text-purple-600">
                                                <FileText className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 uppercase">NO FINANCIAL RECORDS</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm font-medium leading-relaxed mb-8">
                                                Your ledger is currently pristine. Create your first invoice to start tracking capital flow and business growth.
                                            </p>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Generate First Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Invoice Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/20 dark:border-gray-700/50 overflow-hidden transform transition-all duration-300 scale-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New {'Invoice'}</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddInvoice} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Select {'Client'}
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            required
                                            value={newInvoice.client_id}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium appearance-none"
                                        >
                                            <option value="">Select {'client'}...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        {'Amount'}
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            value={newInvoice.amount}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 text-center">
                                        Status
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['DRAFT', 'SENT', 'PAID'].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setNewInvoice({ ...newInvoice, status })}
                                                className={cn(
                                                    "py-2 rounded-lg text-xs font-bold border transition-all",
                                                    newInvoice.status === status
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
                                                        : "bg-gray-50 dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-purple-500/50"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
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
                                        className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Create {'Invoice'}
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
