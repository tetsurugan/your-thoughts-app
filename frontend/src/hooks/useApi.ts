import { useState } from 'react';
import { offlineStorage } from '../services/offlineStorage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTasks = async (scope: string = 'today') => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/tasks?scope=${scope}`);
            if (!res.ok) throw new Error('Failed to fetch tasks');
            return await res.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createTaskFromIntent = async (text: string, sourceType: 'text' | 'voice' = 'text', recurrenceOptions?: { isRecurring: boolean, recurrenceInterval: string }) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    sourceType,
                    ...(recurrenceOptions && { ...recurrenceOptions })
                })
            });
            if (!res.ok) throw new Error('Failed to create task');
            return await res.json();
        } catch (err: any) {
            console.warn('Network request failed, adding to offline queue', err);
            try {
                // Queue the request
                await offlineStorage.addToQueue({
                    url: '/api/intent',
                    method: 'POST',
                    body: {
                        text,
                        sourceType,
                        ...(recurrenceOptions && { ...recurrenceOptions })
                    }
                });
                // Throw specific error for UI to handle "optimistically" or show "Queued" state
                throw new Error('OFFLINE_QUEUED');
            } catch (queueErr) {
                setError(err.message);
                throw err;
            }
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (id: string, updates: any) => {
        try {
            const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update task');
            return await res.json();
        } catch (err: any) {
            console.warn('Network request failed, adding to offline queue', err);
            try {
                await offlineStorage.addToQueue({
                    url: `/api/tasks/${id}`,
                    method: 'PATCH',
                    body: updates
                });
                // Return empty success-like object or throw special error
                throw new Error('OFFLINE_QUEUED');
            } catch (queueErr) {
                setError(err.message);
                throw err;
            }
        }
    };

    const connectGoogleCalendar = () => {
        window.location.href = `${API_BASE}/api/calendar/google/connect`;
    };

    const addTaskToCalendar = async (taskId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/calendar/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to add to calendar');
            }
            return await res.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeTaskFromCalendar = async (taskId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/calendar/events/${taskId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to remove from calendar');
            }
            return await res.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadDocument = async (file: File) => {
        setLoading(true);
        try {
            // 1. Init Upload (Sign URL)
            const initRes = await fetch(`${API_BASE}/api/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, type: file.type })
            });
            if (!initRes.ok) throw new Error('Failed to init upload');
            const { documentId, uploadUrl, key } = await initRes.json();
            console.log('Signed URL:', uploadUrl); // Stub: in real app we PUT to this

            return { documentId, key };
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const parseDocument = async (documentId: string, key: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/documents/${documentId}/parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
            if (!res.ok) throw new Error('Failed to parse document');
            return await res.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const breakdownTask = async (taskId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/tasks/${taskId}/breakdown`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to break down task');
            return await res.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleSubtask = async (subtaskId: string, done: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/api/subtasks/${subtaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ done })
            });
            if (!res.ok) throw new Error('Failed to toggle subtask');
            return await res.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        loading,
        error,
        getTasks,
        createTaskFromIntent,
        updateTask,
        connectGoogleCalendar,
        addTaskToCalendar,
        removeTaskFromCalendar,
        uploadDocument,
        parseDocument,
        breakdownTask,
        toggleSubtask
    };
};
