"use client";

import React, { useState, useEffect } from "react";
// @ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import {
    DollarSign,
    Users,
    NotebookPen,
    Plus,
    Loader2,
    Sparkles,
    MessageSquare,
    AlertCircle,
    Clock,
    Zap,
    ArrowUpRight,
    X,
    Activity,
    BrainCircuit,
    Wallet,
    Save,
    HandMetal,
    Pencil
} from "lucide-react";
import { useTemplate } from "../context/TemplateContext";
import { getIcon, Template, AVAILABLE_WIDGETS, Widget } from "../lib/templates";
import api from "../lib/api";
import { cn } from "../lib/utils";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

type WidgetData = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    type: string;
};

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const { activeTemplate, saveCurrentAsTemplate } = useTemplate();
    const [layout, setLayout] = useState<WidgetData[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveForm, setSaveForm] = useState({ name: "", description: "" });

    // Global Hotkeys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsLibraryOpen(false);
                setIsSaving(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSaveWorkspace = (e: React.FormEvent) => {
        e.preventDefault();
        saveCurrentAsTemplate(saveForm.name, saveForm.description);
        setIsSaving(false);
        setSaveForm({ name: "", description: "" });
    };

    // Load layout on mount and when template changes
    useEffect(() => {
        setMounted(true);
        const savedLayout = localStorage.getItem(`dashboard_layout_${activeTemplate.id}`);
        if (savedLayout) {
            const parsed = JSON.parse(savedLayout);
            const hydrated = parsed.map((l: any) => {
                const widget = AVAILABLE_WIDGETS.find(w => w.id === l.type);
                return {
                    ...l,
                    minW: widget?.minW,
                    minH: widget?.minH
                };
            });
            setLayout(hydrated);
        } else {
            // Default layout from template
            const initialLayout = activeTemplate.defaultWidgetIds.map((id, index) => {
                const widget = AVAILABLE_WIDGETS.find(w => w.id === id);
                return {
                    i: `${id}-${Date.now()}-${index}`, // Unique ID for duplicate widgets
                    type: id,
                    x: (index * 4) % 12,
                    y: Math.floor(index / 3) * 6,
                    w: widget?.defaultW || 4,
                    h: widget?.defaultH || 6,
                    minW: widget?.minW,
                    minH: widget?.minH,
                };
            });
            setLayout(initialLayout);
        }
    }, [activeTemplate]);

    const saveLayout = (newLayout: any) => {
        // Sync custom props (like type and constraints) back to the rgl layout if needed
        const updatedLayout = newLayout.map((l: any) => {
            const existing = layout.find(w => w.i === l.i);
            return {
                ...l,
                type: existing?.type,
                minW: existing?.minW,
                minH: existing?.minH
            };
        });
        setLayout(updatedLayout);
        localStorage.setItem(`dashboard_layout_${activeTemplate.id}`, JSON.stringify(updatedLayout));
        window.dispatchEvent(new CustomEvent('dashboard-layout-changed'));
    };

    const addWidget = (widget: Widget) => {
        const newWidget: WidgetData = {
            i: `${widget.id}-${Date.now()}`,
            type: widget.id,
            x: 0,
            y: Infinity, // Add to bottom
            w: widget.defaultW,
            h: widget.defaultH,
            minW: widget.minW,
            minH: widget.minH,
        };
        const updated = [...layout, newWidget];
        setLayout(updated);
        localStorage.setItem(`dashboard_layout_${activeTemplate.id}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dashboard-layout-changed'));
        setIsLibraryOpen(false);
    };

    const removeWidget = (id: string) => {
        const updated = layout.filter(w => w.i !== id);
        setLayout(updated);
        localStorage.setItem(`dashboard_layout_${activeTemplate.id}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dashboard-layout-changed'));
    };

    if (!mounted) return null;

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen font-inter">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="animate-in fade-in slide-in-from-left duration-500">
                    <h1 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-2 font-outfit">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 font-medium capitalize flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600/60" />
                        Workspace optimized for your workflow.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-right duration-500">
                    <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="px-6 py-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold shadow-sm hover:shadow-md hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2 text-slate-700 dark:text-slate-200"
                    >
                        <Plus className="w-4 h-4 text-blue-600" />
                        Add Widget
                    </button>
                    <button
                        onClick={() => setIsSaving(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/10 hover:bg-blue-700 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Space
                    </button>
                </div>
            </header>

            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                draggableHandle=".drag-handle"
                margin={[24, 24]}
                useCSSTransforms={true}
                measureBeforeMount={false}
                onLayoutChange={(currentLayout) => {
                    if (currentLayout.length > 0) saveLayout(currentLayout);
                }}
            >
                {layout.map((item) => {
                    const widgetConfig = AVAILABLE_WIDGETS.find(w => w.id === item.type);
                    return (
                        <div key={item.i} id={`widget-${item.type}`} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 transition-all hover:border-blue-600/30 group scroll-mt-6 relative">
                            <div className="drag-handle p-4 cursor-move flex justify-between items-center bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 rounded-t-[2rem]">
                                <span className="font-bold text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] ml-2 group-hover:text-blue-600 transition-colors font-outfit truncate pr-4">
                                    {widgetConfig?.title || item.type}
                                </span>
                                <button
                                    onClick={() => removeWidget(item.i)}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="px-6 py-6 pb-12 h-[calc(100%-52px)] overflow-auto scrollbar-hide">
                                {item.type === 'revenue' && <RevenueWidget template={activeTemplate} />}
                                {item.type === 'budget' && <BudgetWidget template={activeTemplate} />}
                                {item.type === 'entities' && <EntitiesWidget template={activeTemplate} />}
                                {item.type === 'notes' && <NotesWidget template={activeTemplate} />}
                                {item.type === 'smart-feed' && <SmartFeed template={activeTemplate} />}
                                {item.type === 'activity' && <ActivityWidget template={activeTemplate} />}
                                {item.type === 'custom-note' && <CustomWidget widget={AVAILABLE_WIDGETS.find(w => w.id === 'custom-note')!} />}
                            </div>
                        </div>
                    );
                })}
            </ResponsiveGridLayout>

            {/* Widget Library Modal */}
            {isLibraryOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsLibraryOpen(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-outfit uppercase">WIDGET LIBRARY</h2>
                                    <p className="text-slate-500 text-sm mt-1">Select a module to append to your current workspace.</p>
                                </div>
                                <button onClick={() => setIsLibraryOpen(false)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {AVAILABLE_WIDGETS.map((widget) => (
                                    <button
                                        key={widget.id}
                                        onClick={() => addWidget(widget)}
                                        className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/30 rounded-[2.5rem] transition-all hover:shadow-xl group text-left"
                                    >
                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                                            {widget.id === 'revenue' && <DollarSign className="w-6 h-6" />}
                                            {widget.id === 'budget' && <Wallet className="w-6 h-6" />}
                                            {widget.id === 'entities' && <Users className="w-6 h-6" />}
                                            {widget.id === 'notes' && <NotebookPen className="w-6 h-6" />}
                                            {widget.id === 'smart-feed' && <Zap className="w-6 h-6" />}
                                            {widget.id === 'activity' && <Activity className="w-6 h-6" />}
                                            {widget.type === 'custom' && <HandMetal className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-1">{widget.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{widget.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Workspace Modal */}
            {isSaving && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsSaving(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleSaveWorkspace} className="p-10 space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-outfit uppercase">SAVE WORKSPACE</h2>
                                    <p className="text-slate-500 text-sm mt-1">Capture your current layout as a new template.</p>
                                </div>
                                <button type="button" onClick={() => setIsSaving(false)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Workspace Name</label>
                                    <input
                                        autoFocus
                                        placeholder="e.g. My Deep Focus Setup"
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={saveForm.name}
                                        onChange={e => setSaveForm({ ...saveForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        placeholder="Briefly describe what this layout is optimized for..."
                                        rows={3}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                        value={saveForm.description}
                                        onChange={e => setSaveForm({ ...saveForm, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                            >
                                Confirm & Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function CustomWidget({ widget }: { widget: Widget }) {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-6 overflow-auto">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
                <HandMetal className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Custom Module</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {widget.config?.content || "Click 'Pencil' to edit this module."}
                </p>
            </div>
            <div className="mt-auto pt-4 flex justify-end">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <Pencil className="w-3 h-3 text-gray-400" />
                </button>
            </div>
        </div>
    );
}

function ActivityWidget({ template }: { template: Template }) {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-start relative group/item">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-900/50">
                        <Activity className="w-3.0 h-3.0" />
                    </div>
                    {i !== 3 && <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-gray-100 dark:bg-white/5" />}
                    <div className="flex-1">
                        <p className="text-[11px] font-bold text-gray-900 dark:text-white mb-0.5 font-outfit">
                            {template.id === 'freelancer' ? 'Follow-up Sent' : 'Metric Logged'}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {template.id === 'freelancer' ? 'Client Acme Corp contacted' : 'Accuracy shift detected in X-1'}
                        </p>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">2m ago</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SmartFeed({ template }: { template: Template }) {
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnalyzing(false), 2000);
        return () => clearTimeout(timer);
    }, [template]);

    if (isAnalyzing) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center p-10 h-full">
                <BrainCircuit className="w-10 h-10 text-blue-500 animate-pulse mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Scanning Neural Workspace...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {template.autonomyRules.length > 0 ? template.autonomyRules.map((rule) => (
                <div key={rule.id} className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent border border-gray-100 dark:border-white/5 rounded-[2rem] p-5 flex flex-col gap-4 hover:shadow-lg transition-all cursor-pointer group/card border-transparent hover:border-blue-500/30">
                    <div className="flex items-start justify-between">
                        <div className={cn(
                            "p-3 rounded-2xl shadow-sm",
                            template.id === "freelancer" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" :
                                template.id === "data-scientist" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600" :
                                    "bg-gray-100 dark:bg-white/10 text-gray-500"
                        )}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
                            Active Trigger
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{rule.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                            {rule.triggerMessage.replace("{name}", "Sample Item").replace("{id}", "123")}
                        </p>
                    </div>
                    <div className="mt-auto flex justify-end">
                        <button className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors">
                            TAKE ACTION
                            <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )) : (
                <div className="col-span-full flex flex-col items-center justify-center p-10 bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5">
                    <BrainCircuit className="w-10 h-10 text-gray-300 mb-4" />
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
                        AI Autonomy Idle<br />
                        <span className="text-[10px] font-medium lowercase tracking-normal">Switch to a specialized persona to enable proactive alerts.</span>
                    </p>
                </div>
            )}
        </div>
    );

}

function BudgetWidget({ template }: { template: Template }) {
    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent rounded-3xl p-4">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                    Healthy
                </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tighter">
                $2,450.00
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-loose">
                {template.id === "student" ? "SEMESTER BUDGET" : "PROJECT SPEND"}
            </p>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 italic">
                    65% Remaining
                </p>
                <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-emerald-500" />
                </div>
            </div>
        </div>
    );
}

function RevenueWidget({ template }: { template: Template }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/invoices').then(res => {
            const total = res.data.reduce((acc: number, inv: any) => acc + (inv.status === 'PAID' ? inv.amount : 0), 0);
            setStats({ total, count: res.data.length });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-transparent dark:from-white/5 dark:to-transparent rounded-3xl p-4">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold">
                    +12.5%
                </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tighter">
                ${stats?.total?.toLocaleString() ?? '0'}
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-loose">
                {template.id === "freelancer" ? "TOTAL REVENUE" : "BUDGET UTILIZATION"}
            </p>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 italic">
                    {stats?.count ?? 0} {template.id === "freelancer" ? "Invoices" : "Projects"}
                </p>
                <div className="w-12 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-blue-500" />
                </div>
            </div>
        </div>
    );
}

function EntitiesWidget({ template }: { template: Template }) {
    const [entities, setEntities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const EntityIcon = getIcon(template.entitiesIcon);

    useEffect(() => {
        api.get('/clients').then(res => {
            setEntities(res.data.slice(0, 4));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            {entities.length > 0 ? entities.map(entity => (
                <div key={entity.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/10 border border-transparent hover:border-gray-100 dark:border-white/10 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-all group-hover:scale-110">
                        <EntityIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{entity.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Active Resource</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
            )) : <p className="text-sm text-gray-500 text-center py-10">No {template.entitiesLabel.toLowerCase()} found.</p>}
        </div>
    );
}

function NotesWidget({ template }: { template: Template }) {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/notes').then(res => {
            setNotes(res.data.slice(0, 3));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            {notes.length > 0 ? notes.map(note => (
                <div key={note.id} className="relative p-6 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 hover:shadow-xl transition-all group cursor-pointer overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Context Capture</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 font-medium">
                        {note.content}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )) : <p className="text-sm text-gray-500 text-center py-10 italic">Empty notebook.</p>}
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500/40" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Hydrating</p>
        </div>
    );
}
