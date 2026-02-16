import Dexie, { type Table } from 'dexie';

export interface LocalNote {
    id?: number;
    content: string;
    client_id: number;
    created_at: string;
    is_synced: number; // 0 for unsynced, 1 for synced
}

export interface LocalClient {
    id?: number;
    name: string;
    email: string;
    user_id: string;
    created_at: string;
    is_synced: number;
}

export interface LocalInvoice {
    id?: number;
    client_id: number;
    status: string;
    amount: number;
    due_date?: string;
    created_at: string;
    is_synced: number;
}

export interface LocalTask {
    id?: number;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    due_date?: string;
    user_id: string;
    created_at: string;
    is_synced: number;
}

export interface LocalContact {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
    user_id: string;
    created_at: string;
    is_synced: number;
}

export class OfflineDB extends Dexie {
    notes!: Table<LocalNote>;
    clients!: Table<LocalClient>;
    invoices!: Table<LocalInvoice>;
    tasks!: Table<LocalTask>;
    contacts!: Table<LocalContact>;

    constructor() {
        super('FreelancerToolkitDB');
        this.version(1).stores({
            notes: '++id, client_id, is_synced',
            clients: '++id, name, user_id',
            invoices: '++id, client_id, status, is_synced',
            tasks: '++id, status, priority, user_id, is_synced',
            contacts: '++id, name, user_id, is_synced'
        });
    }
}

export const db = new OfflineDB();
