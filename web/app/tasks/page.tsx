"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    CheckSquare,
    Circle,
    CheckCircle2,
    Clock,
    Loader2,
    X,
    AlertCircle,
    Flag
} from "lucide-react";
import { cn } from "../../lib/utils";

type Task = {
    id: number;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    due_date?: string;
    created_at: string;
};

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM" as 'LOW' | 'MEDIUM' | 'HIGH', due_date: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchTasks();
        import("../../lib/sync").then(m => m.syncTasks());
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get("/tasks/");
            const items = res.data;
            await import("../../lib/db").then(async ({ db }) => {
                await db.tasks.clear();
                await db.tasks.bulkAdd(items.map((t: any) => ({ ...t, is_synced: 1 })));
            });
            setTasks(items);
        } catch (error) {
            console.warn("Offline fallback", error);
            const { db } = await import("../../lib/db");
            const local = await db.tasks.toArray();
            setTasks(local as any);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const taskData = {
            ...newTask,
            status: 'TODO' as const,
            created_at: new Date().toISOString(),
            is_synced: 0,
            user_id: user?.id || "mock-user"
        };

        try {
            const { db } = await import("../../lib/db");
            const localId = await db.tasks.add(taskData as any);
            setTasks([...tasks, { ...taskData, id: localId } as any]);
            setNewTask({ title: "", description: "", priority: "MEDIUM", due_date: "" });
            setIsModalOpen(false);

            const { syncTasks } = await import("../../lib/sync");
            await syncTasks();
            const updated = await db.tasks.toArray();
            setTasks(updated as any);
        } catch (error) {
            console.error("Failed to add task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTaskStatus = async (task: Task) => {
        const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        const { db } = await import("../../lib/db");
        await db.tasks.update(task.id, { status: nextStatus, is_synced: 0 });
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

        const { syncTasks } = await import("../../lib/sync");
        await syncTasks();
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DONE': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-blue-600" />;
            default: return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
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
                        <CheckSquare className="w-8 h-8 text-blue-600" />
                        Tasks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your to-do list and track progress.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Add Task
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'All', count: tasks.length, color: 'bg-gray-50 dark:bg-gray-800' },
                    { label: 'To Do', count: tasks.filter(t => t.status === 'TODO').length, color: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'Done', count: tasks.filter(t => t.status === 'DONE').length, color: 'bg-green-50 dark:bg-green-900/20' }
                ].map((stat, i) => (
                    <div key={i} className={cn("p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700", stat.color)}>
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="ALL">All Tasks</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
            </div>

            {/* Tasks List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500/50" />
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={cn(
                                "group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300",
                                task.status === 'DONE' && "opacity-60"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => toggleTaskStatus(task)}
                                    className="mt-1 hover:scale-110 transition-transform"
                                >
                                    {getStatusIcon(task.status)}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className={cn(
                                                "text-lg font-bold text-gray-900 dark:text-white",
                                                task.status === 'DONE' && "line-through"
                                            )}>
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", getPriorityColor(task.priority))}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(task.created_at).toLocaleDateString()}
                                        </span>
                                        {task.due_date && (
                                            <span className="flex items-center gap-1 text-orange-600">
                                                <AlertCircle className="w-3 h-3" />
                                                Due {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tasks found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {searchTerm ? `No matches for "${searchTerm}"` : "Start by adding your first task."}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                    >
                        Add Task
                    </button>
                </div>
            )}

            {/* Add Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/20 dark:border-gray-700/50 overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Task</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTask} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Complete project proposal"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add any additional details..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                            Priority
                                        </label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        />
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
                                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Create Task
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
