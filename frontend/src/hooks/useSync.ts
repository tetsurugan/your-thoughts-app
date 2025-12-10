import { useState, useEffect } from 'react';
import { offlineStorage } from '../services/offlineStorage';
import { useAuth } from '../context/AuthContext';
import { useTasks } from './useTasks';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const useSync = () => {
    const { token } = useAuth();
    const { fetchTasks } = useTasks();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncConnection();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const syncConnection = async () => {
        if (!navigator.onLine || !token) return;

        console.log('Starting sync...');
        setIsSyncing(true);
        try {
            const queue = await offlineStorage.getQueue();
            if (queue.length === 0) {
                console.log('Queue empty, nothing to sync.');
                setIsSyncing(false);
                return;
            }

            console.log(`Syncing ${queue.length} items...`);

            // Sort by timestamp to preserve order
            const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

            for (const item of sortedQueue) {
                try {
                    const res = await fetch(`${API_BASE}${item.url}`, {
                        method: item.method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: item.body ? JSON.stringify(item.body) : undefined
                    });

                    if (res.ok) {
                        // If successful, remove from queue
                        if (item.id) await offlineStorage.removeFromQueue(item.id);
                    } else {
                        console.error('Failed to sync item:', item);
                        // Optional: Retry logic or keep in queue if 500 error
                        // For MVP: keep in queue if network error, remove if 4xx (bad request) to avoid stuck queue
                        if (res.status >= 400 && res.status < 500) {
                            if (item.id) await offlineStorage.removeFromQueue(item.id);
                        }
                    }
                } catch (err) {
                    console.error('Network error during sync:', err);
                    // Stop syncing if network drops again
                    break;
                }
            }

            // Refresh tasks after sync
            await fetchTasks();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Attempt initial sync on mount
    useEffect(() => {
        if (isOnline) {
            syncConnection();
        }
    }, [token, isOnline]);

    return { isOnline, isSyncing, syncConnection };
};
