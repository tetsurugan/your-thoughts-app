import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { offlineStorage } from '../services/offlineStorage';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    createdAt: string;
    dueAt?: string;
    category: string;
    sourceType: 'text' | 'voice';
    googleEventId?: string | null;
    subtasks?: { id: string; label: string; done: boolean }[];
    requiresClarification?: boolean;
    isRecurring?: boolean;
    recurrenceInterval?: string | null;
}

export const useTasks = () => {
    const api = useApi();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getTasks();
            setTasks(data);
            setIsOfflineMode(false);
            // Cache tasks for offline use
            await offlineStorage.saveTasks(data);
        } catch (err: any) {
            console.warn('Failed to fetch tasks, trying offline cache:', err);
            try {
                const cached = await offlineStorage.getCachedTasks();
                if (cached.length > 0) {
                    setTasks(cached as Task[]);
                    setIsOfflineMode(true);
                    // Don't set error if we successfully loaded cache, just offline mode
                } else {
                    setError('Failed to load tasks and no offline cache available.');
                }
            } catch (cacheErr) {
                console.error('Cache read failed:', cacheErr);
                setError('Failed to load tasks.');
            }
        } finally {
            setLoading(false);
        }
    }, [api]);

    return {
        tasks,
        loading,
        error,
        isOfflineMode,
        fetchTasks,
        setTasks // Exposing setTasks for optimistic updates potentially
    };
};
