import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface Folder {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    isSystem: boolean;
    taskCount: number;
}

export const useFolders = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    const fetchFolders = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/folders`);
            if (res.ok) {
                const data = await res.json();
                setFolders(data);
            }
        } catch (err) {
            console.error('Failed to fetch folders:', err);
        } finally {
            setLoading(false);
        }
    };

    const createFolder = async (name: string, icon?: string, color?: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon, color })
            });
            if (res.ok) {
                const folder = await res.json();
                setFolders(prev => [...prev, { ...folder, taskCount: 0 }]);
                return folder;
            }
        } catch (err) {
            console.error('Failed to create folder:', err);
        }
        return null;
    };

    const deleteFolder = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/folders/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setFolders(prev => prev.filter(f => f.id !== id));
                return true;
            }
        } catch (err) {
            console.error('Failed to delete folder:', err);
        }
        return false;
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    return {
        folders,
        loading,
        selectedFolder,
        setSelectedFolder,
        createFolder,
        deleteFolder,
        refetch: fetchFolders
    };
};
