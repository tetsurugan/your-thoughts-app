import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'your-thoughts-db';
const DB_VERSION = 1;

export interface CachedTask {
    id: string;
    [key: string]: any;
}

export interface QueuedRequest {
    id?: number;
    url: string;
    method: 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    body?: any;
    timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('tasks')) {
                    db.createObjectStore('tasks', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('mutationQueue')) {
                    db.createObjectStore('mutationQueue', { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    }
    return dbPromise;
};

export const offlineStorage = {
    // Tasks Caching
    async saveTasks(tasks: CachedTask[]) {
        const db = await getDB();
        const tx = db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        await store.clear();
        for (const task of tasks) {
            await store.put(task);
        }
        await tx.done;
    },

    async getCachedTasks(): Promise<CachedTask[]> {
        const db = await getDB();
        return db.getAll('tasks');
    },

    // Mutation Queue
    async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp'>) {
        const db = await getDB();
        const item: QueuedRequest = {
            ...request,
            timestamp: Date.now(),
        };
        await db.add('mutationQueue', item);
    },

    async getQueue(): Promise<QueuedRequest[]> {
        const db = await getDB();
        return db.getAll('mutationQueue');
    },

    async removeFromQueue(id: number) {
        const db = await getDB();
        await db.delete('mutationQueue', id);
    },

    async clearQueue() {
        const db = await getDB();
        await db.clear('mutationQueue');
    }
};
