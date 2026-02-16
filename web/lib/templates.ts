import {
    LayoutDashboard,
    Users,
    FileText,
    NotebookPen,
    Database,
    LineChart,
    Microscope,
    LucideIcon,
    DollarSign,
    CheckSquare,
    Zap,
    PlusCircle,
    Activity,
    BrainCircuit,
    Layers,
    GraduationCap,
    Wallet
} from "lucide-react";

export type Module = {
    id: string;
    label: string;
    description: string;
    path: string;
    iconName: string;
    isPremium?: boolean;
};

export type Widget = {
    id: string;
    title: string;
    type: 'revenue' | 'entities' | 'notes' | 'smart-feed' | 'activity' | 'stats' | 'custom';
    description: string;
    defaultW: number;
    defaultH: number;
    minW?: number;
    minH?: number;
    config?: {
        content?: string;
        link?: string;
        iconName?: string;
    };
};

export type Template = {
    id: string;
    name: string;
    tagline: string;
    description: string;
    entitiesLabel: string;
    entitiesLabelSingular: string;
    entitiesIcon: string;
    modules: string[]; // Reference module IDs
    aiTheme: "blue" | "purple" | "emerald" | "slate" | "amber";
    defaultWidgetIds: string[];
    isPremium?: boolean;
    previewColor: string;
    likesCount?: number;
    realId?: number;
    authorId?: string;
    autonomyRules: {
        id: string;
        label: string;
        description: string;
        triggerMessage: string;
    }[];
};

export type CustomTemplate = Template & {
    isCustom: true;
    createdAt: string;
    savedLayout?: any[];
};

export const ALL_MODULES: Module[] = [
    { id: "dashboard", label: "Dashboard", description: "Main workspace hub with active widgets", path: "/", iconName: "LayoutDashboard" },
    { id: "clients", label: "Clients", description: "Manage clients and contact relationships", path: "/clients", iconName: "Users" },
    { id: "invoices", label: "Invoices", description: "Track billing, payments, and revenue", path: "/invoices", iconName: "FileText" },
    { id: "tasks", label: "Tasks", description: "Manage your daily to-do list and deadlines", path: "/tasks", iconName: "CheckSquare" },
    { id: "contacts", label: "Contacts", description: "Address book for all professional connections", path: "/contacts", iconName: "Users" },
    { id: "reports", label: "Reports", description: "Detailed breakdown of metrics and activity", path: "/reports", iconName: "LineChart" },
    { id: "analytics", label: "Analytics", description: "Real-time performance data and insights", path: "/analytics", iconName: "Activity" },
    { id: "tools", label: "Tools", description: "Utility tools for various specialized tasks", path: "/tools", iconName: "Zap" },
    { id: "notes", label: "Smart Notes", description: "AI-enhanced captures and lab notes", path: "/notes", iconName: "NotebookPen" },
    { id: "creative-assets", label: "Assets", description: "Library of design files and media", path: "/assets", iconName: "Layers", isPremium: true },
    { id: "experiments", label: "Experiments", description: "Track lab runs and computational metrics", path: "/experiments", iconName: "Microscope", isPremium: true },
    { id: "budget", label: "Budget", description: "Manage your personal or project finances", path: "/budget", iconName: "Wallet" },
];

export const AVAILABLE_WIDGETS: Widget[] = [
    { id: "revenue", title: "Revenue", type: "revenue", description: "Financial tracking and budget overview", defaultW: 4, defaultH: 6, minW: 3, minH: 4 },
    { id: "entities", title: "Contacts", type: "entities", description: "Quick access to your primary entities", defaultW: 4, defaultH: 6, minW: 3, minH: 4 },
    { id: "tasks", title: "Active Tasks", type: "stats", description: "Next items on your to-do list", defaultW: 4, defaultH: 6, minW: 3, minH: 4 },
    { id: "notes", title: "Insights", type: "notes", description: "Latest smart notes and captures", defaultW: 4, defaultH: 6, minW: 3, minH: 4 },
    { id: "smart-feed", title: "Smart Feed", type: "smart-feed", description: "AI-driven proactive alerts", defaultW: 12, defaultH: 4, minW: 6, minH: 2 },
    { id: "activity", title: "Recent Activity", type: "activity", description: "A log of recent actions and events", defaultW: 4, defaultH: 6, minW: 3, minH: 4 },
    { id: "budget", title: "Budget Tracker", type: "revenue", description: "Monitor expenses and remaining budget", defaultW: 4, defaultH: 6, minW: 3, minH: 4 },
    { id: "custom-note", title: "Custom Note", type: "custom", description: "Create a tailored markdown box", defaultW: 4, defaultH: 4, minW: 2, minH: 2, config: { content: "# My Custom Note\nAdd your text here..." } },
];

