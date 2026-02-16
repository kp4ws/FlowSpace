"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Template, STANDARD_TEMPLATE, TEMPLATES, CustomTemplate, createCustomTemplate } from "../lib/templates";
import api from "../lib/api";

type TemplateContextType = {
    activeTemplate: Template;
    setTemplate: (id: string) => void;
    availableTemplates: Template[];
    customTemplates: CustomTemplate[];
    saveCurrentAsTemplate: (name: string, description: string) => void;
    deleteCustomTemplate: (id: string) => void;
    applyTemplate: (template: Template | CustomTemplate) => void;
    enabledModuleIds: string[];
    toggleModule: (id: string) => void;
    favoritedIds: string[];
    toggleFavorite: (id: string) => void;
    marketplaceWorkspaces: Template[];
    shareWorkspace: (template: CustomTemplate) => Promise<void>;
    toggleLike: (id: string) => Promise<void>;
    likedIds: string[];
};

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
    const [activeTemplate, setActiveTemplate] = useState<Template>(STANDARD_TEMPLATE);
    const [enabledModuleIds, setEnabledModuleIds] = useState<string[]>([]);
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
    const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
    const [marketplaceWorkspaces, setMarketplaceWorkspaces] = useState<Template[]>([]);
    const [likedIds, setLikedIds] = useState<string[]>([]);

    // Persist template choice and enabled modules
    useEffect(() => {
        const savedTemplate = localStorage.getItem("active_template");
        let initialTemplate = STANDARD_TEMPLATE;

        if (savedTemplate) {
            const template = TEMPLATES.find(t => t.id === savedTemplate);
            if (template) {
                setActiveTemplate(template);
                initialTemplate = template;
            }
        }

        const savedModules = localStorage.getItem(`enabled_modules_${initialTemplate.id}`);
        if (savedModules) {
            setEnabledModuleIds(JSON.parse(savedModules));
        } else {
            setEnabledModuleIds(initialTemplate.modules);
        }

        // Load custom templates
        const savedCustom = localStorage.getItem("custom_templates");
        if (savedCustom) {
            setCustomTemplates(JSON.parse(savedCustom));
        }

        // Load favorites
        const savedFavorites = localStorage.getItem("favorited_templates");
        if (savedFavorites) {
            setFavoritedIds(JSON.parse(savedFavorites));
        }

        // Load likes
        const savedLikes = localStorage.getItem("liked_templates");
        if (savedLikes) {
            setLikedIds(JSON.parse(savedLikes));
        }

        // Fetch Marketplace Data
        fetchMarketplace();
    }, []);

    const fetchMarketplace = useCallback(async () => {
        try {
            const res = await api.get("/marketplace/workspaces");
            // Map SharedWorkspace from backend to frontend Template type
            const mapped: Template[] = res.data.map((sw: any) => {
                const layout = JSON.parse(sw.layout_json);
                return {
                    ...layout,
                    id: `shared-${sw.id}`,
                    realId: sw.id, // Keep the DB ID for liking
                    likesCount: sw.likes_count,
                    authorId: sw.user_id,
                };
            });
            setMarketplaceWorkspaces(mapped);
        } catch (e) {
            console.error("Failed to fetch marketplace", e);
        }
    }, []);

    const saveCustomTemplates = (templates: CustomTemplate[]) => {
        setCustomTemplates(templates);
        localStorage.setItem("custom_templates", JSON.stringify(templates));
    };

    const setTemplate = (id: string) => {
        const template = TEMPLATES.find(t => t.id === id);
        if (template) {
            applyTemplate(template);
        }
    };

    const applyTemplate = (template: Template | CustomTemplate) => {
        setActiveTemplate(template);
        localStorage.setItem("active_template", template.id);

        // Apply modules
        setEnabledModuleIds(template.modules);
        localStorage.setItem(`enabled_modules_${template.id}`, JSON.stringify(template.modules));

        // Apply layout if custom or use default for built-in
        if ('isCustom' in template && template.savedLayout) {
            localStorage.setItem(`dashboard_layout_${template.id}`, JSON.stringify(template.savedLayout));
        } else {
            // Force reset layout to default for built-in templates
            localStorage.removeItem(`dashboard_layout_${template.id}`);
        }

        // Notify dashboard to reload
        window.dispatchEvent(new CustomEvent('dashboard-layout-changed'));
    };

    const saveCurrentAsTemplate = (name: string, description: string) => {
        // Get current layout from localStorage as it's the source of truth
        const savedLayoutStr = localStorage.getItem(`dashboard_layout_${activeTemplate.id}`);
        const currentLayout = savedLayoutStr ? JSON.parse(savedLayoutStr) : [];

        const newTemplate = createCustomTemplate(
            name,
            description,
            enabledModuleIds,
            currentLayout,
            activeTemplate
        );

        saveCustomTemplates([...customTemplates, newTemplate]);
    };

    const deleteCustomTemplate = (id: string) => {
        saveCustomTemplates(customTemplates.filter(t => t.id !== id));
    };

    const toggleModule = (id: string) => {
        setEnabledModuleIds(prev => {
            const updated = prev.includes(id)
                ? prev.filter(mid => mid !== id)
                : [...prev, id];
            localStorage.setItem(`enabled_modules_${activeTemplate.id}`, JSON.stringify(updated));
            return updated;
        });
    };

    const toggleFavorite = (id: string) => {
        setFavoritedIds(prev => {
            const updated = prev.includes(id)
                ? prev.filter(fid => fid !== id)
                : [...prev, id];
            localStorage.setItem("favorited_templates", JSON.stringify(updated));
            return updated;
        });
    };

    const shareWorkspace = async (template: CustomTemplate) => {
        try {
            const payload = {
                name: template.name,
                description: template.description,
                layout_json: JSON.stringify(template),
                is_public: true
            };
            await api.post("/marketplace/workspaces/share", payload);
            fetchMarketplace(); // Refresh list
            alert("Workspace shared with the community!");
        } catch (e) {
            console.error("Sharing failed", e);
            alert("Failed to share workspace. Are you logged in?");
        }
    };

    const toggleLike = async (id: string) => {
        const template = marketplaceWorkspaces.find(t => t.id === id);
        if (!template || !('realId' in template)) return;

        try {
            const res = await api.post(`/marketplace/workspaces/${(template as any).realId}/like`);
            setMarketplaceWorkspaces(prev => prev.map(t =>
                t.id === id ? { ...t, likesCount: res.data.likes_count } : t
            ));
            setLikedIds(prev => {
                const updated = [...prev, id];
                localStorage.setItem("liked_templates", JSON.stringify(updated));
                return updated;
            });
        } catch (e) {
            console.error("Like failed", e);
        }
    };

    return (
        <TemplateContext.Provider value={{
            activeTemplate,
            setTemplate,
            availableTemplates: TEMPLATES,
            customTemplates,
            saveCurrentAsTemplate,
            deleteCustomTemplate,
            applyTemplate,
            enabledModuleIds,
            toggleModule,
            favoritedIds,
            toggleFavorite,
            marketplaceWorkspaces,
            shareWorkspace,
            toggleLike,
            likedIds
        }}>
            {children}
        </TemplateContext.Provider>
    );
}

export function useTemplate() {
    const context = useContext(TemplateContext);
    if (context === undefined) {
        throw new Error("useTemplate must be used within a TemplateProvider");
    }
    return context;
}
