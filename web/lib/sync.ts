import { db } from './db';
import api from './api';

export async function syncNotes() {
    const unsynced = await db.notes.where('is_synced').equals(0).toArray();
    for (const item of unsynced) {
        try {
            const res = await api.post('/notes/', { content: item.content, client_id: item.client_id });
            await db.notes.update(item.id!, { id: res.data.id, is_synced: 1 });
        } catch (e) { console.error('Sync failed', e); }
    }
}

export async function syncClients() {
    const unsynced = await db.clients.where('is_synced').equals(0).toArray();
    for (const item of unsynced) {
        try {
            const res = await api.post('/clients/', { name: item.name, email: item.email });
            await db.clients.update(item.id!, { id: res.data.id, is_synced: 1 });
        } catch (e) { console.error('Sync failed', e); }
    }
}

export async function syncInvoices() {
    const unsynced = await db.invoices.where('is_synced').equals(0).toArray();
    for (const item of unsynced) {
        try {
            const res = await api.post('/invoices/', { client_id: item.client_id, amount: item.amount, status: item.status });
            await db.invoices.update(item.id!, { id: res.data.id, is_synced: 1 });
        } catch (e) { console.error('Sync failed', e); }
    }
}

export async function syncTasks() {
    const { db } = await import('./db');
    const unsynced = await db.tasks.where('is_synced').equals(0).toArray();
    for (const item of unsynced) {
        try {
            const res = await api.post('/tasks/', { title: item.title, description: item.description, status: item.status, priority: item.priority, due_date: item.due_date });
            await db.tasks.update(item.id!, { id: res.data.id, is_synced: 1 });
        } catch (e) { console.error('Sync failed', e); }
    }
}

export async function syncContacts() {
    const { db } = await import('./db');
    const unsynced = await db.contacts.where('is_synced').equals(0).toArray();
    for (const item of unsynced) {
        try {
            const res = await api.post('/contacts/', { name: item.name, email: item.email, phone: item.phone, company: item.company, notes: item.notes });
            await db.contacts.update(item.id!, { id: res.data.id, is_synced: 1 });
        } catch (e) { console.error('Sync failed', e); }
    }
}

export async function syncAll() {
    await syncClients();
    await syncNotes();
    await syncInvoices();
    await syncTasks();
    await syncContacts();
}

export function setupSyncListeners() {
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            console.log('App is online. Syncing FlowSpace...');
            syncAll();
        });
    }
}