export const STANDARD_TEMPLATE: Template = {
    id: "standard",
    name: "Standard",
    tagline: "The blank slate for any workflow.",
    description: "A clean, unopinionated workspace for general productivity.",
    entitiesLabel: "Items",
    entitiesLabelSingular: "Item",
    entitiesIcon: "Layers",
    aiTheme: "slate",
    previewColor: "bg-slate-500",
    defaultWidgetIds: ["smart-feed", "notes", "activity", "tasks"],
    modules: ["dashboard", "notes", "tasks", "contacts", "tools"],
    autonomyRules: []
};

export const FREELANCER_TEMPLATE: Template = {
    id: "freelancer",
    name: "Freelancer",
    tagline: "Master your client relationships.",
    description: "Built for independent contractors. Includes billing and client management.",
    entitiesLabel: "Clients",
    entitiesLabelSingular: "Client",
    entitiesIcon: "Users",
    aiTheme: "blue",
    previewColor: "bg-blue-600",
    defaultWidgetIds: ["smart-feed", "revenue", "entities", "notes", "tasks"],
    modules: ["dashboard", "clients", "invoices", "tasks", "notes", "reports"],
    autonomyRules: [
        {
            id: "dormant_client",
            label: "Dormant Client",
            description: "No activity in 30 days",
            triggerMessage: "Client {name} hasn't been contacted in a month. Send a follow-up?"
        },
        {
            id: "overdue_invoice",
            label: "Invoice Alert",
            description: "Payment is late",
            triggerMessage: "Invoice #{id} is overdue. Generate a reminder?"
        }
    ]
};

export const DATA_SCIENTIST_TEMPLATE: Template = {
    id: "data-scientist",
    name: "Data Scientist",
    tagline: "Optimized for the research loop.",
    description: "Manage datasets, track experiments, and maintain notebooks.",
    entitiesLabel: "Datasets",
    entitiesLabelSingular: "Dataset",
    entitiesIcon: "Microscope",
    aiTheme: "emerald",
    previewColor: "bg-emerald-600",
    defaultWidgetIds: ["smart-feed", "entities", "notes", "activity", "tasks"],
    modules: ["dashboard", "clients", "notes", "experiments", "reports", "analytics"],
    autonomyRules: [
        {
            id: "stale_dataset",
            label: "Stale Dataset",
            description: "No updates in 14 days",
            triggerMessage: "The {name} dataset hasn't been refreshed recently. Run update script?"
        },
        {
            id: "experiment_failure",
            label: "Draft Alert",
            description: "Metric drop detected",
            triggerMessage: "Accuracy in project {name} dropped by 5%. Analyze log?"
        }
    ]
};

export const CREATIVE_TEMPLATE: Template = {
    id: "creative",
    name: "Creative Studio",
    tagline: "Fuel your creative fire.",
    description: "Optimized for designers and artists.",
    entitiesLabel: "Assets",
    entitiesLabelSingular: "Asset",
    entitiesIcon: "Zap",
    aiTheme: "purple",
    previewColor: "bg-purple-600",
    defaultWidgetIds: ["notes", "activity"],
    modules: ["dashboard", "notes", "creative-assets"],
    isPremium: true,
    autonomyRules: []
};

export const STUDENT_TEMPLATE: Template = {
    id: "student",
    name: "Student",
    tagline: "Ace your academic journey.",
    description: "Personalized for learners. Track assignments, grades, and study notes.",
    entitiesLabel: "Courses",
    entitiesLabelSingular: "Course",
    entitiesIcon: "GraduationCap",
    aiTheme: "amber",
    previewColor: "bg-amber-500",
    defaultWidgetIds: ["smart-feed", "tasks", "notes", "activity"],
    modules: ["dashboard", "tasks", "notes", "reports", "tools"],
    autonomyRules: [
        {
            id: "upcoming_deadline",
            label: "Deadline Watch",
            description: "Assignment due within 48h",
            triggerMessage: "Your {name} assignment is due in 2 days. Start a focus session?"
        }
    ]
};

export const TEMPLATES = [STANDARD_TEMPLATE, FREELANCER_TEMPLATE, DATA_SCIENTIST_TEMPLATE, CREATIVE_TEMPLATE, STUDENT_TEMPLATE];

export const getIcon = (name: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
        LayoutDashboard,
        Users,
        FileText,
        NotebookPen,
        Database,
        LineChart,
        Microscope,
        DollarSign,
        CheckSquare,
        Zap,
        PlusCircle,
        Activity,
        BrainCircuit,
        Layers,
        GraduationCap,
        Wallet
    };
    return icons[name] || FileText;
};

export const createCustomTemplate = (
    name: string,
    description: string,
    enabledModuleIds: string[],
    currentLayout: any[],
    baseTemplate: Template
): CustomTemplate => {
    return {
        ...baseTemplate,
        id: `custom-${Date.now()}`,
        name,
        tagline: "Custom Workspace",
        description,
        modules: enabledModuleIds,
        defaultWidgetIds: currentLayout.map(w => w.type),
        savedLayout: currentLayout,
        isCustom: true,
        createdAt: new Date().toISOString(),
    };
};
